import { useEffect, useRef, useState, type ImgHTMLAttributes } from "react";
import heroCar from "@/assets/hero-car.jpg";
import { cn } from "@/lib/utils";

type CarImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src?: string | null;
  fallbackSrc?: string;
};

/** Image with a stable visual fallback for empty, stale, or failed car URLs. */
export function CarImage({
  src,
  fallbackSrc = heroCar,
  onError,
  onLoad,
  className,
  ...props
}: CarImageProps) {
  const requestedSrc = src || fallbackSrc;
  const [resolvedSrc, setResolvedSrc] = useState(requestedSrc);
  const [ready, setReady] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setResolvedSrc(requestedSrc);
    setReady(false);
  }, [requestedSrc]);

  // Cached images can finish before hydration, so `load` never fires here.
  useEffect(() => {
    if (ref.current?.complete) setReady(true);
  }, [resolvedSrc]);

  return (
    <img
      {...props}
      ref={ref}
      src={resolvedSrc}
      className={cn(
        "transition-opacity duration-500 motion-reduce:transition-none",
        ready ? "opacity-100" : "opacity-0",
        className,
      )}
      onLoad={(event) => {
        onLoad?.(event);
        setReady(true);
      }}
      onError={(event) => {
        onError?.(event);
        if (resolvedSrc !== fallbackSrc) setResolvedSrc(fallbackSrc);
        else setReady(true);
      }}
    />
  );
}

