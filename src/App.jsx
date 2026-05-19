import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { AuthForm } from "@/components/forms/auth-form";
import { AppShell } from "@/components/shared/app-shell";
import { LoadingState } from "@/components/shared/loading-state";
import { AssignmentsPage } from "@/pages/assignments-page";
import { ClientsPage } from "@/pages/clients-page";
import { DashboardPage } from "@/pages/dashboard-page";
import { DevelopersPage } from "@/pages/developers-page";
import { FinancePage } from "@/pages/finance-page";
import { RequirementsPage } from "@/pages/requirements-page";
import { SettingsPage } from "@/pages/settings-page";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useEntityManager } from "@/hooks/useEntityManager";
import { fetchAssignments, fetchClients, fetchDevelopers, fetchProfile, fetchRequirements, signOut, updateProfile } from "@/lib/api";
import { Zap } from "lucide-react";

function AuthGate() {
  const { user, loading, isConfigured } = useAuth();

  if (!isConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="glass-card p-8 max-w-lg">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-5">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-2">Configuration Required</p>
          <h1 className="text-2xl font-bold text-slate-200">Add your Supabase keys</h1>
          <p className="mt-3 text-sm text-slate-500">
            Create a <code className="bg-white/8 px-1.5 py-0.5 rounded text-slate-300">.env</code> file from{" "}
            <code className="bg-white/8 px-1.5 py-0.5 rounded text-slate-300">.env.example</code>, add{" "}
            <code className="bg-white/8 px-1.5 py-0.5 rounded text-slate-300">VITE_SUPABASE_URL</code> and{" "}
            <code className="bg-white/8 px-1.5 py-0.5 rounded text-slate-300">VITE_SUPABASE_ANON_KEY</code>, then restart Vite.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <LoadingState label="Checking your session..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <AuthForm />
      </div>
    );
  }

  return <ProtectedApp />;
}

function ProtectedApp() {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [profile, setProfile] = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);

  const clientsManager = useEntityManager({ entityName: "Client", table: "clients", fetcher: fetchClients, enabled: true });
  const requirementsManager = useEntityManager({ entityName: "Requirement", table: "requirements", fetcher: fetchRequirements, enabled: true });
  const developersManager = useEntityManager({ entityName: "Developer", table: "developers", fetcher: fetchDevelopers, enabled: true });
  const assignmentsManager = useEntityManager({ entityName: "Assignment", table: "assignments", fetcher: fetchAssignments, enabled: true });

  const isLoading = clientsManager.loading || requirementsManager.loading || developersManager.loading || assignmentsManager.loading;

  useEffect(() => {
    let mounted = true;
    fetchProfile(user.id).then(({ data, error }) => {
      if (!mounted) return;
      if (error) toast.error(error.message);
      else setProfile(data);
    });
    return () => { mounted = false; };
  }, [user.id]);

  const syncAll = async () => {
    await Promise.all([clientsManager.refresh(), requirementsManager.refresh(), developersManager.refresh(), assignmentsManager.refresh()]);
    setRefreshKey((v) => v + 1);
  };

  const wrapSave = (manager, withUserId = false) => async (payload, currentItem) => {
    const nextPayload = withUserId && !currentItem?.id ? { ...payload, user_id: user.id } : payload;
    const success = await manager.saveItem(nextPayload, currentItem);
    if (success) await syncAll();
    return success;
  };

  const wrapRemove = (manager) => async (id) => {
    const success = await manager.removeItem(id);
    if (success) await syncAll();
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) toast.error(error.message);
  };

  const handleSaveProfile = async (values) => {
    setProfileSaving(true);
    const { data, error } = await updateProfile(user.id, values);
    if (error) toast.error(error.message);
    else { setProfile(data); toast.success("Profile updated."); }
    setProfileSaving(false);
  };

  if (isLoading && refreshKey === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingState label="Loading workspace..." />
      </div>
    );
  }

  return (
    <AppShell onSignOut={handleSignOut} profile={profile}>
      <Routes>
        <Route path="/" element={
          <DashboardPage clients={clientsManager.items} requirements={requirementsManager.items}
            developers={developersManager.items} assignments={assignmentsManager.items} profile={profile} />
        } />
        <Route path="/clients" element={
          <ClientsPage clientsManager={{ ...clientsManager, saveItem: wrapSave(clientsManager, true), removeItem: wrapRemove(clientsManager) }} />
        } />
        <Route path="/requirements" element={
          <RequirementsPage
            requirementsManager={{ ...requirementsManager, saveItem: wrapSave(requirementsManager, true), removeItem: wrapRemove(requirementsManager) }}
            clients={clientsManager.items}
          />
        } />
        <Route path="/developers" element={
          <DevelopersPage developersManager={{ ...developersManager, saveItem: wrapSave(developersManager, true), removeItem: wrapRemove(developersManager) }} />
        } />
        <Route path="/assignments" element={
          <AssignmentsPage
            assignmentsManager={{ ...assignmentsManager, saveItem: wrapSave(assignmentsManager, true), removeItem: wrapRemove(assignmentsManager) }}
            developers={developersManager.items} requirements={requirementsManager.items}
          />
        } />
        <Route path="/finance" element={<FinancePage assignments={assignmentsManager.items} />} />
        <Route path="/settings" element={<SettingsPage profile={profile} email={user.email} onSave={handleSaveProfile} saving={profileSaving} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
      <Toaster richColors position="top-right" theme="dark" />
    </AuthProvider>
  );
}
