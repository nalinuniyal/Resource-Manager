import { useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { RequirementFormDialog } from "@/components/forms/requirement-form-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

export function RequirementsPage({ requirementsManager, clients }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const filteredRequirements = useMemo(() => {
    return requirementsManager.items.filter((item) => {
      const matchesQuery = [item.role, item.cloud, item.client?.name ?? ""].some((v) =>
        v.toLowerCase().includes(query.toLowerCase())
      );
      const matchesStatus = status === "All" || item.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [query, requirementsManager.items, status]);

  const open_ = requirementsManager.items.filter((i) => i.status === "Open").length;
  const inProgress = requirementsManager.items.filter((i) => i.status === "In Progress").length;
  const closed = requirementsManager.items.filter((i) => i.status === "Closed").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Requirements"
        title="Job Requirements"
        description="Track demand across clients, technologies, experience bands, and budgets."
        actionLabel="Add Requirement"
        onAction={() => { setEditingItem(null); setOpen(true); }}
      />

      <div className="flex gap-3 flex-wrap">
        {[
          { label: "Open", count: open_, color: "accent" },
          { label: "In Progress", count: inProgress, color: "warning" },
          { label: "Closed", count: closed, color: "success" },
          { label: "Total", count: requirementsManager.items.length, color: "secondary" },
        ].map(({ label, count, color }) => (
          <Badge key={label} variant={color} className="px-3 py-1 text-xs">
            {count} {label}
          </Badge>
        ))}
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="grid gap-3 md:grid-cols-[1fr,200px]">
            <SearchInput value={query} onChange={setQuery} placeholder="Search by role, technology, or client" />
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              {["All", "Open", "In Progress", "Closed"].map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </Select>
          </div>

          {filteredRequirements.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Technology</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequirements.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-semibold text-slate-200">{item.role}</TableCell>
                    <TableCell>
                      <p className="text-slate-300">{item.client?.name ?? "N/A"}</p>
                      <p className="text-xs text-slate-600">{item.client?.client_type ?? ""}</p>
                    </TableCell>
                    <TableCell className="text-slate-400">{item.cloud}</TableCell>
                    <TableCell className="mono text-slate-400">{item.experience_required} yrs</TableCell>
                    <TableCell className="mono text-sm text-slate-300">{formatCurrency(item.budget, item.currency_code)}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === "Closed" ? "success" : item.status === "In Progress" ? "warning" : "accent"}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setEditingItem(item); setOpen(true); }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => requirementsManager.removeItem(item.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-red-400" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState title="No requirements found" description="Add a role or change the filters to see matching requirements." />
          )}
        </CardContent>
      </Card>

      <RequirementFormDialog
        open={open}
        onOpenChange={setOpen}
        currentItem={editingItem}
        saving={requirementsManager.saving}
        onSubmit={requirementsManager.saveItem}
        clients={clients}
      />
    </div>
  );
}
