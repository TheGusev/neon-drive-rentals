import { useEffect, useState } from "react";
import { Check, Clock, IdCard, Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SectionCard } from "@/components/checkout/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveMyDocument } from "@/lib/profile.functions";
import type { ClientDocument } from "@/types/domain";

type Doc = ClientDocument & { comment?: string };
const statusMap = {
  verified: { label: "Проверено", tone: "text-emerald-600", Icon: Check },
  pending: { label: "Ожидает проверки", tone: "text-amber-600", Icon: Clock },
  rejected: { label: "Нужно исправить", tone: "text-destructive", Icon: X },
} as const;

export function DocumentsBlock({ documents = [] }: { documents?: Doc[] }) {
  const passport = documents.find((d) => d.type === "passport");
  const license = documents.find((d) => d.type === "license");
  return (
    <div className="space-y-3">
      <DocumentForm type="passport" document={passport} />
      <DocumentForm type="license" document={license} />
    </div>
  );
}

function DocumentForm({ type, document }: { type: "passport" | "license"; document?: Doc }) {
  const [number, setNumber] = useState("");
  const save = useServerFn(saveMyDocument);
  const queryClient = useQueryClient();
  useEffect(() => {
    setNumber(document?.number ?? "");
  }, [document]);
  const [busy, setBusy] = useState(false);
  const isPassport = type === "passport";
  const complete = isPassport ? /^\d{4}\s?\d{6}$/.test(number) : number.trim().length >= 6;
  const submit = async () => {
    if (!complete) return toast.error(isPassport ? "Укажите 10 цифр паспорта" : "Укажите серию и номер прав");
    setBusy(true);
    try {
      const result = await save({ data: { type, number } });
      if (!result.ok) return toast.error(result.error);
      await queryClient.invalidateQueries({ queryKey: ["me", "profile"] });
      toast.success("Данные сохранены и будут подставлены в договор");
    } catch {
      toast.error("Проверьте правильность заполнения");
    } finally {
      setBusy(false);
    }
  };
  const state = document ? statusMap[document.status] : null;
  return (
    <SectionCard title={isPassport ? "Паспорт РФ" : "Водительское удостоверение"} className="bg-card ring-1 ring-border">
      {state && <p className={`mb-3 flex items-center gap-1.5 text-xs font-medium ${state.tone}`}><state.Icon className="h-4 w-4" />{state.label}{document?.comment ? `: ${document.comment}` : ""}</p>}
      <div className="space-y-1.5">
        <Label htmlFor={`${type}-number`}>Серия и номер</Label>
        <Input
          id={`${type}-number`}
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          inputMode="numeric"
          placeholder={isPassport ? "5400 123456" : "54 00 123456"}
          autoComplete="off"
        />
      </div>
      <Button className="mt-4 w-full" disabled={!complete || busy} onClick={() => void submit()}>
        {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}{busy ? "Сохраняем…" : "Сохранить данные"}
      </Button>
      <p className="mt-2 flex items-start gap-1.5 text-[11px] text-muted-foreground"><IdCard className="mt-0.5 h-3.5 w-3.5 shrink-0" />Фотографии не нужны. Данные доступны только для оформления аренды.</p>
    </SectionCard>
  );
}
