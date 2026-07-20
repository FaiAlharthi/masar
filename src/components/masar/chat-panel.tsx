"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLocale } from "@/lib/i18n/locale-provider";
import type { ChatMessage } from "@/lib/types";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChatPanel({
  messages,
  onSend,
  isLoading,
}: {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  isLoading: boolean;
}) {
  const { dict, locale } = useLocale();
  const [value, setValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setValue("");
  };

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap",
                m.role === "user"
                  ? "self-end bg-primary text-primary-foreground"
                  : "self-start bg-card text-card-foreground ring-1 ring-foreground/10",
              )}
            >
              {m.content}
            </div>
          ))}
          {isLoading && (
            <div className="self-start rounded-2xl bg-card px-3.5 py-2.5 text-sm text-muted-foreground ring-1 ring-foreground/10">
              {dict.chat.thinking}
            </div>
          )}
        </div>
      </div>

      <form
        className="flex items-end gap-2 border-t border-border p-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={dict.chat.inputPlaceholder}
          rows={1}
          dir={locale === "ar" ? "rtl" : "ltr"}
          className="max-h-32 min-h-9 resize-none py-2"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <Button type="submit" size="icon" disabled={!value.trim() || isLoading}>
          <Send />
        </Button>
      </form>
    </div>
  );
}
