"use client";

import { useEffect, useState } from "react";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { LicenseCard } from "@/components/masar/license-card";
import { useLocale } from "@/lib/i18n/locale-provider";
import { computeRoadmapStats } from "@/lib/roadmap-stats";
import type { Roadmap } from "@/lib/types";
import { ListChecks, Wallet, Clock, RotateCcw, Download } from "lucide-react";

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ListChecks;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </div>
      <div className="text-lg font-semibold text-foreground">{value}</div>
    </div>
  );
}

export function RoadmapPanel({
  roadmap,
  openCardId,
  onNewProject,
}: {
  roadmap: Roadmap | null;
  openCardId: string | null;
  onNewProject: () => void;
}) {
  const { dict, locale } = useLocale();
  const [openItems, setOpenItems] = useState<string[]>([]);

  const roadmapKey = roadmap ? `${roadmap.activityId}:${roadmap.caseKey}` : null;
  const [syncedRoadmapKey, setSyncedRoadmapKey] = useState(roadmapKey);
  if (roadmapKey !== syncedRoadmapKey) {
    setSyncedRoadmapKey(roadmapKey);
    setOpenItems(roadmap && roadmap.licenses.length > 0 ? [roadmap.licenses[0].id] : []);
  }

  const [syncedOpenCardId, setSyncedOpenCardId] = useState(openCardId);
  if (openCardId && openCardId !== syncedOpenCardId) {
    setSyncedOpenCardId(openCardId);
    setOpenItems((prev) =>
      prev.includes(openCardId) ? prev : [...prev, openCardId],
    );
  }

  useEffect(() => {
    if (!openCardId) return;
    const el = document.getElementById(`license-card-${openCardId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [openCardId]);

  const allOpen =
    !!roadmap && openItems.length === roadmap.licenses.length && roadmap.licenses.length > 0;

  const toggleExpandAll = () => {
    if (!roadmap) return;
    setOpenItems(allOpen ? [] : roadmap.licenses.map((l) => l.id));
  };

  const handleDownloadPdf = () => {
    if (!roadmap) return;
    setOpenItems(roadmap.licenses.map((l) => l.id));
    setTimeout(() => window.print(), 50);
  };

  const stats = roadmap ? computeRoadmapStats(roadmap.licenses, locale) : null;

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-4 sm:p-6" id="roadmap-print-area">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-foreground">
          {dict.roadmap.title}
        </h2>
        <div className="flex items-center gap-2 print:hidden">
          <Button variant="ghost" size="sm" onClick={onNewProject}>
            <RotateCcw />
            {dict.roadmap.newProject}
          </Button>
          {roadmap && (
            <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
              <Download />
              {dict.roadmap.downloadPdf}
            </Button>
          )}
        </div>
      </div>

      {!roadmap ? (
        <div className="flex flex-1 items-center justify-center rounded-xl bg-card p-8 text-center text-sm text-muted-foreground ring-1 ring-foreground/10">
          {dict.roadmap.empty}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              icon={ListChecks}
              label={dict.roadmap.stepsCount}
              value={String(stats!.totalSteps)}
            />
            <StatCard
              icon={Wallet}
              label={dict.roadmap.approxCost}
              value={
                stats!.cost.min === stats!.cost.max
                  ? `${stats!.cost.min} ${dict.roadmap.sar}`
                  : `${stats!.cost.min}–${stats!.cost.max} ${dict.roadmap.sar}`
              }
            />
            <StatCard
              icon={Clock}
              label={dict.roadmap.approxDuration}
              value={stats!.longestDuration.value}
            />
          </div>

          <div className="flex justify-end print:hidden">
            <Button variant="ghost" size="sm" onClick={toggleExpandAll}>
              {allOpen ? dict.roadmap.collapseAll : dict.roadmap.expandAll}
            </Button>
          </div>

          <Accordion
            type="multiple"
            value={openItems}
            onValueChange={setOpenItems}
            className="flex flex-col gap-3"
          >
            {roadmap.licenses.map((license, i) => (
              <LicenseCard key={license.id} license={license} order={i + 1} />
            ))}
          </Accordion>
        </>
      )}
    </div>
  );
}
