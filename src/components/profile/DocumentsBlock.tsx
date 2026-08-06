import { FileText, IdCard, Upload, Check, Clock, X } from "lucide-react";
import { toast } from "sonner";
import { SectionCard } from "@/components/checkout/SectionCard";
import { Button } from "@/components/ui/button";
import { clientDocuments } from "@/mocks/profile";
import type { ClientDocument } from "@/types/domain";

const typeLabel: Record<ClientDocument["type"], string> = {
  passport: "Паспорт РФ",
  license: "Водительское удостоверение",
};

const statusMap = {
  verified: { label: "Проверено", tone: "text-emerald-700 bg-emerald-100", Icon: Check },
  pending: { label: "На проверке", tone: "text-amber-700 bg-amber-100", Icon: Clock },
  rejected: { label: "Отклонено", tone: "text-rose-700 bg-rose-100", Icon: X },
} as const;

export function DocumentsBlock() {
  return (
    <SectionCard
      title="Документы"
      action={
        <Button
          size="sm"
          variant="ghost"
          className="h-8 gap-1.5 rounded-full text-accent hover:bg-accent/10 hover:text-accent"
          onClick={() => toast("Загрузка документов скоро появится")}
        >
          <Upload className="h-4 w-4" /> Загрузить
        </Button>
      }
    >
      <ul className="space-y-2">
        {clientDocuments.map((doc) => {
          const s = statusMap[doc.status];
          const Icon = doc.type === "passport" ? IdCard : FileText;
          return (
            <li key={doc.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 ring-1 ring-border">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-foreground">{typeLabel[doc.type]}</div>
                <div className="truncate text-xs text-muted-foreground">№ {doc.number}</div>
              </div>
              <span className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${s.tone}`}>
                <s.Icon className="h-3.5 w-3.5 shrink-0" /> {s.label}
              </span>

            </li>
          );
        })}
      </ul>
    </SectionCard>
  );
}
