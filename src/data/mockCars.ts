import type { Car } from "@/types/domain";

import nWgnGrey from "@/assets/cars/honda-n-wgn-grey.jpg";
import nWgnBlue from "@/assets/cars/honda-n-wgn-blue.jpg";
import nWgnBlack from "@/assets/cars/honda-n-wgn-black.jpg";
import nWgnTurboWhite from "@/assets/cars/honda-n-wgn-turbo-white.jpg";
import dayzGreen from "@/assets/cars/nissan-dayz-green.jpg";
import dayzGrey from "@/assets/cars/nissan-dayz-grey.jpg";
import dayzWhite from "@/assets/cars/nissan-dayz-white.jpg";
import dayzBlack from "@/assets/cars/nissan-dayz-black.jpg";
import ekWagonBlue from "@/assets/cars/mitsubishi-ek-wagon-blue.jpg";
import miraEsBlack from "@/assets/cars/daihatsu-mira-es-black.jpg";
import miraEsWhite from "@/assets/cars/daihatsu-mira-es-white.jpg";
import moveWhite from "@/assets/cars/daihatsu-move-white.jpg";
import miraWhite from "@/assets/cars/daihatsu-mira-white.jpg";
import nWgnGrey2018 from "@/assets/cars/honda-n-wgn-grey-2018.jpg";
import nWgnBlack2020 from "@/assets/cars/honda-n-wgn-black-2020.jpg";
import miraEsBlack2018 from "@/assets/cars/daihatsu-mira-es-black-2018.jpg";
import dayzHighwayStarWhite from "@/assets/cars/nissan-dayz-highway-star-white.jpg";
import altoWhite from "@/assets/cars/suzuki-alto-white.jpg";
import dayzBrownReal from "@/assets/cars/real/nissan-dayz-brown-real.jpg";
import nBoxBlackReal from "@/assets/cars/real/honda-n-box-black-real.jpg";
import nBoxBlackReal2 from "@/assets/cars/real/honda-n-box-black-real-2.jpg";
import nWgnWhiteReal from "@/assets/cars/real/honda-n-wgn-white-real.jpg";
import dayzWhiteReal from "@/assets/cars/real/nissan-dayz-white-real.jpg";

const base = {
  bodyType: "хэтчбек",
  seats: 4,
  deposit: 2000,
  mileageLimit: 300,
  fuelPolicy: "полный → полный",
  transmission: "AT" as const,
  engineVolume: 0.66,
  drive: "передний",
  class: "econom" as const,
  status: "free" as const,
};

type Row = Partial<Car> & Pick<Car, "id" | "brand" | "model" | "year" | "color" | "power" | "consumption" | "pricePerDay" | "rating" | "reviewsCount" | "plate" | "image">;

