// Идентификатор сборки. Значения подставляются на CI (см. .github/workflows/deploy.yml).
export const BUILD_COMMIT: string =
  (import.meta.env["VITE_BUILD_COMMIT"] as string | undefined) ?? "dev";

export const BUILD_TIME: string =
  (import.meta.env["VITE_BUILD_TIME"] as string | undefined) ?? "";

export const BUILD_ID: string = BUILD_TIME ? `${BUILD_COMMIT}@${BUILD_TIME}` : BUILD_COMMIT;
