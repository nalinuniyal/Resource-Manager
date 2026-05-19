import { cn } from "@/lib/utils";

function Table({ className, ...props }) {
  return <div className="w-full overflow-auto"><table className={cn("w-full text-sm", className)} {...props} /></div>;
}
function TableHeader({ className, ...props }) {
  return <thead className={cn("", className)} {...props} />;
}
function TableBody({ className, ...props }) {
  return <tbody className={cn("", className)} {...props} />;
}
function TableRow({ className, ...props }) {
  return <tr className={cn("table-row-glass", className)} {...props} />;
}
function TableHead({ className, ...props }) {
  return <th className={cn("h-10 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-white/5", className)} {...props} />;
}
function TableCell({ className, ...props }) {
  return <td className={cn("px-4 py-3 text-slate-300", className)} {...props} />;
}
export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
