import { cn } from "@/lib/utils";

const variants = {
  default: "bg-blue-600 hover:bg-blue-500 text-white glow-blue",
  outline: "glass border-glass text-slate-300 hover:text-white hover:bg-white/8",
  ghost: "text-slate-400 hover:text-slate-200 hover:bg-white/6",
  danger: "bg-red-500/15 border border-red-500/25 text-red-400 hover:bg-red-500/25",
};
const sizes = {
  default: "h-9 px-4 py-2 text-sm",
  sm: "h-8 px-3 text-xs",
  lg: "h-11 px-6 text-base",
  icon: "h-8 w-8",
};

export function Button({ className, variant = "default", size = "default", ...props }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none focus:outline-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
