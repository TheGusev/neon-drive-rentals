import type { Car } from "@/types/domain";

const base = {
  bodyType: "хэтчбек",
  seats: 4,
  deposit: 5000,
  mileageLimit: 250,
  fuelPolicy: "полный → полный",
};

export const cars: Car[] = [
  { id: "honda-nbox", brand: "Honda", model: "N-BOX", year: 2017, class: "econom", power: 58, torque: 65, consumption: 3.8, transmission: "CVT", pricePerDay: 2400, rating: 4.8, engineVolume: 0.66, ...base },
  { id: "suzuki-alto-works", brand: "Suzuki", model: "Alto Works", year: 2017, class: "sport", power: 64, torque: 100, consumption: 4.2, transmission: "AT", pricePerDay: 2200, rating: 4.7, engineVolume: 0.66, ...base, seats: 4, deposit: 7000 },
  { id: "daihatsu-move-custom", brand: "Daihatsu", model: "Move Custom", year: 2018, class: "econom", power: 64, torque: 92, consumption: 4.4, transmission: "CVT", pricePerDay: 2300, rating: 4.6, engineVolume: 0.66, ...base },
  { id: "suzuki-wagon-r", brand: "Suzuki", model: "Wagon R Stingray", year: 2016, class: "econom", power: 64, torque: 95, consumption: 4.6, transmission: "CVT", pricePerDay: 2200, rating: 4.5, engineVolume: 0.66, ...base },
  { id: "nissan-dayz", brand: "Nissan", model: "Dayz Highway Star", year: 2019, class: "econom", power: 64, torque: 100, consumption: 4.3, transmission: "CVT", pricePerDay: 2500, rating: 4.9, engineVolume: 0.66, ...base, seats: 5 },
  { id: "mazda-flair-wagon", brand: "Mazda", model: "Flair Wagon", year: 2018, class: "econom", power: 52, torque: 60, consumption: 3.6, transmission: "CVT", pricePerDay: 2100, rating: 4.4, engineVolume: 0.66, ...base },
  { id: "mitsubishi-ek-sport", brand: "Mitsubishi", model: "eK Sport", year: 2017, class: "sport", power: 64, torque: 98, consumption: 4.1, transmission: "AT", pricePerDay: 2200, rating: 4.6, engineVolume: 0.66, ...base, deposit: 6000 },
  { id: "subaru-stella", brand: "Subaru", model: "Stella Custom", year: 2016, class: "econom", power: 64, torque: 94, consumption: 4.5, transmission: "CVT", pricePerDay: 2300, rating: 4.5, engineVolume: 0.66, ...base },
];

export const getCarById = (id: string) => cars.find((c) => c.id === id);
