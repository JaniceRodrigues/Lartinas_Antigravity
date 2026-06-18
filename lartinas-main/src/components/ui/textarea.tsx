import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-brand-green/20 bg-brand-paper/60 px-3 py-2 text-base text-brand-green shadow-sm transition-[color,box-shadow,border-color,background-color] placeholder:text-brand-green/40 hover:border-brand-green/35 focus-visible:border-brand-orange focus-visible:bg-brand-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/25 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
