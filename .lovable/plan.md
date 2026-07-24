## Prompt 3 — Catalog `/cars` and Car detail `/cars/$carId`

### 1. Extend the domain model
Add fields to `Car` in `src/types/domain.ts` (all optional-friendly, defaulted in mocks):
- `rating: number` (0–5, one decimal)
- `engineVolume: number` (литры, e.g. 0.66)
- `bodyType?: string` ("хэтчбек", "универсал")
- `seats?: number`
- `deposit?: number` (руб)
- `mileageLimit?: number` (км/сутки, 0 = без лимита)
- `fuelPolicy?: string` ("полный → полный")

Populate these values for all 8 cars in `src/mocks/cars.ts`. Reuse the existing `src/assets/hero-car.jpg` as the shared image (no new generation) — we can swap per-car photos later.

### 2. Catalog page (`src/routes/_public.cars.index.tsx`)
Replace stub with a full page:

**Layout**
- Page header: h1 "Каталог автомобилей", counter "Найдено N авто", sort select (по цене ↑↓, по рейтингу).
- Filters bar (`src/components/catalog/CatalogFilters.tsx`):
  - Класс (checkbox group: econom / sport / premium)
  - Коробка (checkbox group: AT / MT / CVT)
  - Диапазон цены (shadcn `Slider`, min–max from mocks)
  - Даты аренды (два `Popover + Calendar`, reused DateField from home)
  - Кнопка "Сбросить"
- Desktop (`md:`): filter row sticky at top, 3-column card grid (`lg:grid-cols-3`, `md:grid-cols-2`), dark cards with neon price.
- Mobile: filter bar collapses into a "Фильтры" button that opens a shadcn `Sheet` (bottom) with the same controls; cards render as single-column vertical list on white background.

**Card component** (`src/components/catalog/CarCard.tsx`)
- Image (4:3), class badge, rating with `Star` icon top-right on image.
- Body: brand + model, year, small spec row (engine volume L, power л.с., consumption л, transmission).
- Footer: price per day (neon-orange on desktop, primary on mobile) + "Подробнее" `Link` to `/cars/$carId`.
- Filtering is done via `useMemo` on local state; no data layer changes.

### 3. Car detail page (`src/routes/_public.cars.$carId.tsx`)
Replace stub. Read car via `getCarById(params.carId)`; if missing, throw `notFound()` and add `notFoundComponent`.

**Layout (2-column on desktop, stacked on mobile)**
- Left: hero image + thumbnails gallery (`src/components/car/CarGallery.tsx`) — for now show 4 thumbnails of the same hero image; click selects main.
- Right:
  - h1 brand + model + year, rating stars, class badge.
  - Price block: "от {price} ₽ / сутки" (neon-text on desktop).
  - CTA button "Забронировать" (large, `Link` to `/booking/$carId` with `params={{ carId }}`).
  - "Характеристики" list: engine volume, power, torque, consumption, transmission, seats, body type — two-column grid of label/value rows.
- Below columns, full-width sections:
  - **Календарь занятости** (`src/components/car/AvailabilityCalendar.tsx`): shadcn `Calendar` `mode="range"` disabled, `modifiers.booked` computed from `bookings` filtered by `carId` (start→end ranges) with a red highlight modifier style. Legend under it: "занято / свободно".
  - **Условия аренды** card: mileage limit, deposit, fuel policy, min age 21, водительский стаж 2 года. Rendered as a grid of small info cards with lucide icons.

### 4. Head meta
- `/cars`: title "Каталог японских авто в аренду — NSK-RENT", matching description, og:title/description, canonical `/cars`.
- `/cars/$carId`: dynamic title `${brand} ${model} ${year} — аренда в Новосибирске`, description mentioning price; canonical `/cars/${carId}`; og:type=product.

### 5. Out of scope
- No real availability API; occupied dates come from `src/mocks/bookings.ts`.
- Booking form / payment stay stubs.
- No new image assets — all cards and galleries reuse `hero-car.jpg`.
- No admin changes.
