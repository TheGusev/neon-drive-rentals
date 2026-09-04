# Деплой NSK-RENT на VPS (nsk-rent.ru)

Стек на сервере: Node 20+, PostgreSQL 14+, nginx, pm2.
Каталог приложения: `/var/www/nsk-rent`.

## 0. Разовая настройка

```bash
sudo apt update && sudo apt install -y nginx postgresql
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs
sudo npm i -g pm2 bun
```

Файл окружения `/var/www/nsk-rent/.env` (600, владелец — пользователь приложения):

```
DATABASE_URL=postgres://nskrent:ПАРОЛЬ@127.0.0.1:5432/nskrent
ADMIN_PASSWORD=<сложный пароль админки>
SESSION_SECRET=<32+ случайных символа>
YOOKASSA_SHOP_ID=<из личного кабинета ЮKassa>
YOOKASSA_SECRET_KEY=<из личного кабинета ЮKassa>
SITE_URL=https://nsk-rent.ru
NODE_ENV=production
PORT=3000
```

## 1. nginx

```bash
sudo cp /var/www/nsk-rent/deploy/nginx-nsk-rent.conf /etc/nginx/sites-available/nsk-rent.ru
sudo ln -sf /etc/nginx/sites-available/nsk-rent.ru /etc/nginx/sites-enabled/nsk-rent.ru
sudo nginx -t
sudo systemctl reload nginx
```

Что даёт конфиг: gzip для JS/CSS/JSON (бандл ~880 КБ → ~250 КБ), HTTP/2,
редирект `www` → апекс, годовой кэш `/assets/`, 30-дневный кэш фото авто
(`/api/public/car-photo/...`), увеличенные таймауты и буферы proxy,
`client_max_body_size 25m` для загрузки фото из админки.

Сертификат (если ещё нет):

```bash
sudo certbot --nginx -d nsk-rent.ru -d www.nsk-rent.ru
```

## 2. Обновление кода

```bash
cd /var/www/nsk-rent
bash deploy/deploy.sh
```

Скрипт делает: `git pull` → `bun install --frozen-lockfile` → `bun run build`
→ `pm2 restart nsk-rent` (или первый `pm2 start`) → health-проверка.

Вручную то же самое:

```bash
cd /var/www/nsk-rent
git pull origin main
bun install --frozen-lockfile
bun run build
pm2 restart nsk-rent --update-env || pm2 start .output/server/index.mjs --name nsk-rent
pm2 save
```

## 3. Миграции базы

Отдельная команда не нужна: при старте сервера `src/lib/migrations.server.ts`
применяет недостающие миграции из `db/migrations/` по порядку, фиксируя их в
таблице `schema_migrations`. Все миграции идемпотентны. Последняя —
`016_rental_journey.sql` (выдача ключей, возврат, таблица `car_reviews`).

Проверить, что применилось:

```bash
psql "$DATABASE_URL" -c "select name, applied_at from schema_migrations order by name"
```

## 4. Проверка после деплоя

```bash
curl -sI https://nsk-rent.ru | head -20                   # 200 + HTTP/2
curl -s https://nsk-rent.ru/api/public/health | head       # ok + количество авто
curl -sI -H 'Accept-Encoding: gzip' https://nsk-rent.ru/assets/<file>.js | grep -i encoding
curl -sI https://www.nsk-rent.ru | head -3                 # 301 на апекс
```

Ручной чек-лист: мобильная главная, `/cars` (фильтры и даты), `/booking/:id`,
`/profile`, `/admin/login` → дашборд, добавление авто с фото.

## 5. Резервные копии

```bash
# ежедневный дамп в 03:30
30 3 * * * pg_dump "$DATABASE_URL" | gzip > /var/backups/nskrent-$(date +\%F).sql.gz
```

Хранить 14 дней, раз в месяц проверять восстановление на тестовой базе.

## 6. Диагностика

| Симптом | Где смотреть |
|---|---|
| 502 | `pm2 logs nsk-rent`, приложение не поднялось / упал `DATABASE_URL` |
| Сайт медленный на мобильных | заголовок `content-encoding: gzip`, HTTP/2 |
| Нет фото | `psql -c "select count(*) from car_photos"`, логи `/api/public/car-photo` |
| Не открывается админка | переменная `ADMIN_PASSWORD`, `pm2 restart nsk-rent --update-env` |
| Миграция не применилась | `pm2 logs nsk-rent | grep migrations` |
