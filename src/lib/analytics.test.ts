import { afterEach, expect, test } from "bun:test";
import { METRIKA_COUNTER_ID, reachGoal, trackingAllowed } from "./analytics";

afterEach(() => { Reflect.deleteProperty(globalThis, "window"); });

test("uses uploaded counter 112667049", () => {
  expect(METRIKA_COUNTER_ID).toBe(112667049);
});

for (const goal of ["call", "booking", "login"] as const) {
  test(`dispatches ${goal} to the new counter without personal data`, () => {
    const calls: unknown[][] = [];
    Object.defineProperty(globalThis, "window", { configurable: true, value: {
      location: { hostname: "nsk-rent.ru", pathname: "/login" },
      ym: (...args: unknown[]) => calls.push(args),
    } });
    reachGoal(goal);
    expect(calls).toEqual([[112667049, "reachGoal", goal]]);
  });
}

test("excludes admin and preview", () => {
  expect(trackingAllowed("nsk-rent.ru", "/admin/bookings")).toBe(false);
  expect(trackingAllowed("localhost", "/")).toBe(false);
  expect(trackingAllowed("www.nsk-rent.ru", "/profile")).toBe(true);
});

test("analytics failure cannot interrupt a customer action", () => {
  Object.defineProperty(globalThis, "window", { configurable: true, value: {
    location: { hostname: "nsk-rent.ru", pathname: "/payment/1" },
    ym: () => { throw new Error("blocked"); },
  } });
  expect(() => reachGoal("booking")).not.toThrow();
});