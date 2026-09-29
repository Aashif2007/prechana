import * as React from "react";

// Minimal shadcn-style button (no extra dependencies)
export function Button({ className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={"inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-white disabled:opacity-50 " + className}
      {...props}
    />
  );
}
