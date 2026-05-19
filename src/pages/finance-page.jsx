import { useState, useMemo } from "react";
import { IndianRupee, DollarSign, TrendingUp, TrendingDown, Percent, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { formatCurrency, formatMoneyPair, sumByCurrency } from "@/lib/utils";

export function FinancePage({ assignments }) {
  const [currency, setCurrency] = useState("INR");
  const [sort, setSort] = useState("profit_desc");

  const totalRevenue = sumByCurrency(assignments, (i) => i.client_billing_amount, (i) => i.currency_code);
  const totalCost = sumByCurrency(assignments, (i) => i.developer_cost, (i) => i.currency_code);
  const totalProfit = sumByCurrency(assignments, (i) => i.profit, (i) => i.currency_code);

  const fmt = (val) => currency === "INR" ? formatCurrency(val.INR, "INR") : formatCurrency(val.USD, "USD");
  const fmtHint = (val) => currency === "INR" ? `≈ ${formatCurrency(val.USD, "USD")}` : `≈ ${formatCurrency(val.INR, "INR")}`;

  const overallMargin = totalRevenue.INR > 0 ? Math.round((totalProfit.INR / totalRevenue.INR) * 100) : 0;

  const sorted = useMemo(() => {
    const arr = [...assignments];
    if (sort === "profit_desc") arr.sort((a, b) => Number(b.profit || 0) - Number(a.profit || 0));
    if (sort === "profit_asc") arr.sort((a, b) => Number(a.profit || 0) - Number(b.profit || 0));
    if (sort === "revenue_desc") arr.sort((a, b) => Number(b.client_billing_amount || 0) - Number(a.client_billing_amount || 0));
    if (sort === "margin_desc") {
      arr.sort((a, b) => {
        const ma = Number(a.client_billing_amount) > 0 ? Number(a.profit) / Number(a.client_billing_amount) : 0;
        const mb = Number(b.client_billing_amount) > 0 ? Number(b.profit) / Number(b.client_billing_amount) : 0;
        return mb - ma;
      });
    }
    return arr;
  }, [assignments, sort]);

  // Per-client summary
  const clientSummary = useMemo(() => {
    const map = {};
    assignments.forEach((a) => {
      const name = a.requirement?.client?.name ?? "Unknown";
      if (!map[name]) map[name] = { revenue: 0, cost: 0, profit: 0, count: 0 };
      map[name].revenue += Number(a.client_billing_amount || 0);
      map[name].cost += Number(a.developer_cost || 0);
      map[name].profit += Number(a.profit || 0);
      map[name].count++;
    });
    return Object.entries(map).sort((a, b) => b[1].profit - a[1].profit);
  }, [assignments]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <PageHeader eyebrow="Finance" title="Revenue & Margin"
          description="Assignment billing and developer costs translated into real operating profit." />
        <div className="flex items-center gap-1 rounded-xl p-1 shrink-0"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {["INR", "USD"].map((c) => (
            <button key={c} onClick={() => setCurrency(c)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currency === c ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-300"}`}>
              {c === "INR" ? <IndianRupee className="h-3.5 w-3.5" /> : <DollarSign className="h-3.5 w-3.5" />}
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Total Revenue", val: totalRevenue, icon: TrendingUp, color: "blue" },
          { label: "Total Cost", val: totalCost, icon: TrendingDown, color: "red" },
          { label: "Total Profit", val: totalProfit, icon: Percent, color: "green" },
        ].map(({ label, val, icon: Icon, color }) => (
          <div key={label} className="glass-card p-5"
            style={{ borderColor: `rgba(var(--accent-${color === "blue" ? "blue" : color === "red" ? "red" : "green"}-rgb, 0.2)` }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</p>
              <Icon className={`h-4 w-4 ${color === "blue" ? "text-blue-400" : color === "red" ? "text-red-400" : "text-green-400"}`} />
            </div>
            <p className={`text-2xl font-bold mono ${color === "blue" ? "text-blue-300" : color === "red" ? "text-red-300" : "text-green-300"}`}>{fmt(val)}</p>
            <p className="text-xs mt-1 text-slate-600">{fmtHint(val)}</p>
          </div>
        ))}
      </div>

      {/* Margin banner */}
      {assignments.length > 0 && (
        <div className="rounded-xl px-6 py-4 flex items-center justify-between"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-slate-400 text-sm font-medium">Overall Profit Margin</p>
          <span className={`text-2xl font-bold mono ${overallMargin >= 20 ? "text-green-400" : overallMargin >= 0 ? "text-amber-400" : "text-red-400"}`}>
            {overallMargin}%
          </span>
        </div>
      )}

      {/* Per-client breakdown */}
      {clientSummary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Revenue by Client</CardTitle>
            <CardDescription>Profit contribution per account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {clientSummary.map(([name, data]) => {
              const margin = data.revenue > 0 ? Math.round((data.profit / data.revenue) * 100) : 0;
              const pct = clientSummary[0][1].revenue > 0 ? (data.revenue / clientSummary[0][1].revenue) * 100 : 0;
              return (
                <div key={name} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-slate-300 truncate">{name}</p>
                      <span className={`text-xs font-bold mono ${margin >= 20 ? "text-green-400" : margin >= 0 ? "text-amber-400" : "text-red-400"}`}>{margin}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5">
                      <div className="h-1.5 rounded-full bg-blue-500/50 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs mono text-slate-300">{formatCurrency(data.revenue, "INR")}</p>
                    <p className="text-xs text-slate-600">{data.count} assignment{data.count > 1 ? "s" : ""}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Detailed table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm">Assignment Margin Table</CardTitle>
              <CardDescription>Every assignment with billing, cost, and profit visibility.</CardDescription>
            </div>
            <Select value={sort} onChange={(e) => setSort(e.target.value)} className="w-44 text-xs py-1.5">
              <option value="profit_desc">Profit ↓</option>
              <option value="profit_asc">Profit ↑</option>
              <option value="revenue_desc">Revenue ↓</option>
              <option value="margin_desc">Margin ↓</option>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {sorted.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Requirement</TableHead>
                  <TableHead>Developer</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Profit</TableHead>
                  <TableHead>Margin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((item) => {
                  const revenue = Number(item.client_billing_amount || 0);
                  const cost = Number(item.developer_cost || 0);
                  const profit = Number(item.profit || 0);
                  const margin = revenue ? Math.round((profit / revenue) * 100) : 0;
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <p className="font-medium text-slate-200">{item.requirement?.client?.name ?? "N/A"}</p>
                        <p className="text-xs text-slate-600">{item.requirement?.client?.client_type ?? "Direct Client"}</p>
                      </TableCell>
                      <TableCell className="text-slate-400">{item.requirement?.role ?? "N/A"}</TableCell>
                      <TableCell className="text-slate-400">{item.developer?.name ?? "N/A"}</TableCell>
                      <TableCell className="mono text-slate-300">{formatCurrency(revenue, item.currency_code)}</TableCell>
                      <TableCell className="mono text-slate-400">{formatCurrency(cost, item.currency_code)}</TableCell>
                      <TableCell>
                        <Badge variant={profit >= 0 ? "success" : "danger"}>{formatCurrency(profit, item.currency_code)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 rounded-full bg-white/5">
                            <div className={`h-1.5 rounded-full transition-all ${margin >= 20 ? "bg-green-500" : margin >= 0 ? "bg-amber-500" : "bg-red-500"}`}
                              style={{ width: `${Math.min(Math.abs(margin), 100)}%` }} />
                          </div>
                          <span className={`text-sm font-bold mono ${margin >= 20 ? "text-green-400" : margin >= 0 ? "text-amber-400" : "text-red-400"}`}>{margin}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <EmptyState title="No finance data yet" description="Once you create assignments, revenue, cost, and profit will show up here automatically." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
