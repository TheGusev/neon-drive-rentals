import type { BookingTariff } from "@/types/domain";

export interface TariffInfo {
  id: BookingTariff;
  title: string;
  description: string;
  multiplier: number;
}

export const tariffs: TariffInfo[] = [
  { id: "city", title: "Город", description: "В пределах Новосибирска", multiplier: 1 },
  { id: "region", title: "НСО", description: "Новосибирская область", multiplier: 1.15 },
  { id: "outside", title: "За пределы", description: "Другие регионы", multiplier: 1.35 },
];

export const DELIVERY_PRICE = 1500;

export const getTariff = (id: BookingTariff) => tariffs.find((t) => t.id === id) ?? tariffs[0];
