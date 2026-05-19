import { useMemo, useState } from "react";
import { Pencil, Trash2, Building2 } from "lucide-react";
import { ClientFormDialog } from "@/components/forms/client-form-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function ClientsPage({ clientsManager }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const filtered = useMemo(() => {
    return clientsManager.items.filter((item) =>
      [item.name, item.client_type ?? "", item.contact_email ?? ""].some((v) =>
        v.toLowerCase().includes(query.toLowerCase())
      )
    );
  }, [clientsManager.items, query]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Clients"
        title="Client Accounts"
        description="Manage your direct clients and agency partners."
        actionLabel="Add Client"
        onAction={() => { setEditingItem(null); setOpen(true); }}
      />

      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-1">
          <p className="text-3xl font-bold mono text-slate-100">{clientsManager.items.length}</p>
          <Building2 className="h-6 w-6 text-blue-400 opacity-50" />
        </div>
        <p className="text-xs text-slate-600">Total Clients</p>
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          <SearchInput value={query} onChange={setQuery} placeholder="Search by name, type, or email..." />
          {filtered.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-semibold text-slate-200">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="accent">{item.client_type ?? "Direct Client"}</Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-slate-400">{item.contact_name ?? "—"}</p>
                      {item.contact_email && <p className="text-xs text-slate-600">{item.contact_email}</p>}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500 max-w-[200px] truncate">{item.notes ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setEditingItem(item); setOpen(true); }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => clientsManager.removeItem(item.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-red-400" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState title="No clients found" description="Add your first client to start managing requirements and assignments." />
          )}
        </CardContent>
      </Card>

      <ClientFormDialog
        open={open}
        onOpenChange={setOpen}
        currentItem={editingItem}
        saving={clientsManager.saving}
        onSubmit={clientsManager.saveItem}
      />
    </div>
  );
}
