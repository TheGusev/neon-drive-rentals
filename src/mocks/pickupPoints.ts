export interface PickupPoint {
  id: string;
  title: string;
  address: string;
  hours: string;
  mapUrl: string;
}

/** Единственный пункт выдачи NSK-RENT. Доставки нет — только самовывоз. */
export const PICKUP_POINT: PickupPoint = {
  id: "dovatora",
  title: "Пункт выдачи NSK-RENT",
  address: "Новосибирск, ул. Доватора, 11",
  hours: "Круглосуточно, по предварительной записи",
  mapUrl: "https://yandex.ru/maps/?text=Новосибирск, улица Доватора, 11",
};

export const pickupPoints: PickupPoint[] = [PICKUP_POINT];

export const getPickupPoint = (_id?: string) => PICKUP_POINT;
