import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-xl border border-line bg-cream px-3 text-sm text-ink outline-none placeholder:text-muted focus-visible:border-ink",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
