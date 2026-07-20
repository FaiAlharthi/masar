import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  const image = (
    <Image
      src="/MasarLogo.svg"
      alt="مسار | Masar"
      width={90}
      height={64}
      priority
      className={cn("h-14 w-auto", className)}
    />
  );

  if (!onClick) return image;

  return (
    <button type="button" onClick={onClick} aria-label="مسار | Masar">
      {image}
    </button>
  );
}
