import { queryOptions } from "@tanstack/react-query";
import { getCars, getCarBySlug } from "@/lib/catalog.functions";
import {
  getBookings,
  getBookingById,
  getBookingsByPhone,
  getPublicBookings,
} from "@/lib/bookings.functions";
import {
  getCarsAdmin,
  getBookingsAdmin,
  getClientsAdmin,
  getPaymentsAdmin,
} from "@/lib/admin.functions";
import { getMyBookings } from "@/lib/auth.functions";

export const carsQueryOptions = () =>
  queryOptions({
    queryKey: ["cars"] as const,
    queryFn: () => getCars(),
    staleTime: 60_000,
  });

export const carQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["cars", slug] as const,
    queryFn: () => getCarBySlug({ data: { slug } }),
    staleTime: 60_000,
  });

export const publicBookingsQueryOptions = () =>
  queryOptions({
    queryKey: ["bookings", "public"] as const,
    queryFn: () => getPublicBookings(),
    staleTime: 30_000,
  });

export const adminBookingsQueryOptions = () =>
  queryOptions({
    queryKey: ["bookings", "admin"] as const,
    queryFn: () => getBookings(),
    staleTime: 15_000,
  });

export const bookingQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["bookings", "one", id] as const,
    queryFn: () => getBookingById({ data: { id } }),
    staleTime: 15_000,
  });

export const clientBookingsQueryOptions = (phone: string) =>
  queryOptions({
    queryKey: ["bookings", "client", phone] as const,
    queryFn: () => getBookingsByPhone({ data: { phone } }),
    staleTime: 30_000,
  });

export const adminCarsQueryOptions = () =>
  queryOptions({
    queryKey: ["admin", "cars"] as const,
    queryFn: () => getCarsAdmin(),
    staleTime: 15_000,
  });

export const adminBookingRowsQueryOptions = () =>
  queryOptions({
    queryKey: ["admin", "bookings"] as const,
    queryFn: () => getBookingsAdmin({ data: {} }),
    staleTime: 15_000,
  });

export const adminClientsQueryOptions = () =>
  queryOptions({
    queryKey: ["admin", "clients"] as const,
    queryFn: () => getClientsAdmin(),
    staleTime: 30_000,
  });

export const adminPaymentsQueryOptions = () =>
  queryOptions({
    queryKey: ["admin", "payments"] as const,
    queryFn: () => getPaymentsAdmin({ data: {} }),
    staleTime: 30_000,
  });

export const myBookingsQueryOptions = () =>
  queryOptions({
    queryKey: ["me", "bookings"] as const,
    queryFn: () => getMyBookings(),
    staleTime: 15_000,
  });
