import { LayoutDashboard, Users, ClipboardList, Code2, GitMerge, BarChart3, Settings, LogOut, Menu, X, Zap } from "lucide-react";
import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useState } from "react";

const NAV_ICONS = {
  "/": LayoutDashboard,
  "/clients": Users,
  "/requirements": ClipboardList,
  "/developers": Code2,
  "/assignments": GitMerge,
  "/finance": BarChart3,
  "/settings": Settings,
};

function NavItem({ item, onClick }) {
  const Icon = NAV_ICONS[item.path] || LayoutDashboard;
  return (
    <NavLink key={item.path} to={item.path} end={item.path === "/"} onClick={onClick}
      className={({ isActive }) => cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all group",
        isActive ? "nav-active" : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
      )}>
      {({ isActive }) => (
        <>
          <Icon className={cn("h-4 w-4 flex-shrink-0 transition-colors",
            isActive ? "text-blue-400" : "text-slate-600 group-hover:text-slate-400")} />
          {item.label}
        </>
      )}
    </NavLink>
  );
}

export function AppShell({ onSignOut, children, profile }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: "#0d1117" }}>
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 glass border-b border-glass sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-slate-200 text-sm">Resource Manager</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg hover:bg-white/8 text-slate-400 transition-all">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <div className="absolute left-0 top-[57px] bottom-0 w-72 glass border-r border-glass shadow-2xl"
            style={{ background: "rgba(13,17,23,0.97)" }}
            onClick={(e) => e.stopPropagation()}>
            <nav className="p-4 space-y-1">
              {NAV_ITEMS.map((item) => <NavItem key={item.path} item={item} onClick={() => setMobileOpen(false)} />)}
            </nav>
            <div className="px-4 pb-4 border-t border-glass mt-2 pt-4">
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 text-sm transition-all"
                onClick={onSignOut}>
                <LogOut className="h-4 w-4" />Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto flex min-h-screen max-w-[1700px] flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:min-h-screen fixed left-0 top-0 bottom-0"
          style={{ background: "rgba(13,17,23,0.95)", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
          {/* Logo */}
          <div className="px-5 py-5 border-b border-glass">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-slate-200 text-sm leading-tight">Resource Manager</h1>
                <p className="text-xs text-slate-600 mt-0.5">Operations Dashboard</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-1">
            {NAV_ITEMS.map((item) => <NavItem key={item.path} item={item} />)}
          </nav>

          {/* User */}
          <div className="p-4 border-t border-glass">
            <div className="rounded-xl bg-white/3 border border-glass p-3 mb-3">
              <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold mb-1">Workspace</p>
              <p className="font-semibold text-slate-300 text-sm truncate">{profile?.full_name ?? "Your account"}</p>
              <p className="text-xs text-slate-600 truncate">{profile?.company_name ?? profile?.title ?? "Update in settings"}</p>
            </div>
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-600 hover:text-red-400 hover:bg-red-500/10 text-xs transition-all"
              onClick={onSignOut}>
              <LogOut className="h-3.5 w-3.5" />Sign out
            </button>
          </div>
        </aside>

        <main className="flex-1 lg:ml-64 p-4 md:p-6 lg:p-8 min-h-screen">{children}</main>
      </div>
    </div>
  );
}
