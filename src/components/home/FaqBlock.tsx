import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useIsMobile } from "@/hooks/use-mobile";
import { faqItems, type FaqItem } from "@/mocks/faq";

interface FaqBlockProps {
  items?: FaqItem[];
  title?: string;
  subtitle?: string;
}

export function FaqBlock({
  items = faqItems,
  title = "Ответы на частые вопросы",
  subtitle = "Всё про аренду авто в Новосибирске — залог, документы, страховка, выдача",
}: FaqBlockProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState<boolean | undefined>(undefined);
  const isOpen = open ?? !isMobile;

  return (
    <section aria-labelledby="faq-heading" className="mx-auto w-full max-w-4xl px-4 py-10 md:px-6 md:py-16">
      <Collapsible open={isOpen} onOpenChange={setOpen}>
        <CollapsibleTrigger className="group flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-card/50 p-4 text-left transition hover:border-accent md:p-5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent">
            <HelpCircle className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] uppercase tracking-[0.3em] text-muted-foreground">FAQ</span>
            <h2 id="faq-heading" className="font-display text-lg font-black leading-tight md:text-2xl">
              {title}
            </h2>
            <span className="mt-1 block text-xs text-muted-foreground md:text-sm">{subtitle}</span>
          </span>
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-accent transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          />
        </CollapsibleTrigger>

        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          <Accordion type="single" collapsible className="mt-3 w-full">
            {items.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left font-semibold">{item.q}</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground md:text-base">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
}
