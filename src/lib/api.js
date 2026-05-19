import { supabase } from "@/lib/supabase";

function ensureClient() {
  if (!supabase) throw new Error("Missing Supabase environment variables.");
}

export async function signInWithPassword(email, password) {
  ensureClient();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithPassword(email, password, fullName) {
  ensureClient();
  return supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
}

export async function signOut() {
  ensureClient();
  return supabase.auth.signOut();
}

export async function getSession() {
  ensureClient();
  return supabase.auth.getSession();
}

export function onAuthStateChange(callback) {
  ensureClient();
  return supabase.auth.onAuthStateChange(callback);
}

export async function fetchClients() {
  ensureClient();
  return supabase.from("clients").select("*").order("created_at", { ascending: false });
}

export async function fetchRequirements() {
  ensureClient();
  return supabase.from("requirements").select("*, client:clients(id, name, client_type)").order("created_at", { ascending: false });
}

export async function fetchDevelopers() {
  ensureClient();
  return supabase.from("developers").select("*").order("created_at", { ascending: false });
}

export async function fetchAssignments() {
  ensureClient();
  return supabase.from("assignments")
    .select("*, developer:developers(id, name, availability), requirement:requirements(id, role, cloud, status, client:clients(id, name, client_type))")
    .order("start_date", { ascending: false });
}

export async function fetchProfile(userId) {
  ensureClient();
  return supabase.from("users").select("*").eq("id", userId).single();
}

export async function updateProfile(userId, payload) {
  ensureClient();
  return supabase.from("users").update(payload).eq("id", userId).select().single();
}

export async function uploadResume(developerId, file) {
  ensureClient();
  const ext = file.name.split(".").pop();
  const path = `resumes/${developerId}.${ext}`;
  const { error } = await supabase.storage.from("developer-resumes").upload(path, file, { upsert: true });
  if (error) return { data: null, error };
  const { data } = supabase.storage.from("developer-resumes").getPublicUrl(path);
  return { data: { url: data.publicUrl, path }, error: null };
}

export async function createEntity(table, payload) {
  ensureClient();
  return supabase.from(table).insert(payload).select().single();
}

export async function updateEntity(table, id, payload) {
  ensureClient();
  return supabase.from(table).update(payload).eq("id", id).select().single();
}

export async function deleteEntity(table, id) {
  ensureClient();
  return supabase.from(table).delete().eq("id", id);
}
