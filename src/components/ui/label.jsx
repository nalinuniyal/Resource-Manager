import { cn } from "@/lib/utils";
export function Label({ className, ...props }) {
  return <label className={cn("text-xs font-semibold text-slate-400 uppercase tracking-wider", className)} {...props} />;
}
