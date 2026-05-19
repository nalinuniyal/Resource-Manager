import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CURRENCY_OPTIONS, REQUIREMENT_STATUSES } from "@/lib/constants";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormField } from "@/components/forms/form-field";

const schema = z.object({
  client_id: z.string().min(1, "Choose a client."),
  role: z.string().min(2, "Role is required."),
  cloud: z.string().min(1, "Technology is required."),
  experience_required: z.coerce.number().min(0),
  budget: z.coerce.number().min(0),
  currency_code: z.string().min(1),
  status: z.string().min(1),
  notes: z.string().optional(),
});

export function RequirementFormDialog({ open, onOpenChange, onSubmit, currentItem, saving, clients }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { client_id: "", role: "", cloud: "", experience_required: 0, budget: 0, currency_code: "INR", status: "Open", notes: "" }
  });

  useEffect(() => {
    reset({
      client_id: currentItem?.client_id ?? "",
      role: currentItem?.role ?? "",
      cloud: currentItem?.cloud ?? "",
      experience_required: currentItem?.experience_required ?? 0,
      budget: currentItem?.budget ?? 0,
      currency_code: currentItem?.currency_code ?? "INR",
      status: currentItem?.status ?? "Open",
      notes: currentItem?.notes ?? "",
    });
  }, [currentItem, reset, open]);

  const inputClass = "glass-input w-full px-3 py-2.5 text-sm";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{currentItem?.id ? "Edit Requirement" : "Add Requirement"}</DialogTitle>
          <DialogDescription>Define a role requirement tied to a client account.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(async (values) => {
          const success = await onSubmit(values, currentItem);
          if (success) onOpenChange(false);
        })}>
          <FormField id="req-client" label="Client *" error={errors.client_id?.message} className="md:col-span-2">
            <select id="req-client" className={`${inputClass} appearance-none`} {...register("client_id")}>
              <option value="">Select client</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormField>

          <FormField id="req-role" label="Role / Position *" error={errors.role?.message}>
            <input id="req-role" className={inputClass} placeholder="Salesforce Developer" {...register("role")} />
          </FormField>

          <FormField id="req-cloud" label="Technology *" error={errors.cloud?.message}>
            <input id="req-cloud" className={inputClass} placeholder="SFMC, React, Java..." {...register("cloud")} />
          </FormField>

          <FormField id="req-exp" label="Experience Required (yrs)" error={errors.experience_required?.message}>
            <input id="req-exp" type="number" min="0" step="0.5" className={inputClass} {...register("experience_required")} />
          </FormField>

          <FormField id="req-budget" label="Budget" error={errors.budget?.message}>
            <input id="req-budget" type="number" min="0" className={inputClass} placeholder="0" {...register("budget")} />
          </FormField>

          <FormField id="req-currency" label="Currency">
            <select id="req-currency" className={`${inputClass} appearance-none`} {...register("currency_code")}>
              {CURRENCY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </FormField>

          <FormField id="req-status" label="Status">
            <select id="req-status" className={`${inputClass} appearance-none`} {...register("status")}>
              {REQUIREMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </FormField>

          <FormField id="req-notes" label="Notes (optional)" className="md:col-span-2">
            <textarea id="req-notes" rows={2} className={`${inputClass} resize-none`}
              placeholder="Additional details..." {...register("notes")} />
          </FormField>

          <div className="md:col-span-2 flex justify-end gap-3 pt-1">
            <button type="button" className="px-4 py-2 rounded-xl text-sm font-medium glass border-glass text-slate-300 hover:text-white transition-all"
              onClick={() => onOpenChange(false)}>Cancel</button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-50 glow-blue">
              {saving ? "Saving..." : currentItem?.id ? "Update" : "Add Requirement"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
