"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StartScreen } from "@/components/masar/start-screen";
import { ChatPanel } from "@/components/masar/chat-panel";
import { RoadmapPanel } from "@/components/masar/roadmap-panel";
import { Logo } from "@/components/masar/logo";
import { LocaleToggle } from "@/components/masar/locale-toggle";
import { useLocale } from "@/lib/i18n/locale-provider";
import type { ChatMessage, Roadmap } from "@/lib/types";

type ChatApiResponse = {
  reply: string;
  open_card: string | null;
  roadmap: Roadmap | null;
  error?: string;
};

let messageIdCounter = 0;
function nextId() {
  messageIdCounter += 1;
  return `msg_${messageIdCounter}`;
}

export default function Home() {
  const { dict, locale } = useLocale();
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [openCardId, setOpenCardId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const sendToApi = async (history: ChatMessage[]) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
          locale,
        }),
      });

      if (!res.ok) throw new Error("request_failed");
      const data = (await res.json()) as ChatApiResponse;
      if (data.error) throw new Error(data.error);

      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "assistant", content: data.reply },
      ]);
      if (data.roadmap) setRoadmap(data.roadmap);
      setOpenCardId(data.open_card ?? null);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "assistant", content: dict.chat.error },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = (description: string) => {
    const userMessage: ChatMessage = {
      id: nextId(),
      role: "user",
      content: description,
    };
    setStarted(true);
    setMessages([userMessage]);
    void sendToApi([userMessage]);
  };

  const handleSend = (text: string) => {
    const userMessage: ChatMessage = {
      id: nextId(),
      role: "user",
      content: text,
    };
    const next = [...messages, userMessage];
    setMessages(next);
    void sendToApi(next);
  };

  const resetAll = () => {
    setStarted(false);
    setMessages([]);
    setRoadmap(null);
    setOpenCardId(null);
    setConfirmOpen(false);
  };

  if (!started) {
    return <StartScreen onSubmit={handleStart} />;
  }

  return (
    <div className="flex h-dvh flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-4 py-3 print:hidden">
        <Logo onClick={resetAll} />
        <LocaleToggle />
      </header>

      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        <div className="order-2 flex min-h-0 flex-1 flex-col border-border lg:order-1 lg:w-2/5 lg:flex-none lg:border-e">
          <ChatPanel messages={messages} onSend={handleSend} isLoading={isLoading} />
        </div>
        <div className="order-1 min-h-0 flex-1 border-b border-border lg:order-2 lg:w-3/5 lg:flex-none lg:border-b-0">
          <RoadmapPanel
            roadmap={roadmap}
            openCardId={openCardId}
            onNewProject={() => setConfirmOpen(true)}
          />
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dict.roadmap.newProject}</DialogTitle>
            <DialogDescription>
              {dict.roadmap.newProjectConfirm}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{dict.common.cancel}</Button>
            </DialogClose>
            <Button variant="destructive" onClick={resetAll}>
              {dict.common.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
