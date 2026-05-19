import { useMemo, useState } from "react";
import { TrendingUp, Users, ClipboardList, Code2, DollarSign, IndianRupee, Activity, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { formatCurrency, formatMoneyPair, sumByCurrency, formatDate } from "@/lib/utils";

function GlassStatCard({ label, value, hint, icon: Icon, accentClass, glowClass }) {
  return (
    <div className={`glass-card p-5 stat-card-glow relative overflow-hidden ${glowClass ?? ""}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-100 mono">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-600">{hint}</p>}
        </div>
        {Icon && (
          <div className={`rounded-xl p-2.5 ${accentClass}`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  );
}

export function DashboardPage({ clients, requirements, developers, assignments, profile }) {
  const [currency, setCurrency] = useState("INR");

  const totalRevenue = sumByCurrency(assignments, (i) => i.client_billing_amount, (i) => i.currency_code);
  const totalCost = sumByCurrency(assignments, (i) => i.developer_cost, (i) => i.currency_code);
  const totalProfit = sumByCurrency(assignments, (i) => i.profit, (i) => i.currency_code);
  const activeRequirements = requirements.filter((i) => i.status !== "Closed").length;
  const availableDevelopers = developers.filter((i) => i.availability === "Available").length;
  const activeAssignments = assignments.filter((i) => !i.end_date || new Date(i.end_date) >= new Date()).length;
  const recentAssignments = assignments.slice(0, 6);

  const reqByStatus = useMemo(() => ({
    Open: requirements.filter((i) => i.status === "Open").length,
    "In Progress": requirements.filter((i) => i.status === "In Progress").length,
    Closed: requirements.filter((i) => i.status === "Closed").length,
  }), [requirements]);

  const revenueDisplay = currency === "INR" ? formatCurrency(totalRevenue.INR, "INR") : formatCurrency(totalRevenue.USD, "USD");
  const revenueHint = currency === "INR" ? `≈ ${formatCurrency(totalRevenue.USD, "USD")}` : `≈ ${formatCurrency(totalRevenue.INR, "INR")}`;
  const overallMargin = totalRevenue.INR > 0 ? Math.round((totalProfit.INR / totalRevenue.INR) * 100) : 0;

  // Low margin warning (< 10%)
  const lowMarginAssignments = assignments.filter(a => {
    const rev = Number(a.client_billing_amount || 0);
    const profit = Number(a.profit || 0);
    return rev > 0 && (profit / rev) < 0.1;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <PageHeader
          eyebrow="Overview"
          title={`Welcome back${profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}!`}
          description={`Resource snapshot for ${profile?.company_name ?? "your workspace"} — clients, demand, bench, and revenue at a glance.`}
        />
        <div className="flex items-center gap-1 rounded-xl p-1 self-start md:self-auto shrink-0"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {["INR", "USD"].map((c) => (
            <button key={c} onClick={() => setCurrency(c)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currency === c ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"}`}>
              {c === "INR" ? <IndianRupee className="h-3.5 w-3.5" /> : <DollarSign className="h-3.5 w-3.5" />}
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Low margin alert */}
      {lowMarginAssignments.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-500/25 bg-amber-500/8">
          <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-300">
            <span className="font-semibold">{lowMarginAssignments.length} assignment{lowMarginAssignments.length > 1 ? "s" : ""}</span>
            {" "}below 10% margin — review pricing in Finance.
          </p>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <GlassStatCard label="Total Clients" value={clients.length} icon={Users} accentClass="bg-blue-500/15 text-blue-400" />
        <GlassStatCard label="Active Requirements" value={activeRequirements} icon={ClipboardList} accentClass="bg-amber-500/15 text-amber-400" />
        <GlassStatCard label="Available Developers" value={availableDevelopers} icon={Code2} accentClass="bg-green-500/15 text-green-400" />
        <GlassStatCard label="Total Revenue" value={revenueDisplay} hint={revenueHint} icon={TrendingUp} accentClass="bg-purple-500/15 text-purple-400" />
      </div>

      {/* Profit / Active banner row */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl p-5 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, rgba(91,141,246,0.15), rgba(139,92,246,0.1))", border: "1px solid rgba(91,141,246,0.2)" }}>
          <div>
            <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest">Total Profit</p>
            <p className="text-white text-2xl font-bold mono mt-1">
              {currency === "INR" ? formatCurrency(totalProfit.INR, "INR") : formatCurrency(totalProfit.USD, "USD")}
            </p>
            <p className="text-blue-400 text-xs mt-0.5">
              {currency === "INR" ? `≈ ${formatCurrency(totalProfit.USD, "USD")}` : `≈ ${formatCurrency(totalProfit.INR, "INR")}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-blue-400 text-xs">Overall Margin</p>
            <p className={`text-3xl font-bold mono ${overallMargin >= 20 ? "text-green-400" : overallMargin >= 0 ? "text-amber-400" : "text-red-400"}`}>
              {totalRevenue.INR > 0 ? `${overallMargin}%` : "—"}
            </p>
          </div>
        </div>
        <div className="rounded-xl p-5 flex items-center justify-between"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="space-y-3 w-full">
            <div className="flex justify-between items-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Active Assignments</p>
              <Activity className="h-4 w-4 text-green-400" />
            </div>
            <p className="text-3xl font-bold mono text-slate-100">{activeAssignments}</p>
            <p className="text-xs text-slate-600">{assignments.length} total | {assignments.length - activeAssignments} concluded</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr,1fr]">
        {/* Recent Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Assignments</CardTitle>
            <CardDescription>Latest billing activity across staffing work.</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {recentAssignments.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Developer</TableHead>
                    <TableHead>Client / Role</TableHead>
                    <TableHead>Billing</TableHead>
                    <TableHead>Profit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentAssignments.map((a) => {
                    const rev = Number(a.client_billing_amount || 0);
                    const prof = Number(a.profit || 0);
                    const margin = rev > 0 ? Math.round((prof / rev) * 100) : 0;
                    return (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium text-slate-200">{a.developer?.name ?? "N/A"}</TableCell>
                        <TableCell>
                          <p className="text-slate-400 text-xs">{a.requirement?.client?.name ?? "N/A"}</p>
                          <p className="text-slate-500 text-xs">{a.requirement?.role ?? "N/A"}</p>
                        </TableCell>
                        <TableCell className="mono text-sm text-slate-300">{formatCurrency(rev, a.currency_code)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant={prof >= 0 ? "success" : "danger"}>{formatCurrency(prof, a.currency_code)}</Badge>
                            <span className={`text-xs mono ${margin >= 20 ? "text-green-400" : margin >= 0 ? "text-amber-400" : "text-red-400"}`}>{margin}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <EmptyState title="No assignments yet" description="Create your first assignment to start tracking revenue and margin." />
            )}
          </CardContent>
        </Card>

        {/* Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Requirement Pipeline</CardTitle>
            <CardDescription>Status breakdown of current job demand.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { status: "Open", color: "border-blue-500/20 bg-blue-500/8", textColor: "text-blue-400", variant: "accent" },
              { status: "In Progress", color: "border-amber-500/20 bg-amber-500/8", textColor: "text-amber-400", variant: "warning" },
              { status: "Closed", color: "border-green-500/20 bg-green-500/8", textColor: "text-green-400", variant: "success" },
            ].map(({ status, color, textColor, variant }) => {
              const count = reqByStatus[status];
              const pct = requirements.length ? Math.round((count / requirements.length) * 100) : 0;
              return (
                <div key={status} className={`flex items-center justify-between rounded-xl border p-4 ${color}`}>
                  <div className="flex-1">
                    <p className={`font-semibold text-sm ${textColor}`}>{status}</p>
                    <div className="mt-2 h-1.5 rounded-full bg-black/30 w-full max-w-[120px]">
                      <div className="h-1.5 rounded-full bg-current opacity-50 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className={`text-2xl font-bold mono ${textColor}`}>{count}</p>
                    <p className="text-xs text-slate-600">{pct}%</p>
                  </div>
                </div>
              );
            })}
            {requirements.length === 0 && (
              <EmptyState title="No requirements" description="Add requirements to see pipeline stats." />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
