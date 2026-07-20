export type Localized = {
  ar: string;
  en: string;
};

export type LicenseClassification = "required" | "conditional" | "optional";

export type License = {
  id: string;
  name: Localized;
  authority: Localized;
  authority_url: string;
  classification: LicenseClassification;
  condition: Localized | null;
  definition: Localized;
  steps: Localized[];
  prerequisites: Localized[];
  cost: {
    amount: Localized;
    currency: "SAR";
    is_approximate: boolean;
  };
  duration: {
    value: Localized;
    is_approximate: boolean;
  };
  merchant_tip: Localized;
  last_verified: string;
};

export type ActivityQuestionOption = {
  id: string;
  label: Localized;
};

export type ActivityQuestion = {
  id: string;
  question: Localized;
  options: ActivityQuestionOption[];
};

export type Activity = {
  id: string;
  name: Localized;
  isic_code: string;
  keywords: string[];
  customization_questions: ActivityQuestion[];
  license_map: Record<string, string[]>;
};

export type Roadmap = {
  activityId: string;
  caseKey: string;
  licenses: License[];
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};
