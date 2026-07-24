## 1. Кнопка меню на мобильной главной

Файл: `src/components/layout/PublicLayout.tsx`
- Увеличить триггер меню: с `h-10 w-10` до `h-12 w-12`, иконку `Menu` до `h-6 w-6`.
- Сделать её более заметной на тёмном hero: полупрозрачный фон `bg-background/70 backdrop-blur`, рамка `border-accent/40`, неоновая тень `shadow-[0_0_18px_color-mix(in_oklab,var(--neon-blue)_45%,transparent)]`.
- Добавить лёгкую пульсацию (attention animation) — новая утилита `menu-pulse` в `src/styles.css` (opacity + box-shadow, 2.4s infinite), останавливается при hover/active.
- z-index поднять, чтобы не перекрывалась hero-градиентом.

## 2. Кнопка «Назад» на странице авто

Файл: `src/routes/_public.cars.$carId.tsx`
- В самом верху контента (над галереей/заголовком) добавить компактную кнопку `← Назад` в темной неон-стилистике, работающую и на мобилке, и на десктопе.
- Логика: `const router = useRouter(); router.history.back()`. Fallback — `<Link to="/cars">К каталогу</Link>` если истории нет (`window.history.length <= 1`).
- Скрывать fallback-логику в обычном `<button>` с ARIA-label.

## 3. PWA — только установка на экран

Скоуп: manifest + иконки + мета-теги. Без service worker, без офлайна (согласно PWA-скиллу).

Новые файлы:
- `public/manifest.webmanifest` — имя «NSK-RENT», short_name «NSK-RENT», `display: "standalone"`, `background_color: "#0a0a0f"`, `theme_color: "#0a0a0f"`, `start_url: "/"`, `scope: "/"`, `orientation: "portrait"`, иконки 192/512 + maskable.
- `public/icon-192.png`, `public/icon-512.png`, `public/icon-maskable-512.png` — сгенерировать через imagegen (квадратный неон-знак «NSK» на тёмном фоне, читабельно на 48px).
- `public/apple-touch-icon.png` (180×180) — тот же знак без прозрачности.

Правка `src/routes/__root.tsx`:
- В `head().links` добавить: `manifest`, `apple-touch-icon`.
- В `head().meta` добавить: `theme-color` (#0a0a0f), `apple-mobile-web-app-capable=yes`, `apple-mobile-web-app-status-bar-style=black-translucent`, `apple-mobile-web-app-title=NSK-RENT`, `viewport` с `viewport-fit=cover` (сохранив существующий width/initial-scale).

Правка `src/styles.css`:
- Использовать `env(safe-area-inset-*)` для sticky-header (padding-top) и BottomNav (padding-bottom), чтобы контент не заходил под «челку» и home-indicator в standalone-режиме.

Явно НЕ делаем: `vite-plugin-pwa`, `public/sw.js`, регистрацию service worker, кеширование — по правилам скилла и выбранному скоупу «только установка».

## Проверка

- Мобилка (393×626): кнопка меню видна на фоне hero, пульсирует; открывается Sheet.
- `/cars/honda-nbox`: сверху есть «← Назад», возвращает на предыдущий экран.
- `/manifest.webmanifest` отдаётся; Chrome DevTools → Application → Manifest без ошибок; в iOS Safari «На экран Домой» подставляет иконку и имя.
