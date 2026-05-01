import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-2xl border border-border bg-panel px-4 py-3 text-sm text-foreground shadow-bleed outline-none transition-all duration-300 placeholder:text-zinc-500 focus:border-accent focus:ring-1 focus:ring-accent",
        className,
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";

export { Input };
