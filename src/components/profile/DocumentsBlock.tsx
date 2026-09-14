import { useEffect, useState } from "react";
import { Check, Clock, IdCard, Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SectionCard } from "@/components/checkout/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  const [values, setValues] = useState({ number: "", birthDate: "", issuedBy: "", issueDate: "", departmentCode: "", registrationAddress: "", expiryDate: "" });
  const save = useServerFn(saveMyDocument);
  const queryClient = useQueryClient();
  useEffect(() => {
    setValues({
      number: document?.number ?? "", birthDate: document?.birthDate ?? "", issuedBy: document?.issuedBy ?? "",
      issueDate: document?.issueDate ?? "", departmentCode: document?.departmentCode ?? "",
      registrationAddress: document?.registrationAddress ?? "", expiryDate: document?.expiryDate ?? "",
    });
  }, [document]);
  const [busy, setBusy] = useState(false);
  const patch = (key: keyof typeof values, value: string) => setValues((current) => ({ ...current, [key]: value }));
  const complete = type === "passport"
    ? /^\d{4}\s?\d{6}$/.test(values.number) && Boolean(values.birthDate && values.issuedBy.trim().length >= 3 && values.issueDate && /^\d{3}-\d{3}$/.test(values.departmentCode) && values.registrationAddress.trim().length >= 5)
    : Boolean(values.number.trim().length >= 6 && values.issueDate && values.expiryDate);
  const submit = async () => {
    if (!complete) return toast.error("Заполните все обязательные поля");
    setBusy(true);
    try {
      const data = type === "passport"
        ? { type, number: values.number, birthDate: values.birthDate, issuedBy: values.issuedBy, issueDate: values.issueDate, departmentCode: values.departmentCode, registrationAddress: values.registrationAddress }
        : { type, number: values.number, issueDate: values.issueDate, expiryDate: values.expiryDate };
      const result = await save({ data });
      if (!result.ok) return toast.error(result.error);
      await queryClient.invalidateQueries({ queryKey: ["me", "profile"] });
      toast.success("Данные сохранены и будут подставлены в договор");
    } catch { toast.error("Проверьте правильность заполнения"); }
    finally { setBusy(false); }
  };
  const state = document ? statusMap[document.status] : null;
  return (
    <SectionCard title={type === "passport" ? "Паспорт РФ" : "Водительское удостоверение"} className="bg-card ring-1 ring-border">
      {state && <p className={`mb-3 flex items-center gap-1.5 text-xs font-medium ${state.tone}`}><state.Icon className="h-4 w-4" />{state.label}{document?.comment ? `: ${document.comment}` : ""}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={type === "passport" ? "Серия и номер" : "Серия и номер прав"} value={values.number} onChange={(v) => patch("number", v)} placeholder={type === "passport" ? "5400 123456" : "54 00 123456"} />
        {type === "passport" && <Field label="Дата рождения" type="date" value={values.birthDate} onChange={(v) => patch("birthDate", v)} />}
        <Field label="Дата выдачи" type="date" value={values.issueDate} onChange={(v) => patch("issueDate", v)} />
        {type === "license" && <Field label="Действительно до" type="date" value={values.expiryDate} onChange={(v) => patch("expiryDate", v)} />}
        {type === "passport" && <Field label="Код подразделения" value={values.departmentCode} onChange={(v) => patch("departmentCode", v)} placeholder="540-001" />}
      </div>
      {type === "passport" && <div className="mt-3 space-y-3"><Area label="Кем выдан" value={values.issuedBy} onChange={(v) => patch("issuedBy", v)} /><Area label="Адрес регистрации" value={values.registrationAddress} onChange={(v) => patch("registrationAddress", v)} /></div>}
      <Button className="mt-4 w-full" disabled={!complete || busy} onClick={() => void submit()}>
        {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}{busy ? "Сохраняем…" : "Сохранить данные"}
      </Button>
      <p className="mt-2 flex items-start gap-1.5 text-[11px] text-muted-foreground"><IdCard className="mt-0.5 h-3.5 w-3.5 shrink-0" />Фотографии не нужны. Данные доступны только для оформления аренды.</p>
    </SectionCard>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) {
  const id = `${label}-${type}`;
  return <div className="space-y-1.5"><Label htmlFor={id}>{label}</Label><Input id={id} type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} /></div>;
}
function Area({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const id = `area-${label}`;
  return <div className="space-y-1.5"><Label htmlFor={id}>{label}</Label><Textarea id={id} value={value} maxLength={400} onChange={(e) => onChange(e.target.value)} /></div>;
}