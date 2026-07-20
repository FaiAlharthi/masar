import fs from "node:fs";
import path from "node:path";
import type { Activity, License } from "./types";
import type { Locale } from "./i18n/dictionaries";

const DATA_DIR = path.join(process.cwd(), "data");

function readJson<T>(filename: string): T {
  const raw = fs.readFileSync(path.join(DATA_DIR, filename), "utf-8");
  return JSON.parse(raw) as T;
}

let activitiesCache: Activity[] | null = null;
let licensesCache: License[] | null = null;

export function loadActivities(): Activity[] {
  if (!activitiesCache) {
    activitiesCache = readJson<Activity[]>("activities.json");
  }
  return activitiesCache;
}

export function loadLicenses(): License[] {
  if (!licensesCache) {
    licensesCache = readJson<License[]>("licenses.json");
  }
  return licensesCache;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ً-ْ]/g, "") // strip Arabic diacritics
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .trim();
}

export type ClassifyActivityResult =
  | { matched: true; activity_id: string; activity_name: string }
  | { matched: false; message: string };

export function classifyActivity(
  description: string,
  locale: Locale = "ar",
): ClassifyActivityResult {
  const activities = loadActivities();
  const normalizedDescription = normalize(description);

  for (const activity of activities) {
    const candidates = [
      activity.name.ar,
      activity.name.en,
      ...(activity.keywords ?? []),
    ];
    const isMatch = candidates.some((candidate) =>
      normalizedDescription.includes(normalize(candidate)),
    );
    if (isMatch) {
      return {
        matched: true,
        activity_id: activity.id,
        activity_name: activity.name[locale],
      };
    }
  }

  const availableNames = activities.map((a) => a.name[locale]).join(locale === "ar" ? "، " : ", ");
  const message =
    locale === "ar"
      ? `ما عندي بيانات رسمية دقيقة عن هذا النشاط لسا. الأنشطة اللي أقدر أبني لها خارطة طريق كاملة الحين: ${availableNames}. تحب تجرب وحدة منها؟`
      : `I don't have accurate official data for this activity yet. Right now I can build a full roadmap for: ${availableNames}. Want to try one of these instead?`;
  return { matched: false, message };
}

export type BuildRoadmapResult =
  | { ok: true; activity_id: string; case_key: string; license_ids: string[] }
  | { ok: false; error: string };

export function buildRoadmap(
  activityId: string,
  answers: Record<string, string>,
): BuildRoadmapResult {
  const activity = loadActivities().find((a) => a.id === activityId);
  if (!activity) {
    return { ok: false, error: `activity_id غير معروف: ${activityId}` };
  }

  const missing = activity.customization_questions.filter(
    (q) => !answers[q.id],
  );
  if (missing.length > 0) {
    return {
      ok: false,
      error: `ناقص إجابات على: ${missing.map((q) => q.id).join(", ")}`,
    };
  }

  const caseKey =
    activity.customization_questions.length === 0
      ? "default"
      : activity.customization_questions.map((q) => answers[q.id]).join("+");

  const licenseIds = activity.license_map[caseKey];
  if (!licenseIds) {
    return {
      ok: false,
      error: `لا توجد خارطة تراخيص لهذي التوليفة: ${caseKey}`,
    };
  }

  return {
    ok: true,
    activity_id: activityId,
    case_key: caseKey,
    license_ids: licenseIds,
  };
}

export type GetLicenseDetailsResult =
  | { found: true; license: License }
  | { found: false; error: string };

export function getLicenseDetails(licenseId: string): GetLicenseDetailsResult {
  const license = loadLicenses().find((l) => l.id === licenseId);
  if (!license) {
    return { found: false, error: `license_id غير معروف: ${licenseId}` };
  }
  return { found: true, license };
}
