import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import {
  buildRoadmap,
  classifyActivity,
  getLicenseDetails,
  loadActivities,
} from "@/lib/data";
import type { License } from "@/lib/types";

const client = new Anthropic();

const MODEL = "claude-opus-4-8";
const MAX_TOOL_ITERATIONS = 6;
const OPEN_CARD_PATTERN = /\[\[OPEN_CARD:([a-z0-9_]+)\]\]\s*$/i;

const tools: Anthropic.Tool[] = [
  {
    name: "classify_activity",
    description:
      "يصنّف وصف المستخدم الحر لمشروعه إلى activity_id مطابق من قاعدة الأنشطة المتاحة. استخدمه فورًا أول ما يوصف المستخدم مشروعه أو نشاطه، قبل أي رد نصي عنه. يرجع أيضًا أسئلة التخصيص الرسمية للنشاط إذا تطابق.",
    input_schema: {
      type: "object",
      properties: {
        description: {
          type: "string",
          description: "وصف المستخدم الحر لمشروعه أو نشاطه بلغته الأصلية",
        },
      },
      required: ["description"],
      additionalProperties: false,
    },
  },
  {
    name: "build_roadmap",
    description:
      "يبني قائمة معرّفات التراخيص المرتبة لنشاط معيّن بناءً على إجابات أسئلة التخصيص. استخدمه فقط بعد ما تجمع من المستخدم إجابة كل سؤال من customization_questions اللي رجعت من classify_activity.",
    input_schema: {
      type: "object",
      properties: {
        activity_id: { type: "string" },
        answers: {
          type: "object",
          description: "خريطة من question_id إلى option_id المختار",
          additionalProperties: { type: "string" },
        },
      },
      required: ["activity_id", "answers"],
      additionalProperties: false,
    },
  },
  {
    name: "get_license_details",
    description:
      "يرجع كامل بيانات ترخيص معيّن (تعريف، خطوات، متطلبات، تكلفة، مدة، نصيحة تاجر، مصدر) بمعرفه license_id. استخدمه دائمًا قبل ما تجاوب عن أي تفاصيل ترخيص محدد بالمحادثة.",
    input_schema: {
      type: "object",
      properties: {
        license_id: { type: "string" },
      },
      required: ["license_id"],
      additionalProperties: false,
    },
  },
];

function systemPrompt(locale: "ar" | "en") {
  return `أنت مساعد منصة "مسار" — منصة ترشد رواد الأعمال في السعودية لكل التراخيص المطلوبة لمشاريعهم.

المبدأ الذهبي: الدقة قبل كل شي. ممنوع تجاوب عن أي نشاط أو ترخيص من معرفتك العامة — أي معلومة عن نشاط أو ترخيص لازم تجي حصرًا من نتيجة استدعاء أداة (classify_activity, build_roadmap, get_license_details). لو النشاط غير مغطى (classify_activity رجعت matched:false)، كن صريح وودود بدون ما تخترع أو تخمّن، وبدون ما تستخدم عبارات تقنية داخلية زي "خارج التغطية" أو "النسخة التجريبية" — المستخدم ما يعرف هذي المصطلحات ولا يهمّه يعرفها.

تسلسل العمل في كل محادثة جديدة:
1. أول ما يوصف المستخدم مشروعه أو نشاطه، استدعِ classify_activity فورًا بوصفه كما كتبه.
2. لو matched:false، استخدم نص حقل message من نتيجة الأداة كأساس ردك (ما تخترع صياغة ثانية، وما تقول "خارج التغطية" أو "نسخة تجريبية")، واسأله إذا يبي يجرب أحد الأنشطة المذكورة.
3. لو matched:true ومصفوفة customization_questions فيها أسئلة، اسألها وحدة وحدة، بنفس نصها بالضبط (بلغة الرد المطلوبة)، بأسلوب محادثة طبيعي — لا تعرضها كأزرار ولا تختصرها ولا تحذف أي شرح فيها. كل سؤال موجود بالبيانات له سبب (يغيّر التراخيص المطلوبة)، فلا تضيف أسئلة من عندك مالها داعي. لو المصفوفة فاضية، معناها ما فيه شي يحتاج توضيح — انتقل مباشرة للخطوة 4 بدون ما تسأل أي سؤال.
4. بعد ما تجمع إجابة كل الأسئلة الموجودة (بمطابقة كل إجابة مع أحد option_id المتاحة لنفس السؤال) — أو فورًا لو ما فيه أسئلة أصلاً — استدعِ build_roadmap بمعرف النشاط وخريطة الإجابات (question_id -> option_id، أو كائن فاضي {} لو ما فيه أسئلة).
5. بعد نجاح build_roadmap، اكتب رد قصير وودود يخبر المستخدم إن خارطة الطريق جاهزة بالواجهة المجاورة، واذكر بصراحة أي تراخيص وفّرتها عليه إجاباته (مثال: "وفرت عليك رخصة البلدية لأنك أونلاين بالكامل") إن وجدت — لا تكرر تفاصيل كل ترخيص هنا، الخارطة نفسها معروضة بالواجهة.
6. لو المستخدم سأل عن تفاصيل ترخيص معيّن (تكلفة، خطوات، مصدر، مدة...)، استدعِ get_license_details أول واجعل ردك مبني حصرًا على نتيجته.
7. لو تبي تفتح بطاقة ترخيص معيّن تلقائيًا بالواجهة، ضيف حصرًا بآخر سطر من ردك النص التالي (بدون أي نص إضافي بعده): [[OPEN_CARD:license_id]] — هذا السطر ما يظهر للمستخدم مباشرة، النظام يقتصه ويستخدمه لفتح البطاقة.
8. لو سؤال المستخدم بعيد كليًا عن التراخيص والأنشطة التجارية، جاوب بإيجاز وودّ بدون استدعاء أدوات.

جاوب دائمًا بلغة "${locale === "ar" ? "العربية" : "الإنجليزية (English)"}" فقط، بأسلوب محادثة طبيعي مختصر وودود، بدون رموز تنسيق زائدة.`;
}

type IncomingMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      messages: IncomingMessage[];
      locale?: "ar" | "en";
    };
    const locale = body.locale === "en" ? "en" : "ar";

    if (!body.messages?.length) {
      return NextResponse.json(
        { error: "messages is required" },
        { status: 400 },
      );
    }

    const messages: Anthropic.MessageParam[] = body.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    let roadmapResult: {
      activityId: string;
      caseKey: string;
      licenses: License[];
    } | null = null;

    let finalText = "";

    for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 2048,
        system: systemPrompt(locale),
        tools,
        messages,
      });

      if (response.stop_reason !== "tool_use") {
        finalText = response.content
          .filter((block): block is Anthropic.TextBlock => block.type === "text")
          .map((block) => block.text)
          .join("\n")
          .trim();
        break;
      }

      messages.push({ role: "assistant", content: response.content });

      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const block of response.content) {
        if (block.type !== "tool_use") continue;

        let output: unknown;
        try {
          if (block.name === "classify_activity") {
            const input = block.input as { description: string };
            const result = classifyActivity(input.description, locale);
            if (result.matched) {
              const activity = loadActivities().find(
                (a) => a.id === result.activity_id,
              );
              output = {
                ...result,
                customization_questions: activity?.customization_questions ?? [],
              };
            } else {
              output = result;
            }
          } else if (block.name === "build_roadmap") {
            const input = block.input as {
              activity_id: string;
              answers: Record<string, string>;
            };
            const result = buildRoadmap(input.activity_id, input.answers);
            output = result;
            if (result.ok) {
              const licenses = result.license_ids
                .map((id) => getLicenseDetails(id))
                .filter(
                  (r): r is { found: true; license: License } => r.found,
                )
                .map((r) => r.license);
              roadmapResult = {
                activityId: result.activity_id,
                caseKey: result.case_key,
                licenses,
              };
            }
          } else if (block.name === "get_license_details") {
            const input = block.input as { license_id: string };
            output = getLicenseDetails(input.license_id);
          } else {
            output = { error: `unknown tool: ${block.name}` };
          }
        } catch (err) {
          output = { error: String(err) };
        }

        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: JSON.stringify(output),
        });
      }

      messages.push({ role: "user", content: toolResults });
    }

    const openCardMatch = finalText.match(OPEN_CARD_PATTERN);
    const openCard = openCardMatch ? openCardMatch[1] : null;
    if (openCardMatch) {
      finalText = finalText.slice(0, openCardMatch.index).trim();
    }

    return NextResponse.json({
      reply: finalText,
      open_card: openCard,
      roadmap: roadmapResult,
    });
  } catch (error) {
    console.error("chat route error", error);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 },
    );
  }
}
