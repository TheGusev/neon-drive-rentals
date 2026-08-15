# Подготовка сервера: структура, зависимости, БД и интеграции

## 1. Что сейчас в проекте

Стек: TanStack Start v1 + React 19 + TypeScript + Tailwind v4 + Vite 8, сборка через Nitro.

```text
src/
├── routes/            # файловый роутинг
│   ├── __root.tsx, index.tsx
│   ├── _public.*.tsx  # каталог, авто, бронирование, оплата, договор, профиль, блог, SEO, право
│   ├── _admin.*.tsx   # дашборд, авто, брони, клиенты, финансы, настройки
│   ├── admin.login.tsx
│   ├── api/public/version.ts
│   └── robots[.]txt.ts, sitemap[.]xml.ts
├── components/        # home, catalog, car, checkout, profile, admin, layout, seo, ui (shadcn)
├── data/              # mockCars.ts (21 авто), mockBookings.ts
├── mocks/             # клиенты, платежи, блог, FAQ, тарифы, пункт выдачи, уведомления
├── lib/               # adminGate.functions.ts, availability, bookingDraft, seo, contacts, build-info
├── hooks/, state/, types/domain.ts, styles.css
├── server.ts          # SSR-обёртка с обработкой ошибок
└── router.tsx, start.ts
public/                # иконки, manifest.webmanifest
.github/workflows/deploy.yml
```

Зависимости (production): React 19, TanStack Router/Start/Query, 27 пакетов Radix UI, Tailwind v4 + typography, embla-carousel, react-day-picker, react-hook-form + @hookform/resolvers, zod, date-fns, recharts, xlsx, sonner, vaul, cmdk, input-otp, react-markdown + remark-gfm, lucide-react, clsx/cva/tailwind-merge.
Dev: vite 8, nitro 3 (beta), typescript 5.8, eslint + prettier, @lovable.dev/vite-tanstack-config 2.13.1.

Бэкенд сейчас: только серверный вход в админку (`ADMIN_PASSWORD` + `SESSION_SECRET`, куки-сессия) и `/api/public/version`. Всё остальное — моки в браузере.

## 2. Что делаем на этом этапе (подготовка сервера)

### A. Сборка под VPS
Сейчас пресет Nitro по умолчанию целится в Cloudflare. Для Beget/Ubuntu переключаем сборку на `node-server`, чтобы получить `.output/server/index.mjs`, запускаемый под PM2. Проверяем локальный прод-запуск и `/api/public/version`.

### B. Инфраструктура сервера
- Ubuntu 22.04/24.04, Node 20+ (или Bun 1.1+), Nginx + Certbot, PM2.
- Каталог `/var/www/nsk-rent`, отдельный пользователь, SSH-ключ для GitHub Actions.
- Nginx: 80 → 443, прокси на `127.0.0.1:3000`, длинный кэш для хэшированной статики.
- PM2: `pm2 start .output/server/index.mjs --name nsk-rent`, `pm2 save`, `pm2 startup`.
- Секреты GitHub: `SSH_HOST`, `SSH_USER`, `SSH_KEY`, `SSH_PORT`, `DEPLOY_PATH`, `RESTART_COMMAND`.
- Проверка после деплоя: `curl https://nsk-rent.ru/api/public/version`.

### C. База данных
PostgreSQL 16 локально на VPS + отдельная роль и база. Схема первой версии:

```text
cars(id, slug, brand, model, year, class, transmission, seats, price_city, price_out, status, images[], specs jsonb)
clients(id, phone, name, email, created_at, blocked)
bookings(id, car_id, client_id, date_from, date_to, total, status, created_at)
payments(id, booking_id, provider, provider_id, amount, status, created_at)
otp_codes(id, phone, code_hash, expires_at, attempts)
admin_users(id, login, password_hash, role)
```
Миграции — обычные `.sql` файлы в `db/migrations/` + скрипт применения; клиент — `postgres`/`pg` в серверном слое.

### D. Слой доступа к данным
Заменяем моки на server functions (`*.functions.ts` + `*.server.ts`): каталог, карточка авто, доступность дат, создание брони, админ-CRUD. Моки остаются как сид для первичного наполнения БД.

### E. Интеграции
- **ЮKassa (ИП):** создание платежа из шага оплаты + вебхук `/api/public/yookassa` с проверкой подписи и идемпотентностью, статусы платежа в БД.
- **SMS-подтверждение:** отправка кода при бронировании/входе клиента, хранение хэша кода, лимиты попыток; провайдер выбираем при подключении.
- **Email-уведомления:** подтверждение брони клиенту и админу.
- **Резервные копии:** ежедневный `pg_dump` по cron с ротацией.

## 3. Переменные окружения

| Переменная | Назначение |
|---|---|
| `ADMIN_PASSWORD`, `SESSION_SECRET` | вход в админку (уже используются) |
| `DATABASE_URL` | подключение к PostgreSQL |
| `YOOKASSA_SHOP_ID`, `YOOKASSA_SECRET_KEY` | платежи |
| `SMS_API_KEY`, `SMS_SENDER` | отправка кодов |
| `SMTP_*` | письма |
| `VITE_BUILD_COMMIT`, `VITE_BUILD_TIME` | подставляет CI |

Все несекретные `VITE_*` попадают в клиент; остальные читаются только внутри серверных хендлеров.

## 4. Порядок работ

1. Переключить сборку на Node-сервер и проверить прод-запуск (делаю в коде).
2. Добавить каталог `db/` со схемой, миграциями и сид-скриптом из текущих моков.
3. Развернуть VPS: Node, Nginx, SSL, PM2, PostgreSQL, секреты, первый деплой по CI.
4. Перевести каталог и брони на БД через server functions.
5. Подключить SMS, затем ЮKassa с вебхуком, затем email.

## 5. Что нужно от вас

- Доступы к серверу (host, пользователь, порт) и подтверждение, что домен `nsk-rent.ru` уже указывает на VPS.
- Данные ЮKassa для ИП (shopId + секретный ключ) — добавим как секреты, не в код.
- Выбор SMS-провайдера (SMS.RU / SMSC / другой).
