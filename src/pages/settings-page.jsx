import { AdminProfileForm } from "@/components/forms/admin-profile-form";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function SettingsPage({ profile, email, onSave, saving }) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Admin Settings"
        description="Update your profile and workspace settings."
      />
      <div className="max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Profile Information</CardTitle>
            <CardDescription>Your name and company details shown across the app.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 px-3 py-2 rounded-lg text-xs text-slate-500 mono" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
              {email}
            </div>
            <AdminProfileForm profile={profile} onSave={onSave} saving={saving} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
