import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-brand-green/20 bg-brand-paper/60 px-3 py-1 text-base text-brand-green shadow-sm transition-[color,box-shadow,border-color,background-color] file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-brand-green placeholder:text-brand-green/40 hover:border-brand-green/35 focus-visible:border-brand-orange focus-visible:bg-brand-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/25 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
