"use client";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n/locale-provider";
import { Languages } from "lucide-react";
import { cn } from "@/lib/utils";

export function LocaleToggle({
  size = "sm",
  className,
}: {
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  const { dict, toggleLocale } = useLocale();
  return (
    <Button
      variant="outline"
      size={size}
      onClick={toggleLocale}
      className={cn(size === "lg" && "text-base", className)}
    >
      <Languages />
      {dict.common.switchLang}
    </Button>
  );
}
