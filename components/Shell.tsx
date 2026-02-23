"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Wind, ClipboardList, FileText, ShieldCheck,
  Leaf, LogOut, Building2, Menu, X, Target, Users,
  Lock, HeartPulse, Scale, BarChart2,
  FileDown, TrendingUp, Brain, RefreshCw, Shield,
} from "lucide-react";
import clsx from "clsx";

const NAV_GROUPS = [
  {
    label: "ESG & Sostenibilidad",
    items: [
      { href: "/dashboard",    label: "Dashboard ESG",   icon: LayoutDashboard },
      { href: "/carbon",       label: "Carbon Box",       icon: Wind },
      { href: "/diagnostico",  label: "Diagnóstico ESG",  icon: ClipboardList },
      { href: "/plan-accion",  label: "Plan de Acción",   icon: Target },
      { href: "/kpis",         label: "KPIs",             icon: BarChart2 },
      { href: "/reporte",      label: "Reporte ESG",      icon: FileDown },
    ],
  },
  {
    label: "Gestión ISO",
    items: [
      { href: "/documentos",   label: "Documentos",       icon: FileText },
      { href: "/auditoria",    label: "Auditoría",         icon: ShieldCheck },
      { href: "/proveedores",  label: "Proveedores ESG",   icon: Users },
      { href: "/indicadores",  label: "Indicadores",       icon: TrendingUp },
    ],
  },
  {
    label: "Normas & Cumplimiento",
    items: [
      { href: "/riesgos",      label: "Riesgos / Legal",       icon: Scale },
      { href: "/iso27001",     label: "ISO 27001",              icon: Lock },
      { href: "/sst",          label: "ISO 45001 / SST",        icon: HeartPulse },
      { href: "/nom035",       label: "NOM-035 Psicosocial",    icon: Brain },
      { href: "/mejora",       label: "Mejora Continua",        icon: RefreshCw },
      { href: "/etica",        label: "Canal Ético",             icon: Shield },
    ],
  },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const path      = usePathname();
  const router    = useRouter();
  const [company, setCompany] = useState("");
  const [email,   setEmail]   = useState("");
  const [open,    setOpen]    = useState(false);

  useEffect(() => {
    const c = localStorage.getItem("auditor_company") || "";
    const e = localStorage.getItem("auditor_email")   || "";
    if (!c) { router.replace("/"); return; }
    setCompany(c);
    setEmail(e);
  }, [router]);

  useEffect(() => { setOpen(false); }, [path]);

  function handleLogout() {
    [
      "auditor_company", "auditor_email",
      "auditor_diagnostico", "auditor_carbon",
      "auditor_proveedores", "auditor_riesgos",
      "auditor_indicadores", "auditor_iso27001",
      "auditor_sst", "auditor_riesgos_lista",
      "auditor_legal_lista", "auditor_plan",
      "auditor_kpis", "auditor_nom035",
    ].forEach(k => localStorage.removeItem(k));
    router.replace("/");
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-800 shrink-0">
        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shrink-0">
          <Leaf className="text-white" size={18} />
        </div>
        <span className="font-bold text-base tracking-wide">AUDITOR</span>
        <span className="text-green-400 text-xs font-semibold border border-green-500/40 rounded px-1 ml-auto">ESG</span>
        <button onClick={() => setOpen(false)} className="ml-1 lg:hidden text-slate-500 hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Company */}
      <div className="mx-3 my-3 bg-slate-800 rounded-xl px-3 py-2.5 flex items-start gap-2 shrink-0">
        <Building2 size={14} className="text-slate-400 mt-0.5 shrink-0" />
        <div className="min-w-0">
          <p className="text-white text-xs font-semibold truncate">{company || "—"}</p>
          <p className="text-slate-500 text-xs truncate">{email}</p>
        </div>
      </div>

      {/* Nav — scrollable */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-4 pb-2">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest px-2 mb-1">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors",
                    path === href
                      ? "bg-green-600 text-white font-semibold"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-4 shrink-0 border-t border-slate-800 pt-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-56 bg-slate-900 text-slate-100 flex-col shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="relative z-50 w-60 bg-slate-900 text-slate-100 h-full shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-100 sticky top-0 z-30">
          <button onClick={() => setOpen(true)} className="text-slate-600 hover:text-slate-900 p-1">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded-md flex items-center justify-center">
              <Leaf className="text-white" size={13} />
            </div>
            <span className="font-bold text-sm text-slate-800">AUDITOR</span>
            <span className="text-green-500 text-xs font-semibold border border-green-400 rounded px-1">ESG</span>
          </div>
          <span className="ml-auto text-xs text-slate-400 truncate max-w-[120px]">{company}</span>
        </header>

        <main className="flex-1 overflow-auto bg-slate-50">{children}</main>
      </div>
    </div>
  );
}
