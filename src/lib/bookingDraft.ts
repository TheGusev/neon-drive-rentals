import type { BookingDraft, BookingTariff, PaymentMethod } from "@/types/domain";

const KEY_PREFIX = "nsk-rent.booking.";
const LIST_KEY = "nsk-rent.booking.list";

function safeSession(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function generateId(): string {
  return "dr-" + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
}

export function createDraft(carId: string, overrides: Partial<BookingDraft> = {}): BookingDraft {
  const id = generateId();
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const dayAfter = new Date(now);
  dayAfter.setDate(now.getDate() + 3);
  const iso = (d: Date) => d.toISOString().slice(0, 10);

  const draft: BookingDraft = {
    id,
    carId,
    startDate: iso(tomorrow),
    endDate: iso(dayAfter),
    startTime: "10:00",
    endTime: "10:00",
    delivery: false,
    tariff: "city",
    phone: "+7 999 123 45 67",
    ...overrides,
  };
  saveDraft(draft);
  return draft;
}


export function saveDraft(draft: BookingDraft): void {
  const s = safeSession();
  if (!s) return;
  s.setItem(KEY_PREFIX + draft.id, JSON.stringify(draft));
  const list = getDraftList();
  if (!list.includes(draft.id)) {
    list.push(draft.id);
    s.setItem(LIST_KEY, JSON.stringify(list));
  }
}

export function getDraft(id: string): BookingDraft | null {
  const s = safeSession();
  if (!s) return null;
  const raw = s.getItem(KEY_PREFIX + id);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BookingDraft;
  } catch {
    return null;
  }
}

export function updateDraft(id: string, patch: Partial<BookingDraft>): BookingDraft | null {
  const current = getDraft(id);
  if (!current) return null;
  const next = { ...current, ...patch };
  saveDraft(next);
  return next;
}

function getDraftList(): string[] {
  const s = safeSession();
  if (!s) return [];
  const raw = s.getItem(LIST_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function daysBetween(startDate?: string, endDate?: string): number {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff);
}

export interface PriceBreakdown {
  days: number;
  pricePerDay: number;
  tariff: BookingTariff;
  tariffMultiplier: number;
  rental: number;
  delivery: number;
  deposit: number;
  total: number;
}

export function calcPrice(params: {
  pricePerDay: number;
  deposit: number;
  draft: Pick<BookingDraft, "startDate" | "endDate" | "tariff" | "delivery">;
  deliveryPrice: number;
  tariffMultiplier: number;
}): PriceBreakdown {
  const days = daysBetween(params.draft.startDate, params.draft.endDate);
  const rental = Math.round(days * params.pricePerDay * params.tariffMultiplier);
  const delivery = params.draft.delivery ? params.deliveryPrice : 0;
  return {
    days,
    pricePerDay: params.pricePerDay,
    tariff: params.draft.tariff,
    tariffMultiplier: params.tariffMultiplier,
    rental,
    delivery,
    deposit: params.deposit,
    total: rental + delivery + params.deposit,
  };
}

export function formatRub(n: number): string {
  return n.toLocaleString("ru-RU") + " ₽";
}

export type { PaymentMethod };
