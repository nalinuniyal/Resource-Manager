import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormField } from "@/components/forms/form-field";
import { formatMoneyPair } from "@/lib/utils";

// Utility: sanitize date string — converts "" to undefined/null so Supabase doesn't choke
function sanitizeDate(val) {
  if (!val || val.trim() === "") return null;
  return val;
}

const schema = z.object({
  developer_id: z.string().min(1, "Choose a developer."),
  requirement_id: z.string().min(1, "Choose a requirement."),
  start_date: z.string().min(1, "Start date is required."),
  end_date: z.string().optional(),
  client_billing_amount: z.coerce.number().min(0),
  developer_cost: z.coerce.number().min(0),
  currency_code: z.string().min(1),
  notes: z.string().optional(),
  status: z.string().min(1),
});

export function AssignmentFormDialog({ open, onOpenChange, onSubmit, currentItem, saving, developers, requirements }) {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      developer_id: "", requirement_id: "", start_date: "", end_date: "",
      client_billing_amount: 0, developer_cost: 0, currency_code: "INR", notes: "", status: "Active"
    }
  });

  useEffect(() => {
    reset({
      developer_id: currentItem?.developer_id ?? "",
      requirement_id: currentItem?.requirement_id ?? "",
      start_date: currentItem?.start_date ?? "",
      end_date: currentItem?.end_date ?? "",
      client_billing_amount: currentItem?.client_billing_amount ?? 0,
      developer_cost: currentItem?.developer_cost ?? 0,
      currency_code: currentItem?.currency_code ?? "INR",
      notes: currentItem?.notes ?? "",
      status: currentItem?.status ?? "Active",
    });
  }, [currentItem, reset, open]);

  const billing = watch("client_billing_amount");
  const cost = watch("developer_cost");
  const currencyCode = watch("currency_code");
  const profit = useMemo(() => Number(billing || 0) - Number(cost || 0), [billing, cost]);
  const margin = billing && Number(billing) > 0 ? Math.round((profit / Number(billing)) * 100) : 0;

  const handleFormSubmit = async (values) => {
    // Fix: sanitize empty date strings before sending to Supabase
    const payload = {
      ...values,
      start_date: sanitizeDate(values.start_date),
      end_date: sanitizeDate(values.end_date),
    };
    const success = await onSubmit(payload, currentItem);
    if (success) onOpenChange(false);
  };

  const inputClass = "glass-input w-full px-3 py-2.5 text-sm";
  const selectClass = "glass-input w-full px-3 py-2.5 text-sm appearance-none cursor-pointer";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-glass max-w-2xl bg-[#0d1117] text-slate-200">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold gradient-text">
            {currentItem?.id ? "Edit Assignment" : "New Assignment"}
          </DialogTitle>
          <DialogDescription className="text-glass-muted text-sm">
            Link a developer to a requirement and track billing, cost, and margin.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(handleFormSubmit)}>
          {/* Developer */}
          <FormField id="assign-developer" label="Developer" error={errors.developer_id?.message}>
            <select id="assign-developer" className={selectClass} {...register("developer_id")}>
              <option value="">Select developer</option>
              {developers.map((d) => (
                <option key={d.id} value={d.id}>{d.name} ({d.availability})</option>
              ))}
            </select>
          </FormField>

          {/* Requirement */}
          <FormField id="assign-req" label="Requirement" error={errors.requirement_id?.message}>
            <select id="assign-req" className={selectClass} {...register("requirement_id")}>
              <option value="">Select requirement</option>
              {requirements.map((r) => (
                <option key={r.id} value={r.id}>{r.role} — {r.client?.name ?? "Unknown"}</option>
              ))}
            </select>
          </FormField>

          {/* Start Date — required */}
          <FormField id="assign-start" label="Start Date *" error={errors.start_date?.message}>
            <input id="assign-start" type="date" className={inputClass}
              {...register("start_date")}
              style={{ colorScheme: "dark" }} />
          </FormField>

          {/* End Date — optional, sanitized */}
          <FormField id="assign-end" label="End Date (optional)" error={errors.end_date?.message}>
            <input id="assign-end" type="date" className={inputClass}
              {...register("end_date")}
              style={{ colorScheme: "dark" }} />
          </FormField>

          {/* Client Billing */}
          <FormField id="assign-billing" label="Client Billing Amount" error={errors.client_billing_amount?.message}>
            <input id="assign-billing" type="number" min="0" placeholder="0" className={inputClass}
              {...register("client_billing_amount")} />
          </FormField>

          {/* Developer Cost */}
          <FormField id="assign-cost" label="Developer Cost" error={errors.developer_cost?.message}>
            <input id="assign-cost" type="number" min="0" placeholder="0" className={inputClass}
              {...register("developer_cost")} />
          </FormField>

          {/* Currency */}
          <FormField id="assign-currency" label="Currency" error={errors.currency_code?.message}>
            <select id="assign-currency" className={selectClass} {...register("currency_code")}>
              <option value="INR">₹ INR — Indian Rupee</option>
              <option value="USD">$ USD — US Dollar</option>
            </select>
          </FormField>

          {/* Status */}
          <FormField id="assign-status" label="Status" error={errors.status?.message}>
            <select id="assign-status" className={selectClass} {...register("status")}>
              <option value="Active">Active</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </FormField>

          {/* Notes */}
          <FormField id="assign-notes" label="Notes (optional)" className="md:col-span-2">
            <textarea id="assign-notes" rows={2} placeholder="Any notes about this assignment..."
              className={`${inputClass} resize-none`} {...register("notes")} />
          </FormField>

          {/* Profit Preview */}
          <div className={`md:col-span-2 rounded-xl p-4 border ${profit >= 0 ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Calculated Profit</p>
                <p className={`mt-1 text-xl font-bold mono ${profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {formatMoneyPair(profit, currencyCode)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Margin</p>
                <p className={`text-2xl font-bold mono ${margin >= 20 ? "text-green-400" : margin >= 0 ? "text-amber-400" : "text-red-400"}`}>
                  {margin}%
                </p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 pt-1">
            <button type="button"
              className="px-4 py-2 rounded-xl text-sm font-medium glass border-glass text-slate-300 hover:text-white transition-all"
              onClick={() => onOpenChange(false)}>Cancel</button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-50 glow-blue">
              {saving ? "Saving..." : currentItem?.id ? "Update" : "Create Assignment"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
