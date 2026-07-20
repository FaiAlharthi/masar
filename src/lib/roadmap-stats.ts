import type { License } from "./types";
import type { Locale } from "./i18n/dictionaries";

const UNIT_TO_DAYS: Record<string, number> = {
  "يوم": 1,
  "أيام": 1,
  "day": 1,
  "days": 1,
  "أسبوع": 7,
  "أسابيع": 7,
  "week": 7,
  "weeks": 7,
  "شهر": 30,
  "أشهر": 30,
  "month": 30,
  "months": 30,
};

function extractNumbers(text: string): number[] {
  return Array.from(text.matchAll(/\d+(?:\.\d+)?/g)).map((m) => Number(m[0]));
}

function maxDaysEstimate(durationText: string): number {
  const numbers = extractNumbers(durationText);
  if (numbers.length === 0) return 0;
  const max = Math.max(...numbers);
  const unitEntry = Object.entries(UNIT_TO_DAYS).find(([unit]) =>
    durationText.includes(unit),
  );
  const multiplier = unitEntry ? unitEntry[1] : 1;
  return max * multiplier;
}

export type RoadmapStats = {
  totalSteps: number;
  cost: { min: number; max: number; currency: string };
  longestDuration: { value: string; is_approximate: boolean };
};

export function computeRoadmapStats(
  licenses: License[],
  locale: Locale,
): RoadmapStats {
  const totalSteps = licenses.reduce((sum, l) => sum + l.steps.length, 0);

  let costMin = 0;
  let costMax = 0;
  for (const license of licenses) {
    const numbers = extractNumbers(license.cost.amount[locale]);
    if (numbers.length === 0) continue;
    costMin += Math.min(...numbers);
    costMax += Math.max(...numbers);
  }

  let longest: License | null = null;
  let longestDays = -1;
  for (const license of licenses) {
    const days = maxDaysEstimate(license.duration.value[locale]);
    if (days > longestDays) {
      longestDays = days;
      longest = license;
    }
  }

  return {
    totalSteps,
    cost: {
      min: costMin,
      max: costMax,
      currency: licenses[0]?.cost.currency ?? "SAR",
    },
    longestDuration: {
      value: longest?.duration.value[locale] ?? "—",
      is_approximate: true,
    },
  };
}
