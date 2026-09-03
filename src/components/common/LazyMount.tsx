import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Монтирует тяжёлую секцию только когда она приближается к вьюпорту.
 * Нужно для мобильного интернета: первый экран не тянет десятки картинок.
 * SSR отдаёт плейсхолдер фиксированной высоты — без скачков верстки.
 */
export function LazyMount({
  children,
  minHeight = 320,
  rootMargin = "600px",
}: {
  children: ReactNode;
  minHeight?: number;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [visible, rootMargin]);

  return (
    <div ref={ref} style={visible ? undefined : { minHeight }}>
      {visible ? children : null}
    </div>
  );
}
