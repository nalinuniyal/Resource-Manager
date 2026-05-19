import { Card, CardContent } from "@/components/ui/card";

export function StatCard({ label, value, hint }) {
  return (
    <Card className="border-slate-200 bg-white">
      <CardContent className="p-5">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="mt-2 text-2xl font-bold text-slate-800">{value}</p>
        {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      </CardContent>
    </Card>
  );
}
