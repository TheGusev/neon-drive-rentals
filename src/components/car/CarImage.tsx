import { useEffect, useState, type ImgHTMLAttributes } from "react";
import heroCar from "@/assets/hero-car.jpg";

type CarImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src?: string | null;
  fallbackSrc?: string;
};

/** Image with a stable visual fallback for empty, stale, or failed car URLs. */
export function CarImage({ src, fallbackSrc = heroCar, onError, ...props }: CarImageProps) {
  const requestedSrc = src || fallbackSrc;
  const [resolvedSrc, setResolvedSrc] = useState(requestedSrc);

  useEffect(() => setResolvedSrc(requestedSrc), [requestedSrc]);

  return (
    <img
      {...props}
      src={resolvedSrc}
      onError={(event) => {
        onError?.(event);
        if (resolvedSrc !== fallbackSrc) setResolvedSrc(fallbackSrc);
      }}
    />
  );
}