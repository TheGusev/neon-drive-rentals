import { useRef, useState } from "react";
import { FileText, IdCard, Upload, Check, Clock, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SectionCard } from "@/components/checkout/SectionCard";
import { Button } from "@/components/ui/button";
import { prepareImage } from "@/lib/imageCompress";
import { uploadMyDocument } from "@/lib/profile.functions";
import type { ClientDocument } from "@/types/domain";

const typeLabel: Record<ClientDocument["type"], string> = {
  passport: "Паспорт РФ",
  license: "Водительское удостоверение",
};

const statusMap = {
  verified: { label: "Проверено", tone: "bg-emerald-500/15 text-emerald-600 public-dark:text-emerald-400", Icon: Check },
  pending: { label: "На проверке", tone: "bg-amber-500/15 text-amber-600 public-dark:text-amber-400", Icon: Clock },
  rejected: { label: "Отклонено", tone: "bg-rose-500/15 text-rose-600 public-dark:text-rose-400", Icon: X },
} as const;

type Doc = ClientDocument & { fileUrl?: string; comment?: string };

export function DocumentsBlock({ documents = [] }: { documents?: Doc[] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [type, setType] = useState<ClientDocument["type"]>("passport");
  const upload = useServerFn(uploadMyDocument);
  const queryClient = useQueryClient();

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const prepared = await prepareImage(file);
      const result = await upload({
        data: { type, fileName: prepared.fileName, contentBase64: prepared.contentBase64 },
      });
      if (!result.ok) {
        toast.error(("error" in result && result.error) || "Не удалось загрузить документ");
        return;
      }
      toast.success("Документ отправлен на проверку");
      await queryClient.invalidateQueries({ queryKey: ["me", "profile"] });
    } catch {
      toast.error("Не удалось обработать файл");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <SectionCard
      title="Документы"
      action={
        <div className="flex items-center gap-1.5">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ClientDocument["type"])}
            aria-label="Тип документа"
            className="h-8 rounded-full border border-border bg-card px-2 text-xs text-foreground"
          >
            <option value="passport">Паспорт</option>
            <option value="license">Права</option>
          </select>
          <Button
            size="sm"
            variant="ghost"
            disabled={busy}
            className="h-8 gap-1.5 rounded-full text-accent hover:bg-accent/10 hover:text-accent"
            onClick={() => inputRef.current?.click()}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Загрузить
          </Button>
        </div>
      }
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />

      {documents.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Загрузите фото паспорта и водительского удостоверения — менеджер проверит их до выдачи авто.
        </p>
      ) : (
        <ul className="space-y-2">
          {documents.map((doc) => {
            const s = statusMap[doc.status];
            const Icon = doc.type === "passport" ? IdCard : FileText;
            return (
              <li key={doc.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 ring-1 ring-border">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-muted text-muted-foreground">
                  {doc.fileUrl ? (
                    <img src={doc.fileUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">{typeLabel[doc.type]}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {doc.comment || (doc.number ? `№ ${doc.number}` : "Фото документа")}
                  </div>
                </div>
                <span className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${s.tone}`}>
                  <s.Icon className="h-3.5 w-3.5 shrink-0" /> {s.label}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}
