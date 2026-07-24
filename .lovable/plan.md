## Промт 4 — Бронирование, оплата, договор

Реализуем три связанные страницы в теме `clean-light` с фокусом на мобильную вёрстку (375–430px), но адаптивные вверх до десктопа. Общий визуал: карточки-секции с `rounded-3xl` (24px), фон секций `#f5f7fb`, акцент кнопок `#2f80ed`.

### 1. Общая база

- Добавить в `src/styles.css` семантические токены для этой секции (в `clean-light` теме): `--surface-soft: #f5f7fb`, `--accent-blue: #2f80ed`, `--accent-blue-hover`. Использовать только через `bg-[hsl(var(--surface-soft))]` / утилиты, без хардкода в компонентах.
- Расширить `src/types/domain.ts`: у `Booking` добавить `pickupPoint`, `deliveryAddress?`, `tariff: "city" | "region" | "outside"`, `startTime`, `endTime`, `paymentMethod?`, `signed?`.
- Создать `src/mocks/pickupPoints.ts` (3–4 точки выдачи по Новосибирску) и `src/mocks/tariffs.ts` (коэффициенты «город / НСО / за пределы НСО»).
- Ввести лёгкий стор бронирования `src/lib/bookingDraft.ts` (React context + `useReducer`, хранение в `sessionStorage`), чтобы данные между /booking → /payment → /contract переносились без бэка.

### 2. Компоненты (`src/components/checkout/`)

- `SectionCard.tsx` — обёртка секции (24px радиус, мягкий фон, заголовок, padding).
- `StickyBottomBar.tsx` — липкая нижняя панель с ценой и основной кнопкой (мобильный CTA).
- `PaymentMethodRadio.tsx` — карточки-радио с иконками (Карта, СБП) через `lucide-react` + брендовые SVG-моноцветные значки.
- `PriceSummary.tsx` — детализация: `аренда N сут × цена`, залог, итого.

### 3. `/booking/:carId` (`src/routes/_public.booking.$carId.tsx`)

Секции сверху вниз:
1. Мини-карточка авто (фото 72px, марка/модель, цена/сутки).
2. «Даты и время» — два поля даты (shadcn `Popover + Calendar`, `pointer-events-auto`) + два поля времени (`<input type="time">`).
3. «Точка выдачи» — список радио-карточек из `pickupPoints`.
4. «Доставка по адресу» — `Switch` + текстовое поле адреса (появляется при включении, добавляет доп. стоимость).
5. «Тариф» — сегментированный переключатель `Город / НСО / За пределы НСО`.
6. Live-расчёт через `useMemo`: `дни × цена × коэффициент тарифа + доставка`.
7. `StickyBottomBar`: сумма + кнопка «Перейти к оплате» → `navigate("/payment/$bookingId", { params: { bookingId: draftId } })`.

Валидация через `zod` + `react-hook-form`, кнопка `disabled` пока форма невалидна.

### 4. `/payment/:bookingId` (`src/routes/_public.payment.$bookingId.tsx`)

- Загрузка драфта из `bookingDraft` (в лоадере — по `bookingId` из `sessionStorage`; при отсутствии → `notFound()`).
- Верх: карточка авто (фото + модель + даты аренды).
- `PriceSummary`: строки `аренда N × цена`, `залог` (отдельно), `итого`.
- `PaymentMethodRadio`: «Банковская карта», «СБП» (radio-group, крупные тач-таргеты).
- `StickyBottomBar`: кнопка «Оплатить {сумма} ₽» → сохраняет метод в драфт и `navigate("/contract/$bookingId")`.
- Секция «Вы получите»: три пункта с иконками (чек на email, договор, инструкция).

### 5. `/contract/:bookingId` (`src/routes/_public.contract.$bookingId.tsx`)

- Секция «Резюме аренды» — даты, точка, тариф, итог.
- Секция «Данные автомобиля» — VIN, госномер (добавить в `Car` mock, если нет).
- Три `Checkbox`: условия договора, корректность данных, согласие на ПЭП.
- Поле SMS-кода: 6 отдельных `input` (одна цифра) с автопереходом фокуса, подсказка `«Код отправлен на +7 *** ** {last2}»`. Реализовать как `SmsCodeInput.tsx`.
- Кнопка «Подписать договор» — активна, когда все чекбоксы + 6 цифр; при клике — тост «Договор подписан» и переход на `/profile`.
- Внизу: ссылка «Скачать договор PDF» (`FileText` иконка) — заглушка `href="#"` с `download`.

### 6. SEO

Обновить `head()` каждой из трёх страниц с уникальными title/description/og. `og:image` не добавляем (нет осмысленной картинки).

### Технические детали

- Все три страницы обёрнуты в `<div className="min-h-screen bg-background">` c внутренним `container max-w-xl mx-auto px-4 py-6 space-y-4` — это даёт мобильный фокус, но нормально смотрится на десктопе.
- Тема: переопределяем на страницах через класс `clean-light` на root-обёртке роутов (обход `md:public-dark` из `_public.tsx`) — либо оборачиваем содержимое в `<div className="clean-light">…</div>`, чтобы токены переключились независимо от брейкпоинта.
- Используем существующие shadcn компоненты: `Button`, `Input`, `Calendar`, `Popover`, `RadioGroup`, `Checkbox`, `Switch`, `Sheet` не нужен.
- Никакой бизнес-логики оплаты/ЮKassa/подписи — только UI и локальный state; интеграции — в следующих промтах.
