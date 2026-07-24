## Цель этапа 1

Собрать пустой каркас проекта на текущем стеке (TanStack Start + React + Tailwind v4): все роуты, две темы, два layout-а (публичный и админский), мок-данные. Без наполнения экранов — заглушки с заголовком страницы. Наполнение и логика — следующими промтами.

## Дизайн-темы (Tailwind v4, `src/styles.css`)

Одна тема выбирается по media query (breakpoint) на публичных роутах, админка всегда светлая деловая.

- **public-dark** (десктоп, публичная часть, ≥ `md`):
  - `--background: #0a0e1a`, `--card: #131826`
  - акценты `--neon-blue: #2f80ed`, `--neon-orange: #ff6b00`
  - крупные заголовки с letter-spacing, мягкое свечение (box-shadow blur), скошенные углы у кнопок, тонкие неоновые разделители
  - шрифты: Inter/Montserrat через `<link>` в `__root.tsx`
- **clean-light** (мобилка публичной части < `md`, вся админка):
  - `--background: #ffffff`, `--card: #f5f7fb`
  - акценты синий `#2f80ed`, зелёный `#22c55e` для статусов
  - скругления 20–24px, Inter, без эффектов

Реализация: класс `public-dark` навешивается через CSS-переменные внутри `@media (min-width: 768px)` на `<html>` только для публичных страниц; на роутах `/admin/*` всегда `clean-light`. Токены регистрируются в `@theme inline`, чтобы работали утилиты `bg-card`, `text-neon-blue` и т.п.

## Структура роутов (`src/routes/`)

Публичные (PublicLayout — Header + Footer):
- `index.tsx` → `/`
- `cars.index.tsx` → `/cars`
- `cars.$carId.tsx` → `/cars/:carId`
- `booking.$carId.tsx` → `/booking/:carId`
- `payment.$bookingId.tsx` → `/payment/:bookingId`
- `contract.$bookingId.tsx` → `/contract/:bookingId`
- `profile.tsx` → `/profile`

Админские (AdminLayout — сайдбар, светлая тема):
- `admin.tsx` — layout с `<Outlet />` и sidebar (shadcn Sidebar)
- `admin.index.tsx` → `/admin` (Дашборд)
- `admin.cars.tsx` → `/admin/cars`
- `admin.bookings.tsx` → `/admin/bookings`
- `admin.clients.tsx` → `/admin/clients`
- `admin.finance.tsx` → `/admin/finance`
- `admin.settings.tsx` → `/admin/settings`

Каждая страница — заглушка: `<h1>Название</h1>` + короткая подсказка «наполнение в следующем промте». У каждого роута отдельный `head()` с уникальными title/description/og.

## Layouts и общие компоненты

- `src/components/layout/PublicLayout.tsx` — Header (лого RentSib, навигация: Главная, Автомобили, Услуги, О нас, Контакты, телефон, Логин), Footer
- `src/components/layout/AdminLayout.tsx` — sidebar (shadcn `Sidebar` с `collapsible="icon"`), верхний бар с `SidebarTrigger`
- Header/Sidebar подсвечивают активный роут через `useRouterState`
- Респонсив-правила: `grid-cols-[minmax(0,1fr)_auto]` в шапках, `min-w-0`/`truncate`/`shrink-0`

## Мок-данные (`src/mocks/`)

Плоские TypeScript-модули (не БД, не серверные функции):
- `cars.ts` — 8 машин (Honda N-BOX, Suzuki Alto Works, Daihatsu Move Custom, Nissan Dayz, Mazda Flair Wagon, Mitsubishi eK Sport, Subaru Stella, Suzuki Wagon R): id, марка, модель, год, класс, мощность, крутящий момент, расход, КПП, цена/сутки, изображение-заглушка
- `bookings.ts` — 3 активные брони (клиент, авто, даты, статус оплаты)
- `clients.ts` — 4 клиента (имя, телефон, кол-во заказов, рейтинг)
- `dashboardStats.ts` — брони сегодня, выручка, статус автопарка

Типы в `src/types/domain.ts`. Никаких fetch/react-query — заглушки импортируют напрямую.

## Изображения

На этапе каркаса — плейсхолдеры (`bg-muted` блок с иконкой машины). Реальные изображения авто генерируем на следующем этапе, когда наполняем каталог.

## Индекс

`src/routes/index.tsx` полностью переписываем (убираем blank-page placeholder) — простая заглушка hero-секции с заголовком «RentSib — Drive the Night» и подсказкой, что содержимое придёт следующим промтом.

## Что НЕ делаем на этом этапе

- Не подключаем Lovable Cloud / БД / auth
- Не реализуем формы бронирования, оплату, подписание, ЮKassa
- Не наполняем экраны — только заголовки-заглушки
- Не подключаем реальные картинки авто
- Не делаем GitHub/Beget/CI — это последующие этапы

## Технические детали

- Стек уже готов: TanStack Start + React 19 + Tailwind v4 + shadcn. React Router / Vite-only из промта пользователя не применяем — используем текущий шаблон.
- Роуты именуются в flat-стиле (`cars.$carId.tsx`), `createFileRoute("/cars/$carId")`.
- Шрифты подключаем `<link>` в `__root.tsx` head (Tailwind v4 запрещает `@import` URL в CSS).
- Токены цветов — `@theme inline` в `src/styles.css`, поверх существующих shadcn-переменных добавляем `--neon-blue`, `--neon-orange`, тёмные фоны для `.public-dark`.
- Переключение темы: в `PublicLayout` навешиваем класс `public-dark md:public-dark` на корневой div; в CSS `.public-dark { --background: ...; ... }` активируется только при `min-width: 768px` через `@media` вложение.

## Итог этапа

Прокликиваемый каркас со всеми роутами, двумя темами, публичным и админским layout-ом, мок-данными в модулях. Готово к следующему промту — наполнению главной и каталога контентом.
