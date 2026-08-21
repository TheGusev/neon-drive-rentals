import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

const MOBILE_UA = /iphone|ipod|android.+mobile|windows phone|blackberry|opera mini|iemobile/i;

/** Определяет мобильное устройство по User-Agent, чтобы SSR отдавал только один вариант главной. */
export const getIsMobileDevice = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const ua = getRequest().headers.get("user-agent") ?? "";
    return { isMobile: MOBILE_UA.test(ua) };
  } catch {
    return { isMobile: false };
  }
});
