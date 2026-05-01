import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[220px] w-full rounded-[1.75rem] border border-border bg-panel px-5 py-5 text-base leading-7 text-foreground shadow-bleed outline-none transition-all duration-300 placeholder:text-zinc-500 focus:border-accent focus:ring-1 focus:ring-accent",
        className,
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export { Textarea };
