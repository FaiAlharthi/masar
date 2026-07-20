import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/lib/i18n/locale-provider";
import type { License } from "@/lib/types";
import { CheckCircle2, ExternalLink } from "lucide-react";

const CLASSIFICATION_VARIANT: Record<
  License["classification"],
  "default" | "secondary" | "outline"
> = {
  required: "default",
  conditional: "secondary",
  optional: "outline",
};

function formatCost(
  license: License,
  dict: ReturnType<typeof useLocale>["dict"],
  locale: ReturnType<typeof useLocale>["locale"],
) {
  const label = `${license.cost.amount[locale]} ${dict.roadmap.sar}`;
  return license.cost.is_approximate
    ? `${label} (${dict.roadmap.approximate})`
    : label;
}

function formatDuration(
  license: License,
  dict: ReturnType<typeof useLocale>["dict"],
  locale: ReturnType<typeof useLocale>["locale"],
) {
  return license.duration.is_approximate
    ? `${license.duration.value[locale]} (${dict.roadmap.approximate})`
    : license.duration.value[locale];
}

export function LicenseCard({
  license,
  order,
}: {
  license: License;
  order: number;
}) {
  const { locale, dict } = useLocale();

  return (
    <AccordionItem
      value={license.id}
      id={`license-card-${license.id}`}
      className="rounded-xl bg-card px-4 ring-1 ring-foreground/10"
    >
      <AccordionTrigger className="py-4 hover:no-underline">
        <div className="flex w-full flex-col gap-2 pe-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {order}
            </span>
            <div className="flex flex-col gap-1">
              <span className="font-medium text-foreground">
                {license.name[locale]}
              </span>
              <span className="text-xs text-muted-foreground">
                {license.authority[locale]}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 ps-9 sm:ps-0">
            <Badge variant={CLASSIFICATION_VARIANT[license.classification]}>
              {dict.roadmap[license.classification]}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatCost(license, dict, locale)}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDuration(license, dict, locale)}
            </span>
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent>
        <div className="flex flex-col gap-5 border-t border-border pt-4">
          <section className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">
                {dict.roadmap.approxCost}:{" "}
              </span>
              <span className="font-medium">{formatCost(license, dict, locale)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">
                {dict.roadmap.approxDuration}:{" "}
              </span>
              <span className="font-medium">
                {formatDuration(license, dict, locale)}
              </span>
            </div>
            {license.condition && (
              <div className="w-full text-xs text-muted-foreground">
                {license.condition[locale]}
              </div>
            )}
          </section>

          <section>
            <h4 className="mb-1.5 text-sm font-semibold text-foreground">
              {dict.roadmap.definition}
            </h4>
            <p className="text-sm text-muted-foreground">
              {license.definition[locale]}
            </p>
          </section>

          <section>
            <h4 className="mb-2 text-sm font-semibold text-foreground">
              {dict.roadmap.steps}
            </h4>
            <ol className="flex flex-col gap-2">
              {license.steps.map((step, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground">{step[locale]}</span>
                </li>
              ))}
            </ol>
          </section>

          {license.prerequisites.length > 0 && (
            <section>
              <h4 className="mb-2 text-sm font-semibold text-foreground">
                {dict.roadmap.prerequisites}
              </h4>
              <div className="flex flex-wrap gap-2">
                {license.prerequisites.map((prereq, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
                  >
                    {prereq[locale]}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-lg bg-tip p-3 ring-1 ring-tip-border">
            <h4 className="mb-1 text-sm font-semibold text-tip-foreground">
              {dict.roadmap.merchantTip}
            </h4>
            <p className="text-sm text-tip-foreground">
              {license.merchant_tip[locale]}
            </p>
          </section>

          <section className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted px-3 py-2">
            <a
              href={license.authority_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              {dict.roadmap.source}: {license.authority[locale]}
              <ExternalLink className="size-3.5" />
            </a>
            <span className="flex items-center gap-1 rounded-full bg-verified px-2.5 py-1 text-xs font-medium text-verified-foreground">
              <CheckCircle2 className="size-3.5" />
              {dict.roadmap.lastVerified}: {license.last_verified}
            </span>
          </section>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
