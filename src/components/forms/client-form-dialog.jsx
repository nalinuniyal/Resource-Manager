import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CLIENT_TYPE_SUGGESTIONS } from "@/lib/constants";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormField } from "@/components/forms/form-field";

const schema = z.object({
  name: z.string().min(2, "Client name is required."),
  client_type: z.string().min(1, "Client type is required."),
  contact_person: z.string().min(1, "Contact person is required."),
  contact_name: z.string().optional(),
  email: z.string().email("Enter a valid email.").or(z.literal("")),
  contact_email: z.string().email("Enter a valid email.").optional().or(z.literal("")),
  notes: z.string().optional(),
});

export function ClientFormDialog({ open, onOpenChange, onSubmit, currentItem, saving }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", client_type: "Direct Client", contact_person: "", contact_name: "", email: "", contact_email: "", notes: "" }
  });

  useEffect(() => {
    reset({
      name: currentItem?.name ?? "",
      client_type: currentItem?.client_type ?? "Direct Client",
      contact_person: currentItem?.contact_person ?? "",
      contact_name: currentItem?.contact_name ?? "",
      email: currentItem?.email ?? "",
      contact_email: currentItem?.contact_email ?? "",
      notes: currentItem?.notes ?? "",
    });
  }, [currentItem, reset, open]);

  const inputClass = "glass-input w-full px-3 py-2.5 text-sm";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{currentItem?.id ? "Edit Client" : "Add Client"}</DialogTitle>
          <DialogDescription>Add an account to track requirements and assignments against.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(async (values) => {
          const success = await onSubmit(values, currentItem);
          if (success) onOpenChange(false);
        })}>
          <FormField id="client-name" label="Client Name *" error={errors.name?.message} className="md:col-span-2">
            <input id="client-name" className={inputClass} placeholder="Acme Corp" {...register("name")} />
          </FormField>

          <FormField id="client-type" label="Client Type" error={errors.client_type?.message}>
            <select id="client-type" className={`${inputClass} appearance-none`} {...register("client_type")}>
              {CLIENT_TYPE_SUGGESTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </FormField>

          <FormField id="client-contact" label="Primary Contact" error={errors.contact_person?.message}>
            <input id="client-contact" className={inputClass} placeholder="John Smith" {...register("contact_person")} />
          </FormField>

          <FormField id="client-email" label="Contact Email" error={errors.email?.message}>
            <input id="client-email" type="email" className={inputClass} placeholder="john@acme.com" {...register("email")} />
          </FormField>

          <FormField id="client-contact-email" label="Billing Email (optional)" error={errors.contact_email?.message}>
            <input id="client-contact-email" type="email" className={inputClass} placeholder="billing@acme.com" {...register("contact_email")} />
          </FormField>

          <FormField id="client-notes" label="Notes (optional)" className="md:col-span-2">
            <textarea id="client-notes" rows={2} className={`${inputClass} resize-none`}
              placeholder="Contract details, terms, etc." {...register("notes")} />
          </FormField>

          <div className="md:col-span-2 flex justify-end gap-3 pt-1">
            <button type="button" className="px-4 py-2 rounded-xl text-sm font-medium glass border-glass text-slate-300 hover:text-white transition-all"
              onClick={() => onOpenChange(false)}>Cancel</button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-50 glow-blue">
              {saving ? "Saving..." : currentItem?.id ? "Update" : "Add Client"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
