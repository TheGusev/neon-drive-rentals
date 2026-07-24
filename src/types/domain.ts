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
  vin?: string;
  plate?: string;
}

export type BookingStatus = "paid" | "pending" | "active" | "completed" | "cancelled";
export type BookingTariff = "city" | "region" | "outside";
export type PaymentMethod = "card" | "sbp";
export type ContractStatus = "signed" | "pending" | "none";

export type DocumentType = "passport" | "license";
export type DocumentStatus = "pending" | "verified" | "rejected";

export interface ClientDocument {
  id: string;
  type: DocumentType;
  number: string;
  status: DocumentStatus;
  uploadedAt: string;
}

export interface ClientReview {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
}

export interface ClientProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatarUrl?: string;
  rating: number;
  reviewsCount: number;
}

export interface Booking {
  id: string;
  carId: string;
  clientId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  pickupAddress?: string;
  contractStatus?: ContractStatus;
  status: BookingStatus;
}

export interface BookingDraft {
  id: string;
  carId: string;
  startDate?: string; // ISO date (yyyy-mm-dd)
  endDate?: string;
  startTime: string; // HH:mm
  endTime: string;
  pickupPointId?: string;
  delivery: boolean;
  deliveryAddress?: string;
  tariff: BookingTariff;
  paymentMethod?: PaymentMethod;
  signed?: boolean;
  phone: string;
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
