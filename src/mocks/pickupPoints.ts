export interface PickupPoint {
  id: string;
  title: string;
  address: string;
  hours: string;
}

export const pickupPoints: PickupPoint[] = [
  { id: "krasny", title: "Красный проспект", address: "Красный пр., 86", hours: "08:00 – 22:00" },
  { id: "aeroport", title: "Аэропорт Толмачёво", address: "ул. Аэропорт, 3/4", hours: "круглосуточно" },
  { id: "vokzal", title: "Ж/д вокзал", address: "ул. Шамшурина, 43", hours: "07:00 – 23:00" },
  { id: "leninsky", title: "Ленинский район", address: "ул. Троллейная, 1", hours: "09:00 – 21:00" },
];

export const getPickupPoint = (id?: string) => pickupPoints.find((p) => p.id === id);
