/** Единый источник правды по условиям аренды NSK-RENT. */
export const RENTAL_TERMS = {
  /** Минимальный страховой депозит, ₽. */
  deposit: 2000,
  /** Минимальный возраст водителя, лет. */
  minAge: 21,
  /** Минимальный водительский стаж, лет. */
  minExperience: 3,
  /** Лимит пробега, км/сутки. */
  mileagePerDay: 300,
  /** Стоимость сверхлимитного километра, ₽. */
  extraKmPrice: 8,
  /** Базовая цена по городу, ₽/сутки. */
  priceCity: 1800,
  /** Базовая цена по тарифу «За город», ₽/сутки. */
  priceIntercity: 2000,
  address: "Новосибирск, ул. Доватора, 11",
} as const;

export const DEPOSIT = RENTAL_TERMS.deposit;

export const formatRubShort = (v: number) => `${v.toLocaleString("ru-RU")} ₽`;
