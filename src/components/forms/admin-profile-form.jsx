import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FormField } from "@/components/forms/form-field";

export function AdminProfileForm({ profile, onSave, saving }) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { full_name: "", title: "", company_name: "", phone: "" }
  });

  useEffect(() => {
    if (profile) reset({
      full_name: profile.full_name ?? "",
      title: profile.title ?? "",
      company_name: profile.company_name ?? "",
      phone: profile.phone ?? "",
    });
  }, [profile, reset]);

  const inputClass = "glass-input w-full px-3 py-2.5 text-sm";

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSave)}>
      <FormField id="profile-name" label="Full Name">
        <input id="profile-name" className={inputClass} placeholder="Nalin Sharma" {...register("full_name")} />
      </FormField>
      <FormField id="profile-title" label="Job Title">
        <input id="profile-title" className={inputClass} placeholder="Senior System Engineer" {...register("title")} />
      </FormField>
      <FormField id="profile-company" label="Company / Workspace Name">
        <input id="profile-company" className={inputClass} placeholder="Acme Staffing" {...register("company_name")} />
      </FormField>
      <FormField id="profile-phone" label="Phone (optional)">
        <input id="profile-phone" className={inputClass} placeholder="+91 ..." {...register("phone")} />
      </FormField>
      <button type="submit" disabled={saving}
        className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-50 glow-blue">
        {saving ? "Saving..." : "Save Profile"}
      </button>
    </form>
  );
}
