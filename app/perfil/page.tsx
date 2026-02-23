"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Shell from "@/components/Shell";
import {
  Settings, Save, Award, Wind, ShieldCheck, Lock, AlertTriangle,
  FileText, Scale, Heart, TrendingUp, RefreshCw, Truck, CheckCircle,
} from "lucide-react";
import type { Perfil } from "@/app/onboarding/page";

const PERFIL_KEY = "auditor_perfil";

const SECTORES = [
  "Manufactura", "Servicios Profesionales", "Construcción",
  "Alimentos y Bebidas", "Salud / Farmacéutica", "Tecnología",
  "Educación", "Gobierno / Público", "Logística / Transporte",
  "Energía", "Agroindustria", "Comercio / Retail", "Otro",
];
const EMPLEADOS  = ["1 – 10", "11 – 50", "51 – 250", "251 – 1,000", "1,000+"];
const PAISES     = ["México", "Colombia", "España", "Argentina", "Chile", "Perú", "Brasil", "Otro"];

const ISOS: { id: string; label: string; desc: string; icon: typeof Award }[] = [
  { id: "ISO 9001",  label: "ISO 9001",  desc: "Gestión de calidad",               icon: Award       },
  { id: "ISO 14001", label: "ISO 14001", desc: "Gestión ambiental",                icon: Wind        },
  { id: "ISO 45001", label: "ISO 45001", desc: "Seguridad y salud en el trabajo",  icon: ShieldCheck },
  { id: "ISO 27001", label: "ISO 27001", desc: "Seguridad de la información",      icon: Lock        },
  { id: "ISO 37001", label: "ISO 37001", desc: "Antisoborno",                      icon: Scale       },
  { id: "ISO 37301", label: "ISO 37301", desc: "Compliance / Cumplimiento",        icon: FileText    },
  { id: "ISO 31000", label: "ISO 31000", desc: "Gestión de riesgos",               icon: AlertTriangle },
];

const FRAMEWORKS = [
  { id: "GRI 2021",     label: "GRI 2021",    desc: "Reporte de sostenibilidad" },
  { id: "CSRD",         label: "CSRD",         desc: "Directiva europea de reporte corporativo" },
  { id: "GHG Protocol", label: "GHG Protocol", desc: "Protocolo de gases de efecto invernadero" },
  { id: "LGPD/GDPR",   label: "LGPD / GDPR", desc: "Protección de datos personales" },
  { id: "SARLAFT",      label: "SARLAFT",      desc: "Antilavado — Colombia" },
];

const NORMAS_LOCALES = [
  { id: "NOM-035", label: "NOM-035", desc: "Factores de riesgo psicosocial (México)" },
  { id: "NOM-030", label: "NOM-030", desc: "Servicios preventivos SST (México)" },
];

const OBJETIVOS: { id: string; label: string; icon: typeof Award }[] = [
  { id: "certificacion", label: "Certificación ISO",           icon: Award       },
  { id: "carbon",        label: "Reducir huella de carbono",   icon: Wind        },
  { id: "esg",           label: "Reporte ESG / CSRD",          icon: TrendingUp  },
  { id: "riesgos",       label: "Gestión de riesgos",          icon: AlertTriangle },
  { id: "bienestar",     label: "Bienestar laboral",           icon: Heart       },
  { id: "seguridad",     label: "Seguridad de la información", icon: Lock        },
  { id: "mejora",        label: "Mejora continua",             icon: RefreshCw   },
  { id: "proveedores",   label: "Evaluación de proveedores",   icon: Truck       },
];

function toggle(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
}

const EMPTY: Perfil = {
  sector: "", empleados: "", pais: "",
  isos: [], frameworks: [], normas_locales: [], objetivos: [],
};

