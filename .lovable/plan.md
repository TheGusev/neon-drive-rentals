## Prompt 2 — Home page (Desktop NFS-neon + Mobile clean-light)

Build the `/` route content matching the reference screenshots: a full-screen neon hero with a fast-booking widget on desktop, and a compact light layout on mobile — via responsive CSS only (single route, no duplicate components).

### 1. Hero image asset
- Generate `src/assets/hero-car.jpg` — a Japanese kei-car (Suzuki Wagon R / Daihatsu Move-style) in a neon garage, cyan + orange rim lighting, dark background, cinematic NFS Underground aesthetic.

### 2. Home route (`src/routes/index.tsx`)
Replace the current stub with three sections composed as small local subcomponents inside one route file (or split into `src/components/home/` if it grows):

**a. Hero**
- Desktop (`md:` and up): full-viewport (`min-h-[100svh]`) with hero image as background, dark neon overlay, huge `NSK-RENT` wordmark using `neon-text` utility (font-display, tracking-wide), subtitle "Аренда японских кей-каров в Новосибирске", and a right-side **QuickBookingWidget** card floated to the right.
- Mobile (< md): hero image collapses to a shorter banner (`h-[60vh]`), no neon glow, dark→transparent gradient over image, plain white heading below on light background, vertical booking widget stacked under hero.

**b. QuickBookingWidget** (`src/components/home/QuickBookingWidget.tsx`)
- Fields: pickup date, return date, pickup location (select of 2–3 Nsk points), "Найти авто" CTA linking to `/cars`.
- Desktop: dark glass card with cyan neon border (`clip-notch`, `neon-glow`), horizontal-ish stacked inputs.
- Mobile: full-width white card, neutral border, vertical inputs, primary button.
- Uses shadcn `Input`, `Select`, `Button`, `Popover + Calendar` for dates. Purely presentational — CTA navigates via `Link`.

**c. Benefits section**
- 4 cards: Честные цены, Поддержка 24/7, Простое бронирование, Японское качество.
- Desktop: 4-column neon-outlined dark cards with `lucide-react` icons in neon-orange.
- Mobile: 1–2 column light cards with muted borders.

**d. Popular models carousel**
- Uses shadcn `Carousel` (embla) with first 6 entries from `src/mocks/cars.ts`.
- Card shows image, model, price/day, "Подробнее" link to `/cars/$carId`.
- Desktop: 3 visible slides, neon card style. Mobile: 1 slide per view, clean-light card style.

### 3. Responsive theming approach
- The `_public` layout already toggles `.public-dark` on `md:` and `.clean-light` on mobile via classes on the wrapper. Verify in `src/components/layout/PublicLayout.tsx` that the wrapper uses `clean-light md:public-dark`; adjust if not.
- All neon-only effects (glow, neon-text, dark backgrounds) are gated with `md:` prefixes so mobile stays neutral. No dark-mode class toggle needed — theme is purely breakpoint-driven, as already set up in `src/styles.css`.

### 4. SEO
- Update `head()` in `src/routes/index.tsx`: title "NSK-RENT — Аренда японских кей-каров в Новосибирске", matching description, og:title/description, og:type=website, twitter:card=summary_large_image. No og:image until the hero URL is hosted absolutely.

### Out of scope
- No real booking logic, no form validation beyond required fields, no admin changes, no route changes. Catalog page stays a stub — handled in the next prompt.
