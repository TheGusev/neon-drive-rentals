export type CarClass = "econom" | "sport" | "premium";
export type Transmission = "AT" | "MT" | "CVT";

export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  class: CarClass;
  power: number; // л.с.
  torque: number; // Н·м
  consumption: number; // л/100км
  transmission: Transmission;
  pricePerDay: number; // руб
  image?: string;
  rating: number; // 0..5
  engineVolume: number; // литры
  bodyType?: string;
  seats?: number;
  deposit?: number; // руб
  mileageLimit?: number; // км/сутки, 0 = без лимита
  fuelPolicy?: string;
}

export type BookingStatus = "paid" | "pending" | "active" | "completed";

export interface Booking {
  id: string;
  carId: string;
  clientId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: BookingStatus;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  ordersCount: number;
  rating: number;
}

export interface DashboardStats {
  bookingsToday: number;
  bookingsDelta: number;
  revenueToday: number;
  revenueDelta: number;
  carsTotal: number;
  clientsTotal: number;
  fleetStatus: {
    free: number;
    busy: number;
    washing: number;
    maintenance: number;
  };
}
