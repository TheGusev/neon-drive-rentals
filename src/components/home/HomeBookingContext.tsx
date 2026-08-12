import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { BookingTariff } from "@/types/domain";
import { PICKUP_POINT } from "@/mocks/pickupPoints";

interface HomeBookingState {
  from: string | undefined;
  to: string | undefined;
  tariff: BookingTariff;
  location: string;
  setFrom: (v: string | undefined) => void;
  setTo: (v: string | undefined) => void;
  setTariff: (v: BookingTariff) => void;
  setLocation: (v: string) => void;
}

const HomeBookingContext = createContext<HomeBookingState | null>(null);

function isoInDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function HomeBookingProvider({ children }: { children: ReactNode }) {
  // Start with undefined so the server and the first client render are identical.
  // Real defaults are applied after hydration to avoid timezone/day-boundary mismatches.
  const [from, setFrom] = useState<string | undefined>(undefined);
  const [to, setTo] = useState<string | undefined>(undefined);
  const [tariff, setTariff] = useState<BookingTariff>("city");
  const [location, setLocation] = useState(PICKUP_POINT.id);

  useEffect(() => {
    setFrom(isoInDays(1));
    setTo(isoInDays(3));
  }, []);

  const value = useMemo(
    () => ({ from, to, tariff, location, setFrom, setTo, setTariff, setLocation }),
    [from, to, tariff, location],
  );

  return <HomeBookingContext.Provider value={value}>{children}</HomeBookingContext.Provider>;
}

export function useHomeBooking(): HomeBookingState {
  const ctx = useContext(HomeBookingContext);
  if (!ctx) throw new Error("useHomeBooking must be used inside HomeBookingProvider");
  return ctx;
}
