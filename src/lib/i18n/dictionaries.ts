export type Locale = "ar" | "en";

export type Dictionary = {
  appName: string;
  appTagline: string;
  start: {
    heading: string;
    subheading: string;
    suggestions: {
      cafe: string;
      ecommerce: string;
      salon: string;
      restaurant: string;
    };
    inputPlaceholder: string;
    submit: string;
  };
  chat: {
    title: string;
    inputPlaceholder: string;
    send: string;
    thinking: string;
    error: string;
  };
  roadmap: {
    title: string;
    stepsCount: string;
    approxCost: string;
    approxDuration: string;
    expandAll: string;
    collapseAll: string;
    newProject: string;
    newProjectConfirm: string;
    downloadPdf: string;
    empty: string;
    required: string;
    conditional: string;
    optional: string;
    definition: string;
    steps: string;
    prerequisites: string;
    merchantTip: string;
    source: string;
    lastVerified: string;
    approximate: string;
    sar: string;
  };
  common: {
    cancel: string;
    confirm: string;
    switchLang: string;
  };
};

export const dictionaries: Record<Locale, Dictionary> = {
  ar: {
    appName: "مسار",
    appTagline: "خارطة طريقك لكل تراخيص مشروعك",
    start: {
      heading: "وش مشروعك اللي ناوي تفتحه؟",
      subheading:
        "صف مشروعك بكلماتك، وبنبني لك خارطة طريق كاملة بكل التراخيص المطلوبة.",
      suggestions: {
        cafe: "مقهى",
        ecommerce: "متجر إلكتروني",
        salon: "صالون",
        restaurant: "مطعم",
      },
      inputPlaceholder: "اكتب وصف مشروعك هنا...",
      submit: "ابدأ",
    },
    chat: {
      title: "المحادثة",
      inputPlaceholder: "اكتب رسالتك...",
      send: "إرسال",
      thinking: "جاري التفكير...",
      error: "صار خطأ غير متوقع. حاول مرة ثانية.",
    },
    roadmap: {
      title: "خارطة الطريق",
      stepsCount: "عدد الخطوات",
      approxCost: "التكلفة التقريبية",
      approxDuration: "المدة المتوقعة",
      expandAll: "وسّع الكل",
      collapseAll: "اطوِ الكل",
      newProject: "مشروع جديد",
      newProjectConfirm:
        "هذا الإجراء بيمسح المحادثة والخارطة الحالية وترجع لشاشة البداية. متأكد؟",
      downloadPdf: "حمّل خطتك PDF",
      empty: "ابدأ محادثة عشان نبني لك خارطة الطريق",
      required: "إلزامي",
      conditional: "مشروط",
      optional: "اختياري",
      definition: "وش هو؟",
      steps: "خطوات الاستخراج",
      prerequisites: "المتطلبات المسبقة",
      merchantTip: "نصيحة تاجر",
      source: "المصدر",
      lastVerified: "آخر تحقق",
      approximate: "تقريبي — تحقق من الجهة",
      sar: "ريال",
    },
    common: {
      cancel: "إلغاء",
      confirm: "تأكيد",
      switchLang: "English",
    },
  },
  en: {
    appName: "Masar",
    appTagline: "Your roadmap to every license your project needs",
    start: {
      heading: "What's the project you're planning to open?",
      subheading:
        "Describe your project in your own words, and we'll build you a full roadmap of every required license.",
      suggestions: {
        cafe: "Café",
        ecommerce: "Online Store",
        salon: "Salon",
        restaurant: "Restaurant",
      },
      inputPlaceholder: "Describe your project here...",
      submit: "Start",
    },
    chat: {
      title: "Chat",
      inputPlaceholder: "Type your message...",
      send: "Send",
      thinking: "Thinking...",
      error: "Something went wrong. Please try again.",
    },
    roadmap: {
      title: "Roadmap",
      stepsCount: "Number of steps",
      approxCost: "Approximate cost",
      approxDuration: "Expected duration",
      expandAll: "Expand all",
      collapseAll: "Collapse all",
      newProject: "New project",
      newProjectConfirm:
        "This will clear the current chat and roadmap and take you back to the start screen. Are you sure?",
      downloadPdf: "Download your plan (PDF)",
      empty: "Start a conversation so we can build your roadmap",
      required: "Required",
      conditional: "Conditional",
      optional: "Optional",
      definition: "What is it?",
      steps: "Extraction steps",
      prerequisites: "Prerequisites",
      merchantTip: "Merchant tip",
      source: "Source",
      lastVerified: "Last verified",
      approximate: "Approximate — verify with the authority",
      sar: "SAR",
    },
    common: {
      cancel: "Cancel",
      confirm: "Confirm",
      switchLang: "عربي",
    },
  },
};
