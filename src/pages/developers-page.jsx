import { useMemo, useState } from "react";
import { Pencil, Trash2, FileText, Copy, CheckCircle } from "lucide-react";
import { DeveloperFormDialog } from "@/components/forms/developer-form-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TECHNOLOGY_SUGGESTIONS } from "@/lib/constants";
import { formatMoneyPair, formatCurrency } from "@/lib/utils";
import { useState as useLocalState } from "react";

export function DevelopersPage({ developersManager }) {
  const [query, setQuery] = useState("");
  const [skill, setSkill] = useState("All");
  const [availability, setAvailability] = useState("All");
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const filteredDevelopers = useMemo(() => {
    return developersManager.items.filter((item) => {
      const matchesQuery = [item.name, item.email ?? "", ...(item.skills ?? [])].some((v) => v.toLowerCase().includes(query.toLowerCase()));
      const matchesSkill = skill === "All" || item.skills?.includes(skill);
      const matchesAvailability = availability === "All" || item.availability === availability;
      return matchesQuery && matchesSkill && matchesAvailability;
    });
  }, [availability, developersManager.items, query, skill]);

  const skillOptions = useMemo(() => {
    return ["All", ...new Set([...TECHNOLOGY_SUGGESTIONS, ...developersManager.items.flatMap((item) => item.skills ?? [])])];
  }, [developersManager.items]);

  const available = developersManager.items.filter((d) => d.availability === "Available").length;
  const busy = developersManager.items.filter((d) => d.availability === "Busy").length;

  const copyEmail = (email, id) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Developers"
        title="Developer Pool"
        description="Manage your bench — skills, rates, availability, and resumes in one view."
        actionLabel="Add Developer"
        onAction={() => { setEditingItem(null); setOpen(true); }}
      />

      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold mono text-slate-100">{developersManager.items.length}</p>
          <p className="text-xs text-slate-500 mt-1">Total</p>
        </div>
        <div className="glass-card p-4 text-center" style={{ borderColor: "rgba(52,211,153,0.2)", background: "rgba(52,211,153,0.05)" }}>
          <p className="text-2xl font-bold mono text-green-400">{available}</p>
          <p className="text-xs text-green-600 mt-1">Available</p>
        </div>
        <div className="glass-card p-4 text-center" style={{ borderColor: "rgba(251,191,36,0.2)", background: "rgba(251,191,36,0.05)" }}>
          <p className="text-2xl font-bold mono text-amber-400">{busy}</p>
          <p className="text-xs text-amber-600 mt-1">On Assignment</p>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="grid gap-3 lg:grid-cols-[1fr,180px,180px]">
            <SearchInput value={query} onChange={setQuery} placeholder="Search by name, email or skill" />
            <Select value={skill} onChange={(e) => setSkill(e.target.value)}>
              {skillOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </Select>
            <Select value={availability} onChange={(e) => setAvailability(e.target.value)}>
              {["All", "Available", "Busy"].map((option) => <option key={option} value={option}>{option}</option>)}
            </Select>
          </div>

          {filteredDevelopers.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Developer</TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead>Exp.</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Resume</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDevelopers.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-slate-200">{item.name}</p>
                        {item.email && (
                          <button onClick={() => copyEmail(item.email, item.id)}
                            className="flex items-center gap-1 text-xs text-slate-600 hover:text-blue-400 transition-colors mt-0.5">
                            {copiedId === item.id ? <CheckCircle className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                            {item.email}
                          </button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {item.skills?.slice(0, 3).map((s) => <Badge key={s} variant="accent">{s}</Badge>)}
                        {item.skills?.length > 3 && <Badge variant="secondary">+{item.skills.length - 3}</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="mono text-slate-400">{item.experience} yrs</TableCell>
                    <TableCell className="mono text-sm text-slate-300">{formatCurrency(item.rate, item.currency_code)} / {item.rate_type?.toLowerCase()}</TableCell>
                    <TableCell>
                      <Badge variant={item.availability === "Available" ? "success" : "warning"}>{item.availability}</Badge>
                    </TableCell>
                    <TableCell>
                      {item.resume_url ? (
                        <a href={item.resume_url} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                          <FileText className="h-3.5 w-3.5" />View
                        </a>
                      ) : <span className="text-xs text-slate-700">—</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setEditingItem(item); setOpen(true); }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => developersManager.removeItem(item.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-red-400" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState title="No developers found" description="Add developers or adjust the search and filter values." />
          )}
        </CardContent>
      </Card>

      <DeveloperFormDialog
        open={open}
        onOpenChange={setOpen}
        currentItem={editingItem}
        saving={developersManager.saving}
        onSubmit={developersManager.saveItem}
      />
    </div>
  );
}
