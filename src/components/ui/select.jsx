import { cn } from "@/lib/utils";

export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn("glass-input w-full px-3 py-2.5 text-sm appearance-none cursor-pointer", className)}
      {...props}
    >
      {children}
    </select>
  );
}
