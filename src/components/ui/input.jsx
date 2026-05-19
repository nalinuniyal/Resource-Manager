import { cn } from "@/lib/utils";

export function Input({ className, ...props }) {
  return (
    <input
      className={cn("glass-input w-full px-3 py-2.5 text-sm", className)}
      {...props}
    />
  );
}
