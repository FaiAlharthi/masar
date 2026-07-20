"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Logo } from "@/components/masar/logo";
import { LocaleToggle } from "@/components/masar/locale-toggle";
import { useLocale } from "@/lib/i18n/locale-provider";
import { ArrowLeft, ArrowRight } from "lucide-react";

type StartScreenProps = {
  onSubmit: (description: string) => void;
};

export function StartScreen({ onSubmit }: StartScreenProps) {
  const { dict, locale } = useLocale();
  const [value, setValue] = useState("");

  const suggestions = [
    dict.start.suggestions.cafe,
    dict.start.suggestions.ecommerce,
    dict.start.suggestions.salon,
    dict.start.suggestions.restaurant,
  ];

  const submit = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  const ArrowIcon = locale === "ar" ? ArrowLeft : ArrowRight;

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex items-center justify-between px-8 py-6 sm:px-12">
        <Logo className="h-16 w-auto sm:h-20" />
        <LocaleToggle size="lg" />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-3xl">
          <h1 className="text-center text-4xl font-semibold text-foreground sm:text-5xl lg:text-6xl">
            {dict.start.heading}
          </h1>
          <p className="mt-4 text-center text-lg text-muted-foreground sm:text-xl">
            {dict.start.subheading}
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {suggestions.map((label) => (
              <Button
                key={label}
                variant="secondary"
                className="h-12 rounded-full px-6 text-base"
                onClick={() => submit(label)}
              >
                {label}
              </Button>
            ))}
          </div>

          <form
            className="mt-8 flex flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-foreground/10"
            onSubmit={(e) => {
              e.preventDefault();
              submit(value);
            }}
          >
            <Textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={dict.start.inputPlaceholder}
              rows={3}
              className="resize-none border-0 text-lg shadow-none focus-visible:ring-0"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit(value);
                }
              }}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!value.trim()}
                className="h-11 px-6 text-base"
              >
                {dict.start.submit}
                <ArrowIcon />
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
