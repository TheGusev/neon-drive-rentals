import { useRef, type KeyboardEvent, type ClipboardEvent } from "react";
import { cn } from "@/lib/utils";

interface SmsCodeInputProps {
  value: string;
  onChange: (v: string) => void;
  length?: number;
}

export function SmsCodeInput({ value, onChange, length = 6 }: SmsCodeInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  const setAt = (i: number, ch: string) => {
    const arr = value.split("");
    arr[i] = ch;
    onChange(arr.join("").slice(0, length));
  };

  const handleChange = (i: number, raw: string) => {
    const ch = raw.replace(/\D/g, "").slice(-1);
    if (!ch) return;
    setAt(i, ch);
    if (i < length - 1) refs.current[i + 1]?.focus();
  };

  const handleKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[i]) {
        setAt(i, "");
      } else if (i > 0) {
        refs.current[i - 1]?.focus();
        const arr = value.split("");
        arr[i - 1] = "";
        onChange(arr.join(""));
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < length - 1) {
      refs.current[i + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    e.preventDefault();
    onChange(pasted);
    const next = Math.min(pasted.length, length - 1);
    refs.current[next]?.focus();
  };

  return (
    <div className="flex justify-between gap-2" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          onFocus={(e) => e.currentTarget.select()}
          className={cn(
            "h-14 w-full min-w-0 rounded-2xl border text-center text-2xl font-bold text-foreground",
            "border-border bg-card outline-none transition",
            "focus:border-accent focus:ring-2 focus:ring-accent/20",
          )}
        />
      ))}
    </div>
  );
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return phone;
  const last2 = digits.slice(-2);
  return `+7 *** *** ** ${last2}`;
}
