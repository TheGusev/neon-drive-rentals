import { useState } from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion";
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
          <Accordion type="single" collapsible className="mt-3 grid w-full gap-x-6 md:grid-cols-2">
            {items.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                {/* Текст вопроса — прямой текстовый узел заголовка (виден краулерам),
                    кликабельная область — прозрачный триггер поверх строки. */}
                <AccordionPrimitive.Header asChild>
                  <h3 className="relative flex items-center justify-between gap-3 py-4 text-left text-sm font-semibold [&[data-state=open]_svg]:rotate-180">
                    <span>{item.q}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                    <AccordionPrimitive.Trigger
                      aria-label={item.q}
                      className="absolute inset-0 h-full w-full cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </h3>
                </AccordionPrimitive.Header>
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
