import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { faqItems, type FaqItem } from "@/mocks/faq";

interface FaqBlockProps {
  items?: FaqItem[];
  title?: string;
  subtitle?: string;
}

export function FaqBlock({
  items = faqItems,
  title = "Ответы на частые вопросы",
  subtitle = "Всё про аренду авто в Новосибирске — залог, документы, страховка, доставка",
}: FaqBlockProps) {
  return (
    <section aria-labelledby="faq-heading" className="mx-auto w-full max-w-4xl px-4 py-12 md:px-6 md:py-16">
      <div className="mb-6 text-center md:mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">FAQ</p>
        <h2 id="faq-heading" className="mt-2 font-display text-2xl font-black md:text-4xl">
          {title}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">{subtitle}</p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {items.map((item, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger className="text-left font-semibold">{item.q}</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-muted-foreground md:text-base">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
