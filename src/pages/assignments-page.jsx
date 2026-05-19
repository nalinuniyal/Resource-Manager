import { useState, useMemo } from "react";
import { Pencil, Trash2, Filter, Download } from "lucide-react";
import { AssignmentFormDialog } from "@/components/forms/assignment-form-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatMoneyPair, formatCurrency } from "@/lib/utils";

export function AssignmentsPage({ assignmentsManager, developers, requirements }) {
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = useMemo(() => {
    return assignmentsManager.items.filter((i) => {
      const matchQ = [
        i.developer?.name ?? "", i.requirement?.role ?? "", i.requirement?.client?.name ?? ""
      ].some((v) => v.toLowerCase().includes(query.toLowerCase()));
      const isActive = !i.end_date || new Date(i.end_date) >= new Date();
      const matchS = statusFilter === "All"
        || (statusFilter === "Active" && isActive)
        || (statusFilter === "Concluded" && !isActive)
        || (i.status === statusFilter);
      return matchQ && matchS;
    });
  }, [assignmentsManager.items, query, statusFilter]);

  const active = assignmentsManager.items.filter((i) => !i.end_date || new Date(i.end_date) >= new Date()).length;
  const totalProfit = assignmentsManager.items.reduce((s, i) => s + Number(i.profit || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Assignments"
        title="Developer Assignments"
        description="Match developers to active requirements — track billing, cost, and delivery dates."
        actionLabel="New Assignment"
        onAction={() => { setEditingItem(null); setOpen(true); }}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold mono text-slate-100">{assignmentsManager.items.length}</p>
          <p className="text-xs text-slate-500 mt-1">Total</p>
        </div>
        <div className="glass-card p-4 text-center" style={{ borderColor: "rgba(52,211,153,0.2)", background: "rgba(52,211,153,0.05)" }}>
          <p className="text-2xl font-bold mono text-green-400">{active}</p>
          <p className="text-xs text-green-600 mt-1">Active</p>
        </div>
        <div className="glass-card p-4 text-center" style={{ borderColor: "rgba(139,92,246,0.2)", background: "rgba(139,92,246,0.05)" }}>
          <p className="text-2xl font-bold mono text-purple-400">{formatCurrency(totalProfit, "INR")}</p>
          <p className="text-xs text-purple-500 mt-1">Total Profit (INR)</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          {/* Filters */}
          <div className="grid gap-3 md:grid-cols-[1fr,180px]">
            <SearchInput value={query} onChange={setQuery} placeholder="Search developer, role, client..." />
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Concluded">Concluded</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </Select>
          </div>

          {filtered.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Developer</TableHead>
                  <TableHead>Requirement</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Billing</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Profit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => {
                  const isActive = !item.end_date || new Date(item.end_date) >= new Date();
                  const revenue = Number(item.client_billing_amount || 0);
                  const profit = Number(item.profit || 0);
                  const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? "bg-green-400" : "bg-slate-600"}`} />
                          <span className="font-semibold text-slate-200">{item.developer?.name ?? "N/A"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-slate-300">{item.requirement?.role ?? "N/A"}</p>
                        <p className="text-xs text-slate-600">{item.requirement?.cloud ?? ""}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-slate-300">{item.requirement?.client?.name ?? "N/A"}</p>
                        <p className="text-xs text-slate-600">{item.requirement?.client?.client_type ?? "Direct Client"}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs text-slate-400 mono">{formatDate(item.start_date)}</p>
                        <p className="text-xs text-slate-600 mono">→ {formatDate(item.end_date)}</p>
                      </TableCell>
                      <TableCell className="text-sm mono text-slate-300">{formatCurrency(revenue, item.currency_code)}</TableCell>
                      <TableCell className="text-sm mono text-slate-400">{formatCurrency(Number(item.developer_cost || 0), item.currency_code)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Badge variant={profit >= 0 ? "success" : "danger"}>{formatCurrency(profit, item.currency_code)}</Badge>
                          <span className={`text-xs mono ${margin >= 20 ? "text-green-400" : margin >= 0 ? "text-amber-400" : "text-red-400"}`}>{margin}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.status === "Active" ? "success" : item.status === "On Hold" ? "warning" : item.status === "Cancelled" ? "danger" : "secondary"}>
                          {item.status ?? (isActive ? "Active" : "Concluded")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => { setEditingItem(item); setOpen(true); }}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => assignmentsManager.removeItem(item.id)}>
                            <Trash2 className="h-3.5 w-3.5 text-red-400" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <EmptyState title="No assignments found" description="Create your first assignment or adjust filters." />
          )}
        </CardContent>
      </Card>

      <AssignmentFormDialog
        open={open}
        onOpenChange={setOpen}
        currentItem={editingItem}
        saving={assignmentsManager.saving}
        onSubmit={assignmentsManager.saveItem}
        developers={developers}
        requirements={requirements}
      />
    </div>
  );
}
