import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, FileText, X } from "lucide-react";
import { CURRENCY_OPTIONS, DEVELOPER_AVAILABILITY, RATE_TYPES, TECHNOLOGY_SUGGESTIONS } from "@/lib/constants";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormField } from "@/components/forms/form-field";
import { TagInput } from "@/components/forms/tag-input";
import { uploadResume } from "@/lib/api";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(2, "Developer name is required."),
  skills: z.array(z.string()).min(1, "Choose at least one skill."),
  experience: z.coerce.number().min(0),
  rate: z.coerce.number().min(0),
  currency_code: z.string().min(1),
  rate_type: z.string().min(1),
  availability: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  linkedin: z.string().optional(),
  notes: z.string().optional(),
});

export function DeveloperFormDialog({ open, onOpenChange, onSubmit, currentItem, saving }) {
  const [uploading, setUploading] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const fileRef = useRef(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "", skills: [], experience: 0, rate: 0, currency_code: "INR",
      rate_type: "Monthly", availability: "Available", email: "", phone: "", linkedin: "", notes: ""
    }
  });

  const skills = watch("skills");

  useEffect(() => {
    reset({
      name: currentItem?.name ?? "",
      skills: currentItem?.skills ?? [],
      experience: currentItem?.experience ?? 0,
      rate: currentItem?.rate ?? 0,
      currency_code: currentItem?.currency_code ?? "INR",
      rate_type: currentItem?.rate_type ?? "Monthly",
      availability: currentItem?.availability ?? "Available",
      email: currentItem?.email ?? "",
      phone: currentItem?.phone ?? "",
      linkedin: currentItem?.linkedin ?? "",
      notes: currentItem?.notes ?? "",
    });
    setResumeFile(null);
  }, [currentItem, reset, open]);

  const handleFormSubmit = async (values) => {
    let resumePayload = {};
    if (resumeFile && currentItem?.id) {
      setUploading(true);
      const { data, error } = await uploadResume(currentItem.id, resumeFile);
      setUploading(false);
      if (error) { toast.error("Resume upload failed: " + error.message); return; }
      resumePayload = { resume_url: data.url };
    }
    const success = await onSubmit({ ...values, ...resumePayload }, currentItem);
    if (success) onOpenChange(false);
  };

  const inputClass = "glass-input w-full px-3 py-2.5 text-sm";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{currentItem?.id ? "Edit Developer" : "Add Developer"}</DialogTitle>
          <DialogDescription>Add a developer to your talent pool.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(handleFormSubmit)}>
          <FormField id="dev-name" label="Full Name *" error={errors.name?.message} className="md:col-span-2">
            <input id="dev-name" className={inputClass} placeholder="Jane Doe" {...register("name")} />
          </FormField>

          <FormField id="dev-skills" label="Skills *" error={errors.skills?.message} className="md:col-span-2">
            <TagInput value={skills} onChange={(v) => setValue("skills", v)} suggestions={TECHNOLOGY_SUGGESTIONS} placeholder="Type skill and press Enter" />
          </FormField>

          <FormField id="dev-exp" label="Experience (years)" error={errors.experience?.message}>
            <input id="dev-exp" type="number" min="0" step="0.5" className={inputClass} {...register("experience")} />
          </FormField>

          <FormField id="dev-avail" label="Availability">
            <select id="dev-avail" className={`${inputClass} appearance-none`} {...register("availability")}>
              {DEVELOPER_AVAILABILITY.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </FormField>

          <FormField id="dev-rate" label="Rate" error={errors.rate?.message}>
            <input id="dev-rate" type="number" min="0" className={inputClass} {...register("rate")} />
          </FormField>

          <FormField id="dev-rate-type" label="Rate Type">
            <select id="dev-rate-type" className={`${inputClass} appearance-none`} {...register("rate_type")}>
              {RATE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </FormField>

          <FormField id="dev-currency" label="Currency">
            <select id="dev-currency" className={`${inputClass} appearance-none`} {...register("currency_code")}>
              {CURRENCY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </FormField>

          <FormField id="dev-email" label="Email (optional)" error={errors.email?.message}>
            <input id="dev-email" type="email" className={inputClass} placeholder="dev@example.com" {...register("email")} />
          </FormField>

          <FormField id="dev-phone" label="Phone (optional)">
            <input id="dev-phone" className={inputClass} placeholder="+91 ..." {...register("phone")} />
          </FormField>

          <FormField id="dev-linkedin" label="LinkedIn (optional)" className="md:col-span-2">
            <input id="dev-linkedin" className={inputClass} placeholder="linkedin.com/in/..." {...register("linkedin")} />
          </FormField>

          <FormField id="dev-notes" label="Notes (optional)" className="md:col-span-2">
            <textarea id="dev-notes" rows={2} className={`${inputClass} resize-none`}
              placeholder="Background, preferences, availability details..." {...register("notes")} />
          </FormField>

          {currentItem?.id && (
            <FormField id="dev-resume" label="Resume (PDF/DOC)" className="md:col-span-2">
              <div className="flex items-center gap-3">
                <input ref={fileRef} type="file" className="hidden" accept=".pdf,.doc,.docx"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)} />
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm glass border-glass text-slate-400 hover:text-slate-200 transition-all">
                  <Upload className="h-4 w-4" />Upload Resume
                </button>
                {resumeFile && (
                  <div className="flex items-center gap-1.5 text-xs text-blue-400">
                    <FileText className="h-3.5 w-3.5" />{resumeFile.name}
                    <button type="button" onClick={() => setResumeFile(null)}><X className="h-3 w-3" /></button>
                  </div>
                )}
                {currentItem?.resume_url && !resumeFile && (
                  <a href={currentItem.resume_url} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
                    <FileText className="h-3.5 w-3.5" />View current
                  </a>
                )}
              </div>
            </FormField>
          )}

          <div className="md:col-span-2 flex justify-end gap-3 pt-1">
            <button type="button" className="px-4 py-2 rounded-xl text-sm font-medium glass border-glass text-slate-300 hover:text-white transition-all"
              onClick={() => onOpenChange(false)}>Cancel</button>
            <button type="submit" disabled={saving || uploading}
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-50 glow-blue">
              {saving || uploading ? "Saving..." : currentItem?.id ? "Update" : "Add Developer"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
