"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Wind, ClipboardList, FileText,
  ShieldCheck, Leaf, LogOut, Building2, Menu, X,
  Target, BarChart2, AlertTriangle, FileDown,
} from "lucide-react";
import clsx from "clsx";

const nav = [
  { href: "/dashboard",   label: "Dashboard ESG",  icon: LayoutDashboard },
  { href: "/diagnostico", label: "Diagnóstico",    icon: ClipboardList },
  { href: "/plan-accion", label: "Plan de Acción",  icon: Target        },
  { href: "/kpis",        label: "KPIs",            icon: BarChart2     },
  { href: "/riesgos",     label: "Riesgos",         icon: AlertTriangle },
  { href: "/reporte",     label: "Reporte ESG",     icon: FileDown      },
  { href: "/carbon",      label: "Carbon Box",      icon: Wind          },
  { href: "/documentos",  label: "Documentos",      icon: FileText      },
  { href: "/auditoria",   label: "Auditoría",       icon: ShieldCheck   },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const path      = usePathname();
  const router    = useRouter();
  const [company, setCompany] = useState("");
  const [email,   setEmail]   = useState("");
  const [open,    setOpen]    = useState(false); // mobile sidebar

  useEffect(() => {
    const c = localStorage.getItem("auditor_company") || "";
    const e = localStorage.getItem("auditor_email")   || "";
    if (!c) { router.replace("/"); return; }
    setCompany(c);
    setEmail(e);
  }, [router]);

  // Close sidebar on route change (mobile)
  useEffect(() => { setOpen(false); }, [path]);

  function handleLogout() {
    ["auditor_company", "auditor_email", "auditor_diagnostico", "auditor_carbon"]
      .forEach(k => localStorage.removeItem(k));
    router.replace("/");
  }

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-800">
        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shrink-0">
          <Leaf className="text-white" size={18} />
        </div>
        <span className="font-bold text-base tracking-wide">AUDITOR</span>
        <span className="text-green-400 text-xs font-semibold border border-green-500/40 rounded px-1 ml-auto">ESG</span>
        {/* Close button — mobile only */}
        <button
          onClick={() => setOpen(false)}
          className="ml-1 lg:hidden text-slate-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Company */}
      <div className="mx-4 my-4 bg-slate-800 rounded-xl px-3 py-3 flex items-start gap-2">
        <Building2 size={16} className="text-slate-400 mt-0.5 shrink-0" />
        <div className="min-w-0">
          <p className="text-white text-xs font-semibold truncate">{company || "—"}</p>
          <p className="text-slate-500 text-xs truncate">{email}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors",
              path === href
                ? "bg-green-600 text-white font-semibold"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut size={17} />
          Cerrar sesión
        </button>
        <p className="text-slate-700 text-xs text-center mt-3">
          ISO 14001 · ISO 9001 · GRI
        </p>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen">

      {/* ── Desktop Sidebar (always visible ≥ lg) ── */}
      <aside className="hidden lg:flex w-60 bg-slate-900 text-slate-100 flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar Overlay ── */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          {/* Drawer */}
          <aside className="relative z-50 w-64 bg-slate-900 text-slate-100 flex flex-col h-full shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-100 sticky top-0 z-30">
          <button
            onClick={() => setOpen(true)}
            className="text-slate-600 hover:text-slate-900 transition-colors p-1"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded-md flex items-center justify-center">
              <Leaf className="text-white" size={13} />
            </div>
            <span className="font-bold text-sm text-slate-800">AUDITOR</span>
            <span className="text-green-500 text-xs font-semibold border border-green-400 rounded px-1">ESG</span>
          </div>
          <span className="ml-auto text-xs text-slate-400 truncate max-w-[130px]">{company}</span>
        </header>

        <main className="flex-1 overflow-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
