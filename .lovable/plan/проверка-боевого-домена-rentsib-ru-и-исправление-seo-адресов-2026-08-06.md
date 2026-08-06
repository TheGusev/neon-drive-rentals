# Проверка боевого домена rentsib.ru и исправление SEO-адресов

## Что проверено сейчас

- `https://rentsib.ru/` отвечает 200 (nginx), отдаётся актуальная сборка: заголовок «Аренда авто в Новосибирске от 1 800 ₽/сутки — японские кей-кары | RentSib», герой-картинки и мета-описание совпадают с текущим кодом. Значит цепочка GitHub → сервер работает.
- Маршруты 200: `/`, `/cars`, `/blog`, `/rent/novosibirsk`, `/profile`, `/admin`, `/sitemap.xml`.
- `/robots.txt` отвечает 404 — файл на боевом сервере не отдаётся.
- Во всех SEO-полях зашит старый адрес `neon-drive-rental.lovable.app`: `og:url` на главной, все `<loc>` в `sitemap.xml`, а также JSON-LD и canonical, которые строятся из той же константы.

## Что предлагаю сделать

1. Перевести базовый адрес сайта на `https://rentsib.ru` — одной константой, чтобы canonical, `og:url`, JSON-LD (LocalBusiness, Article, FAQPage) и sitemap ссылались на боевой домен.
2. Починить `robots.txt`: отдавать его серверным маршрутом (как sitemap), с ссылкой `Sitemap: https://rentsib.ru/sitemap.xml`.
3. После правок перепроверить с боевого домена: canonical/og:url, содержимое `sitemap.xml`, ответ `robots.txt`.

## Технические детали

- `src/lib/seo.ts`: `SITE_URL` → `https://rentsib.ru`.
- `src/routes/sitemap[.]xml.ts`: `BASE_URL` брать из `SITE_URL`, не дублировать строку.
- Новый серверный маршрут `src/routes/robots[.]txt.ts`, возвращающий `text/plain` (текущий статический `public/robots.txt` на сервере не отдаётся).
- Публикация в Lovable не требуется для rentsib.ru — обновление идёт через GitHub → сервер; в Lovable-превью изменения появятся сразу.

## Вопрос по домену

Домен `rentsib.ru` теперь основной — при желании можно добавить редирект со старого `neon-drive-rental.lovable.app` на него, но это настраивается вне кода.
