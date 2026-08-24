import type { Car } from "@/types/domain";

import nWgnGrey from "@/assets/cars/honda-n-wgn-grey.jpg";
import nWgnBlue from "@/assets/cars/honda-n-wgn-blue.jpg";
import nWgnBlue2 from "@/assets/cars/honda-n-wgn-blue-2.jpg";
import nWgnBlack from "@/assets/cars/honda-n-wgn-black.jpg";
import nWgnTurboWhite from "@/assets/cars/honda-n-wgn-turbo-white.jpg";
import dayzGreen from "@/assets/cars/nissan-dayz-green.jpg";
import dayzGrey from "@/assets/cars/nissan-dayz-grey.jpg";
import dayzWhite from "@/assets/cars/nissan-dayz-white.jpg";
import dayzBlack from "@/assets/cars/nissan-dayz-black.jpg";
import miraEsBlack from "@/assets/cars/daihatsu-mira-es-black.jpg";
import miraEsWhite from "@/assets/cars/daihatsu-mira-es-white.jpg";
import moveWhite from "@/assets/cars/daihatsu-move-white.jpg";
import miraWhite from "@/assets/cars/daihatsu-mira-white.jpg";
import nWgnGrey2018 from "@/assets/cars/honda-n-wgn-grey-2018.jpg";
import nWgnBlack2020 from "@/assets/cars/honda-n-wgn-black-2020.jpg";
import miraEsBlack2018 from "@/assets/cars/daihatsu-mira-es-black-2018.jpg";
import dayzHighwayStarWhite from "@/assets/cars/nissan-dayz-highway-star-white.jpg";
import altoWhite from "@/assets/cars/suzuki-alto-white.jpg";
import altoWhite2 from "@/assets/cars/suzuki-alto-white-2.jpg";
import dayzBrownReal from "@/assets/cars/real/nissan-dayz-brown-real.jpg";
import nBoxBlackReal from "@/assets/cars/real/honda-n-box-black-real.jpg";
import nBoxBlackReal2 from "@/assets/cars/real/honda-n-box-black-real-2.jpg";
import nBoxBlackReal3 from "@/assets/cars/real/honda-n-box-black-real-3.jpg";
import nBoxBlackFrontReal from "@/assets/cars/real/honda-n-box-black-front-real.jpg";
import nWgnWhiteReal from "@/assets/cars/real/honda-n-wgn-white-real.jpg";
import dayzWhiteReal from "@/assets/cars/real/nissan-dayz-white-real.jpg";
import dayzBlackReal from "@/assets/cars/real/nissan-dayz-black-real.jpg";
import nWgnBlueReal from "@/assets/cars/real/honda-n-wgn-blue-real.jpg";
import ekWagonBlackReal from "@/assets/cars/real/mitsubishi-ek-wagon-black-real.jpg";
import ekWagonSilverReal from "@/assets/cars/real/mitsubishi-ek-wagon-silver-real.jpg";

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
  { id: "honda-n-wgn-blue-2", brand: "Honda", model: "N-WGN", year: 2020, color: "синий", power: 58, consumption: 3.9, pricePerDay: 1850, rating: 4.7, reviewsCount: 24, plate: "Т767РТ154", image: nWgnBlue2, gallery: [nWgnBlue2, nWgnBlue] },
  { id: "honda-n-wgn-blue-1", brand: "Honda", model: "N-WGN", year: 2020, color: "синий", power: 58, consumption: 4.0, pricePerDay: 1800, rating: 4.7, reviewsCount: 31, plate: "Т298РМ154", image: nWgnBlueReal, gallery: [nWgnBlueReal, nWgnBlue] },
  { id: "honda-n-wgn-black-1", brand: "Honda", model: "N-WGN", year: 2020, color: "чёрный", power: 58, consumption: 3.8, pricePerDay: 1900, rating: 4.9, reviewsCount: 56, plate: "Х498АЕ154", image: nWgnBlack, status: "busy" },
  { id: "honda-n-wgn-white-1", brand: "Honda", model: "N-WGN", year: 2021, color: "белый", power: 58, consumption: 3.8, pricePerDay: 2000, rating: 4.9, reviewsCount: 38, plate: "Х117ЕТ154", image: nWgnWhiteReal, gallery: [nWgnWhiteReal] },
  { id: "honda-n-wgn-turbo-white-1", brand: "Honda", model: "N-WGN Turbo", year: 2014, color: "белый", power: 64, consumption: 5.0, pricePerDay: 2100, rating: 4.7, reviewsCount: 26, plate: "Р197РН70", image: nWgnTurboWhite, deposit: 2000 },
  { id: "nissan-dayz-green-1", brand: "Nissan", model: "Dayz", year: 2020, color: "зелёный", power: 52, consumption: 3.7, pricePerDay: 1800, rating: 4.6, reviewsCount: 18, plate: "Х765ВА154", image: dayzGreen },
  { id: "nissan-dayz-brown-1", brand: "Nissan", model: "Dayz", year: 2020, color: "коричневый", power: 52, consumption: 3.6, pricePerDay: 1800, rating: 4.6, reviewsCount: 21, plate: "Х164ВТ154", image: dayzBrownReal, gallery: [dayzBrownReal] },
  { id: "nissan-dayz-grey-1", brand: "Nissan", model: "Dayz", year: 2021, color: "серый", power: 52, consumption: 3.8, pricePerDay: 1900, rating: 4.8, reviewsCount: 29, plate: "Х602МВ154", image: dayzGrey, bookedDates: ["2026-08-20", "2026-08-21"] },
  { id: "nissan-dayz-white-1", brand: "Nissan", model: "Dayz", year: 2019, color: "белый", power: 52, consumption: 3.7, pricePerDay: 2000, rating: 4.8, reviewsCount: 58, plate: "В204ТР154", image: dayzWhite, gallery: [dayzWhite, dayzWhiteReal] },
  { id: "nissan-dayz-grey-2", brand: "Nissan", model: "Dayz", year: 2013, color: "серый", power: 49, consumption: 4.4, pricePerDay: 1800, rating: 4.4, reviewsCount: 11, plate: "М616НМ45", image: dayzHighwayStarWhite, gallery: [dayzHighwayStarWhite, dayzGrey] },
  { id: "nissan-dayz-black-1", brand: "Nissan", model: "Dayz", year: 2013, color: "чёрный", power: 49, consumption: 4.3, pricePerDay: 1800, rating: 4.5, reviewsCount: 17, plate: "Т847ВА154", image: dayzBlackReal, gallery: [dayzBlackReal, dayzBlack] },
  { id: "mitsubishi-ek-wagon-blue-1", brand: "Mitsubishi", model: "eK Wagon", year: 2020, color: "чёрный", power: 49, consumption: 3.8, pricePerDay: 1800, rating: 4.5, reviewsCount: 16, plate: "Х776АА154", image: ekWagonBlackReal, gallery: [ekWagonBlackReal, ekWagonSilverReal] },
  { id: "daihatsu-mira-es-black-1", brand: "Daihatsu", model: "Mira e:S", year: 2017, color: "чёрный", power: 49, consumption: 3.6, pricePerDay: 1800, rating: 4.6, reviewsCount: 31, plate: "Е401КР154", image: miraEsBlack },
  { id: "honda-n-wgn-white-2", brand: "Honda", model: "N-WGN", year: 2020, color: "белый", power: 58, consumption: 3.9, pricePerDay: 1900, rating: 4.7, reviewsCount: 22, plate: "Н776ЕН13", image: nWgnWhiteReal, gallery: [nWgnWhiteReal, nWgnWhite] },
  { id: "daihatsu-mira-es-white-1", brand: "Daihatsu", model: "Mira e:S", year: 2021, color: "белый", power: 49, consumption: 3.6, pricePerDay: 1900, rating: 4.8, reviewsCount: 35, plate: "Т423УМ154", image: miraEsWhite },
  { id: "daihatsu-move-white-1", brand: "Daihatsu", model: "Move", year: 2013, color: "белый", power: 52, consumption: 4.6, pricePerDay: 1800, rating: 4.4, reviewsCount: 14, plate: "Т370ХХ154", image: moveWhite },
  { id: "honda-n-box-black-1", brand: "Honda", model: "N-BOX", year: 2020, color: "чёрный", power: 58, consumption: 4.8, pricePerDay: 2100, rating: 4.9, reviewsCount: 61, plate: "Т960РУ154", image: nBoxBlackReal3, gallery: [nBoxBlackReal3, nBoxBlackReal, nBoxBlackFrontReal, nBoxBlackReal2], status: "busy", bodyType: "минивэн" },
  { id: "daihatsu-mira-white-1", brand: "Daihatsu", model: "Mira (3 двери)", year: 2015, color: "белый", power: 49, consumption: 4.1, pricePerDay: 1800, rating: 4.4, reviewsCount: 9, plate: "М663ХМ154", image: miraWhite, seats: 4 },
  { id: "suzuki-alto-white-1", brand: "Suzuki", model: "Alto", year: 2011, color: "белый", power: 49, consumption: 4.2, pricePerDay: 1800, rating: 4.3, reviewsCount: 12, plate: "Х839АХ154", image: altoWhite },
  { id: "suzuki-alto-white-2", brand: "Suzuki", model: "Alto", year: 2010, color: "белый", power: 49, consumption: 4.3, pricePerDay: 1800, rating: 4.3, reviewsCount: 8, plate: "Х464КУ125", image: altoWhite2 },
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