export default function PerfilPage() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<Perfil>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PERFIL_KEY);
      if (raw) setPerfil(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  function set<K extends keyof Perfil>(key: K, val: Perfil[K]) {
    setPerfil(prev => ({ ...prev, [key]: val }));
    setSaved(false);
  }

  function save() {
    localStorage.setItem(PERFIL_KEY, JSON.stringify(perfil));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (!hydrated) return null;

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
      <h2 className="font-bold text-slate-800">{title}</h2>
      {children}
    </div>
  );

  return (
    <Shell>
      <div className="p-4 sm:p-8 max-w-3xl space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Settings className="text-slate-500" size={22} /> Perfil de empresa
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Configura qué módulos activa la plataforma para tu organización
            </p>
          </div>
          <button
            onClick={save}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ${
              saved
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-green-600 hover:bg-green-500 text-white"
            }`}
          >
            {saved ? <><CheckCircle size={15} /> Guardado</> : <><Save size={15} /> Guardar cambios</>}
          </button>
        </div>

        {/* Sección 1 — Empresa */}
        <Section title="Tu empresa">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-form">Sector / Giro</label>
              <select value={perfil.sector} onChange={e => set("sector", e.target.value)} className="select-form">
                <option value="">Seleccionar...</option>
                {SECTORES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label-form">País principal</label>
              <select value={perfil.pais} onChange={e => set("pais", e.target.value)} className="select-form">
                <option value="">Seleccionar...</option>
                {PAISES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label-form">Número de empleados</label>
              <div className="flex flex-wrap gap-2">
                {EMPLEADOS.map(e => (
                  <button key={e} type="button" onClick={() => set("empleados", e)}
                    className={`px-4 py-2 rounded-xl border-2 text-xs font-semibold transition-all active:scale-95 ${
                      perfil.empleados === e
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-slate-100 bg-white text-slate-500 hover:border-slate-300"
                    }`}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Sección 2 — ISOs */}
        <Section title="Normas ISO">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ISOS.map(({ id, label, desc, icon: Icon }) => {
              const sel = perfil.isos.includes(id);
              return (
                <button key={id} type="button" onClick={() => set("isos", toggle(perfil.isos, id))}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all active:scale-95 ${
                    sel ? "border-green-500 bg-green-50" : "border-slate-100 bg-white hover:border-slate-300"
                  }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${sel ? "bg-green-500" : "bg-slate-100"}`}>
                    <Icon size={15} className={sel ? "text-white" : "text-slate-400"} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{label}</p>
                    <p className="text-slate-400 text-xs">{desc}</p>
                  </div>
                  {sel && <CheckCircle size={14} className="text-green-500 ml-auto shrink-0" />}
                </button>
              );
            })}
          </div>
        </Section>

        {/* Sección 3 — Frameworks */}
        <Section title="Marcos internacionales">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {FRAMEWORKS.map(({ id, label, desc }) => {
              const sel = perfil.frameworks.includes(id);
              return (
                <button key={id} type="button" onClick={() => set("frameworks", toggle(perfil.frameworks, id))}
                  className={`flex items-center justify-between gap-2 p-3 rounded-xl border-2 text-left transition-all active:scale-95 ${
                    sel ? "border-green-500 bg-green-50" : "border-slate-100 bg-white hover:border-slate-300"
                  }`}>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{label}</p>
                    <p className="text-slate-400 text-xs">{desc}</p>
                  </div>
                  {sel && <CheckCircle size={14} className="text-green-500 shrink-0" />}
                </button>
              );
            })}
          </div>
        </Section>

        {/* Sección 4 — Normas locales */}
        <Section title="Normativas locales">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {NORMAS_LOCALES.map(({ id, label, desc }) => {
              const sel = perfil.normas_locales.includes(id);
              return (
                <button key={id} type="button" onClick={() => set("normas_locales", toggle(perfil.normas_locales, id))}
                  className={`flex items-center justify-between gap-2 p-3 rounded-xl border-2 text-left transition-all active:scale-95 ${
                    sel ? "border-green-500 bg-green-50" : "border-slate-100 bg-white hover:border-slate-300"
                  }`}>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{label}</p>
                    <p className="text-slate-400 text-xs">{desc}</p>
                  </div>
                  {sel && <CheckCircle size={14} className="text-green-500 shrink-0" />}
                </button>
              );
            })}
          </div>
        </Section>

        {/* Sección 5 — Objetivos */}
        <Section title="Objetivos principales">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {OBJETIVOS.map(({ id, label, icon: Icon }) => {
              const sel = perfil.objetivos.includes(id);
              return (
                <button key={id} type="button" onClick={() => set("objetivos", toggle(perfil.objetivos, id))}
                  className={`flex flex-col items-center text-center gap-2 p-3 rounded-xl border-2 transition-all active:scale-95 ${
                    sel ? "border-green-500 bg-green-50" : "border-slate-100 bg-white hover:border-slate-300"
                  }`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${sel ? "bg-green-500" : "bg-slate-100"}`}>
                    <Icon size={17} className={sel ? "text-white" : "text-slate-400"} />
                  </div>
                  <p className={`text-xs font-semibold leading-tight ${sel ? "text-green-700" : "text-slate-600"}`}>{label}</p>
                </button>
              );
            })}
          </div>
        </Section>

        {/* Bottom save */}
        <div className="flex justify-end pb-4">
          <button onClick={save}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${
              saved ? "bg-green-100 text-green-700 border border-green-200" : "bg-green-600 hover:bg-green-500 text-white"
            }`}>
            {saved ? <><CheckCircle size={15} /> Guardado</> : <><Save size={15} /> Guardar cambios</>}
          </button>
        </div>
      </div>
    </Shell>
  );
}
