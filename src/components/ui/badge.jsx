import { cn } from "@/lib/utils";

const variants = {
  default: "bg-white/10 text-slate-300 border border-white/10",
  secondary: "bg-white/5 text-slate-400 border border-white/8",
  success: "bg-green-500/15 text-green-400 border border-green-500/25",
  danger: "bg-red-500/15 text-red-400 border border-red-500/25",
  warning: "bg-amber-500/15 text-amber-400 border border-amber-500/25",
  accent: "bg-blue-500/15 text-blue-400 border border-blue-500/25",
  purple: "bg-purple-500/15 text-purple-400 border border-purple-500/25",
};

export function Badge({ className, variant = "default", children }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors", variants[variant], className)}>
      {children}
    </span>
  );
}
