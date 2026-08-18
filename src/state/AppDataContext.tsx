import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { Booking, Car } from "@/types/domain";
import { carsQueryOptions, publicBookingsQueryOptions } from "@/lib/queries";

type AppData = {
  cars: Car[];
  bookings: Booking[];
  getCarById: (id: string) => Car | undefined;
};

const AppDataContext = createContext<AppData | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { data: cars } = useSuspenseQuery(carsQueryOptions());
  const { data: bookings } = useSuspenseQuery(publicBookingsQueryOptions());

  const value = useMemo<AppData>(() => {
    const index = new Map(cars.map((c) => [c.id, c] as const));
    return {
      cars,
      bookings,
      getCarById: (id: string) => index.get(id),
    };
  }, [cars, bookings]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

function useAppData(): AppData {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used inside <AppDataProvider>");
  return ctx;
}

export const useCars = (): Car[] => useAppData().cars;
export const useBookings = (): Booking[] => useAppData().bookings;
export const useCarById = (id: string | undefined): Car | undefined => {
  const { getCarById } = useAppData();
  return id ? getCarById(id) : undefined;
};
export const useCarLookup = (): ((id: string) => Car | undefined) => useAppData().getCarById;

/** Filter facets derived from the live catalog. */
export function useCarFacets() {
  const cars = useCars();
  return useMemo(
    () => ({
      brands: Array.from(new Set(cars.map((c) => c.brand))).sort(),
      colors: Array.from(new Set(cars.map((c) => c.color))).sort(),
      years: Array.from(new Set(cars.map((c) => c.year))).sort((a, b) => b - a),
    }),
    [cars],
  );
}