const rows: Row[] = [
  { id: "honda-n-wgn-grey-1", brand: "Honda", model: "N-WGN", year: 2017, color: "серый", power: 58, consumption: 3.9, pricePerDay: 1800, rating: 4.7, reviewsCount: 64, plate: "А101ВС154", image: nWgnGrey, bookedDates: ["2026-08-12", "2026-08-13", "2026-08-14"] },
  { id: "honda-n-wgn-grey-2", brand: "Honda", model: "N-WGN", year: 2018, color: "серый", power: 58, consumption: 3.8, pricePerDay: 1900, rating: 4.8, reviewsCount: 41, plate: "А102ВС154", image: nWgnGrey2018 },
  { id: "honda-n-wgn-blue", brand: "Honda", model: "N-WGN", year: 2016, color: "синий", power: 58, consumption: 4.0, pricePerDay: 1800, rating: 4.6, reviewsCount: 28, plate: "А103ВС154", image: nWgnBlue },
  { id: "honda-n-wgn-black", brand: "Honda", model: "N-WGN", year: 2019, color: "чёрный", power: 58, consumption: 3.8, pricePerDay: 2100, rating: 4.9, reviewsCount: 96, plate: "А104ВС154", image: nWgnBlack },
  { id: "honda-n-wgn-white", brand: "Honda", model: "N-WGN", year: 2018, color: "белый", power: 58, consumption: 3.9, pricePerDay: 1900, rating: 4.7, reviewsCount: 52, plate: "А105ВС154", image: nWgnWhiteReal, status: "busy", bookedDates: ["2026-08-08", "2026-08-09", "2026-08-10", "2026-08-11"] },
  { id: "honda-n-wgn-turbo-white", brand: "Honda", model: "N-WGN Custom Turbo", year: 2019, color: "белый", power: 64, consumption: 4.4, pricePerDay: 2700, rating: 4.9, reviewsCount: 128, plate: "А106ВС154", image: nWgnTurboWhite, deposit: 2000 },
  { id: "nissan-dayz-green", brand: "Nissan", model: "Dayz", year: 2016, color: "зелёный", power: 49, consumption: 3.7, pricePerDay: 1800, rating: 4.5, reviewsCount: 19, plate: "В201ТР154", image: dayzGreen },
  { id: "nissan-dayz-brown", brand: "Nissan", model: "Dayz", year: 2017, color: "коричневый", power: 49, consumption: 3.6, pricePerDay: 1800, rating: 4.6, reviewsCount: 23, plate: "В202ТР154", image: dayzBrownReal },
  { id: "nissan-dayz-grey", brand: "Nissan", model: "Dayz", year: 2018, color: "серый", power: 52, consumption: 3.8, pricePerDay: 1900, rating: 4.7, reviewsCount: 37, plate: "В203ТР154", image: dayzGrey, bookedDates: ["2026-08-20", "2026-08-21"] },
  { id: "nissan-dayz-white-1", brand: "Nissan", model: "Dayz", year: 2019, color: "белый", power: 52, consumption: 3.7, pricePerDay: 2000, rating: 4.8, reviewsCount: 58, plate: "В204ТР154", image: dayzWhite, gallery: [dayzWhite, dayzWhiteReal] },
  { id: "nissan-dayz-white-2", brand: "Nissan", model: "Dayz Highway Star", year: 2019, color: "белый", power: 64, consumption: 4.3, pricePerDay: 2400, rating: 4.9, reviewsCount: 71, plate: "В205ТР154", image: dayzHighwayStarWhite, deposit: 2000 },
  { id: "nissan-dayz-black", brand: "Nissan", model: "Dayz", year: 2018, color: "чёрный", power: 52, consumption: 3.9, pricePerDay: 2000, rating: 4.7, reviewsCount: 44, plate: "В206ТР154", image: dayzBlack, status: "maintenance" },
  { id: "mitsubishi-ek-wagon-blue", brand: "Mitsubishi", model: "eK Wagon", year: 2016, color: "синий", power: 49, consumption: 3.8, pricePerDay: 1800, rating: 4.5, reviewsCount: 16, plate: "С301МН154", image: ekWagonBlue },
  { id: "daihatsu-mira-es-black-1", brand: "Daihatsu", model: "Mira e:S", year: 2017, color: "чёрный", power: 49, consumption: 3.6, pricePerDay: 1800, rating: 4.6, reviewsCount: 31, plate: "Е401КР154", image: miraEsBlack },
  { id: "daihatsu-mira-es-black-2", brand: "Daihatsu", model: "Mira e:S", year: 2018, color: "чёрный", power: 49, consumption: 3.6, pricePerDay: 1900, rating: 4.7, reviewsCount: 26, plate: "Е402КР154", image: miraEsBlack2018, bookedDates: ["2026-08-15", "2026-08-16", "2026-08-17"] },
  { id: "daihatsu-mira-es-white", brand: "Daihatsu", model: "Mira e:S", year: 2019, color: "белый", power: 52, consumption: 3.6, pricePerDay: 1900, rating: 4.8, reviewsCount: 49, plate: "Е403КР154", image: miraEsWhite },
  { id: "daihatsu-move-white", brand: "Daihatsu", model: "Move", year: 2017, color: "белый", power: 52, consumption: 4.2, pricePerDay: 1900, rating: 4.6, reviewsCount: 22, plate: "К501АВ154", image: moveWhite },
  { id: "honda-n-box-black", brand: "Honda", model: "N-BOX", year: 2018, color: "чёрный", power: 58, consumption: 4.5, pricePerDay: 2300, rating: 4.9, reviewsCount: 87, plate: "М601ОР154", image: nBoxBlackReal, gallery: [nBoxBlackReal, nBoxBlackReal2], seats: 5, bodyType: "минивэн" },
  { id: "daihatsu-mira-white", brand: "Daihatsu", model: "Mira (3 двери)", year: 2015, color: "белый", power: 49, consumption: 4.0, pricePerDay: 1800, rating: 4.5, reviewsCount: 12, plate: "Н701ХВ154", image: miraWhite, seats: 4 },
  { id: "suzuki-alto-white", brand: "Suzuki", model: "Alto", year: 2017, color: "белый", power: 49, consumption: 3.7, pricePerDay: 1800, rating: 4.6, reviewsCount: 34, plate: "О801ТН154", image: altoWhite },
  { id: "honda-n-wgn-black-2", brand: "Honda", model: "N-WGN", year: 2020, color: "чёрный", power: 58, consumption: 3.8, pricePerDay: 2200, rating: 4.9, reviewsCount: 63, plate: "А107ВС154", image: nWgnBlack2020, status: "busy", bookedDates: ["2026-08-09", "2026-08-10"] },
];

export const mockCars: Car[] = rows.map((row) => ({
  ...base,
  torque: 60,
  bookedDates: [],
  ...row,
  slug: row.id,
  displayName: `${row.brand} ${row.model}`,
  gallery: row.gallery ?? [row.image],
})) as Car[];

export const cars = mockCars;

export const getCarById = (id: string) => mockCars.find((c) => c.id === id);

export const carBrands = Array.from(new Set(mockCars.map((c) => c.brand))).sort();
export const carColors = Array.from(new Set(mockCars.map((c) => c.color))).sort();
export const carYears = Array.from(new Set(mockCars.map((c) => c.year))).sort((a, b) => b - a);
