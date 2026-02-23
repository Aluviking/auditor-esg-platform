"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Leaf, Building2, Users2, Globe, Award, Wind, ShieldCheck,
  Lock, AlertTriangle, FileText, Scale, Heart, TrendingUp,
  RefreshCw, Truck, ChevronRight, ChevronLeft, CheckCircle, Sparkles,
} from "lucide-react";

/* ─── Tipos ─────────────────────────────────────────────────────── */
export type Perfil = {
  sector: string;
  empleados: string;
  pais: string;
  isos: string[];
  frameworks: string[];
  normas_locales: string[];
  objetivos: string[];
};

const PERFIL_KEY = "auditor_perfil";

const SECTORES = [
  "Manufactura", "Servicios Profesionales", "Construcción",
  "Alimentos y Bebidas", "Salud / Farmacéutica", "Tecnología",
  "Educación", "Gobierno / Público", "Logística / Transporte",
  "Energía", "Agroindustria", "Comercio / Retail", "Otro",
];

const EMPLEADOS = ["1 – 10", "11 – 50", "51 – 250", "251 – 1,000", "1,000+"];

const PAISES = [
  "México", "Colombia", "España", "Argentina",
  "Chile", "Perú", "Brasil", "Otro",
];

const ISOS: { id: string; label: string; desc: string; icon: typeof Award }[] = [
  { id: "ISO 9001",  label: "ISO 9001",  desc: "Gestión de calidad",                icon: Award      },
  { id: "ISO 14001", label: "ISO 14001", desc: "Gestión ambiental",                 icon: Wind       },
  { id: "ISO 45001", label: "ISO 45001", desc: "Seguridad y salud en el trabajo",   icon: ShieldCheck },
  { id: "ISO 27001", label: "ISO 27001", desc: "Seguridad de la información",       icon: Lock       },
  { id: "ISO 37001", label: "ISO 37001", desc: "Antisoborno",                       icon: Scale      },
  { id: "ISO 37301", label: "ISO 37301", desc: "Compliance / Cumplimiento",         icon: FileText   },
  { id: "ISO 31000", label: "ISO 31000", desc: "Gestión de riesgos",                icon: AlertTriangle },
];

const FRAMEWORKS: { id: string; label: string; desc: string }[] = [
  { id: "GRI 2021",     label: "GRI 2021",      desc: "Estándares de reporte de sostenibilidad" },
  { id: "CSRD",         label: "CSRD",           desc: "Directiva europea de reporte corporativo" },
  { id: "GHG Protocol", label: "GHG Protocol",   desc: "Protocolo de gases de efecto invernadero" },
  { id: "NOM-035",      label: "NOM-035",         desc: "Factores de riesgo psicosocial (México)" },
  { id: "NOM-030",      label: "NOM-030",         desc: "Servicios preventivos SST (México)" },
  { id: "LGPD/GDPR",   label: "LGPD / GDPR",    desc: "Protección de datos personales" },
  { id: "SARLAFT",      label: "SARLAFT",         desc: "Sistema antilavado (Colombia)" },
];

const OBJETIVOS: { id: string; label: string; icon: typeof Award }[] = [
  { id: "certificacion", label: "Certificación ISO",             icon: Award       },
  { id: "carbon",        label: "Reducir huella de carbono",     icon: Wind        },
  { id: "esg",           label: "Reporte ESG / CSRD",            icon: TrendingUp  },
  { id: "riesgos",       label: "Gestión de riesgos",            icon: AlertTriangle },
  { id: "bienestar",     label: "Bienestar laboral",             icon: Heart       },
  { id: "seguridad",     label: "Seguridad de la información",   icon: Lock        },
  { id: "mejora",        label: "Mejora continua",               icon: RefreshCw   },
  { id: "proveedores",   label: "Evaluación de proveedores",     icon: Truck       },
];

const TOTAL_STEPS = 4;

function toggle(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
}

/* ─── Componentes de apoyo ───────────────────────────────────────── */
function StepBar({ step }: { step: number }) {
  const labels = ["Tu empresa", "Normas ISO", "Marcos y normativas", "Objetivos"];
  return (
    <div className="flex items-center gap-0 w-full mb-8">
      {labels.map((l, i) => {
        const active   = i + 1 === step;
        const done     = i + 1 < step;
        return (
          <div key={l} className="flex-1 flex flex-col items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 transition-all
              ${done   ? "bg-green-500 text-white"
              : active ? "bg-slate-800 text-white ring-4 ring-slate-100"
              :          "bg-slate-100 text-slate-400"}`}>
              {done ? <CheckCircle size={14} /> : i + 1}
            </div>
            <span className={`text-[10px] font-semibold text-center leading-tight hidden sm:block
              ${active ? "text-slate-800" : done ? "text-green-600" : "text-slate-400"}`}>
              {l}
            </span>
            {i < labels.length - 1 && (
              <div className={`absolute translate-x-[calc(50%+14px)] -translate-y-4 hidden`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ToggleCard({
  selected, onClick, children,
}: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left border-2 rounded-2xl p-4 transition-all active:scale-95 ${
        selected
          ? "border-green-500 bg-green-50"
          : "border-slate-100 bg-white hover:border-slate-300"
      }`}
    >
      {children}
    </button>
  );
}

/* ─── Página principal ───────────────────────────────────────────── */
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep]   = useState(1);
  const [perfil, setPerfil] = useState<Perfil>({
    sector: "", empleados: "", pais: "",
    isos: [], frameworks: [], normas_locales: [], objetivos: [],
  });

  // Si ya hay perfil, ir directo al dashboard
  useEffect(() => {
    const p = localStorage.getItem(PERFIL_KEY);
    if (p) router.replace("/dashboard");
  }, [router]);

  function set<K extends keyof Perfil>(key: K, val: Perfil[K]) {
    setPerfil(prev => ({ ...prev, [key]: val }));
  }

  function canNext(): boolean {
    if (step === 1) return !!(perfil.sector && perfil.empleados && perfil.pais);
    if (step === 2) return perfil.isos.length > 0;
    if (step === 3) return true; // frameworks son opcionales
    if (step === 4) return perfil.objetivos.length > 0;
    return false;
  }

  function finish() {
    localStorage.setItem(PERFIL_KEY, JSON.stringify(perfil));
    router.push("/dashboard");
  }

  /* ── Resumen de módulos activados ── */
  const userTags = [
    ...perfil.isos, ...perfil.frameworks, ...perfil.normas_locales, ...perfil.objetivos,
  ];
  const ALL_MODULES = [
    { href: "/dashboard",   label: "Dashboard ESG",          tags: ["always"]                                    },
    { href: "/carbon",      label: "Carbon Box",              tags: ["ISO 14001","esg","carbon","GHG Protocol"]   },
    { href: "/diagnostico", label: "Diagnóstico ESG",         tags: ["ISO 14001","esg","csrd","CSRD","GRI 2021"]  },
    { href: "/plan-accion", label: "Plan de Acción",          tags: ["ISO 9001","ISO 14001","ISO 45001","mejora"] },
    { href: "/kpis",        label: "KPIs",                    tags: ["ISO 9001","esg","csrd","CSRD","GRI 2021"]   },
    { href: "/reporte",     label: "Reporte ESG",             tags: ["esg","CSRD","GRI 2021"]                     },
    { href: "/documentos",  label: "Documentos",              tags: ["ISO 9001","ISO 14001","ISO 45001"]          },
    { href: "/auditoria",   label: "Auditoría",               tags: ["ISO 9001","ISO 14001","ISO 45001"]          },
    { href: "/proveedores", label: "Proveedores ESG",         tags: ["ISO 9001","ISO 14001","esg","proveedores"]  },
    { href: "/indicadores", label: "Indicadores",             tags: ["ISO 9001","ISO 14001","esg","GRI 2021"]     },
    { href: "/riesgos",     label: "Riesgos / Legal",         tags: ["always"]                                    },
    { href: "/iso27001",    label: "ISO 27001",               tags: ["ISO 27001","seguridad"]                     },
    { href: "/sst",         label: "ISO 45001 / SST",         tags: ["ISO 45001"]                                 },
    { href: "/nom035",      label: "NOM-035 Psicosocial",     tags: ["NOM-035","bienestar"]                       },
    { href: "/mejora",      label: "Mejora Continua",         tags: ["ISO 9001","ISO 14001","ISO 45001","mejora"] },
    { href: "/etica",       label: "Canal Ético",             tags: ["always"]                                    },
  ];
  const activados = ALL_MODULES.filter(m =>
    m.tags.includes("always") || m.tags.some(t => userTags.includes(t))
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-start py-10 px-4">
      {/* Brand */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center">
          <Leaf className="text-white" size={20} />
        </div>
        <span className="font-bold text-xl text-slate-800">AUDITOR</span>
        <span className="text-green-500 text-xs font-semibold border border-green-400 rounded px-1.5">ESG</span>
      </div>

      <div className="w-full max-w-xl">
        {step <= TOTAL_STEPS ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <StepBar step={step} />

            {/* ── Step 1 — Empresa ── */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Cuéntanos sobre tu empresa</h2>
                  <p className="text-slate-500 text-sm mt-1">Esta información personalizará tu experiencia en la plataforma.</p>
                </div>

                <div>
                  <label className="label-form">Sector / Giro de negocio *</label>
                  <select value={perfil.sector} onChange={e => set("sector", e.target.value)} className="select-form">
                    <option value="">Selecciona un sector...</option>
                    {SECTORES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="label-form">Número de empleados *</label>
                  <div className="grid grid-cols-5 gap-2">
                    {EMPLEADOS.map(e => (
                      <button
                        key={e} type="button"
                        onClick={() => set("empleados", e)}
                        className={`py-2 rounded-xl border-2 text-xs font-semibold transition-all active:scale-95 ${
                          perfil.empleados === e
                            ? "border-green-500 bg-green-50 text-green-700"
                            : "border-slate-100 bg-white text-slate-500 hover:border-slate-300"
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label-form">País principal *</label>
                  <select value={perfil.pais} onChange={e => set("pais", e.target.value)} className="select-form">
                    <option value="">Selecciona un país...</option>
                    {PAISES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* ── Step 2 — ISOs ── */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Normas ISO</h2>
                  <p className="text-slate-500 text-sm mt-1">Selecciona las normas que ya manejas o quieres implementar. Puedes elegir varias.</p>
                </div>
                <div className="space-y-2">
                  {ISOS.map(({ id, label, desc, icon: Icon }) => (
                    <ToggleCard key={id} selected={perfil.isos.includes(id)} onClick={() => set("isos", toggle(perfil.isos, id))}>
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          perfil.isos.includes(id) ? "bg-green-500" : "bg-slate-100"
                        }`}>
                          <Icon size={17} className={perfil.isos.includes(id) ? "text-white" : "text-slate-400"} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{label}</p>
                          <p className="text-slate-500 text-xs">{desc}</p>
                        </div>
                        {perfil.isos.includes(id) && (
                          <CheckCircle size={16} className="text-green-500 ml-auto shrink-0" />
                        )}
                      </div>
                    </ToggleCard>
                  ))}
                </div>
              </div>
            )}

            {/* ── Step 3 — Frameworks ── */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Marcos y normativas locales</h2>
                  <p className="text-slate-500 text-sm mt-1">Opcional. Selecciona los marcos regulatorios que aplican a tu organización.</p>
                </div>
                <div className="space-y-2">
                  {FRAMEWORKS.map(({ id, label, desc }) => {
                    const all = [...perfil.frameworks, ...perfil.normas_locales];
                    const sel = all.includes(id);
                    const isLocal = ["NOM-035","NOM-030"].includes(id);
                    return (
                      <ToggleCard key={id} selected={sel} onClick={() => {
                        if (isLocal) set("normas_locales", toggle(perfil.normas_locales, id));
                        else         set("frameworks",     toggle(perfil.frameworks, id));
                      }}>
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{label}</p>
                            <p className="text-slate-500 text-xs">{desc}</p>
                          </div>
                          {sel && <CheckCircle size={16} className="text-green-500 shrink-0" />}
                        </div>
                      </ToggleCard>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Step 4 — Objetivos ── */}
            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">¿Qué quieres lograr?</h2>
                  <p className="text-slate-500 text-sm mt-1">Selecciona tus objetivos principales. Esto activa los módulos relevantes.</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {OBJETIVOS.map(({ id, label, icon: Icon }) => (
                    <ToggleCard key={id} selected={perfil.objetivos.includes(id)} onClick={() => set("objetivos", toggle(perfil.objetivos, id))}>
                      <div className="flex flex-col items-center text-center gap-2 py-1">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          perfil.objetivos.includes(id) ? "bg-green-500" : "bg-slate-100"
                        }`}>
                          <Icon size={18} className={perfil.objetivos.includes(id) ? "text-white" : "text-slate-400"} />
                        </div>
                        <p className={`text-xs font-semibold leading-tight ${
                          perfil.objetivos.includes(id) ? "text-green-700" : "text-slate-600"
                        }`}>{label}</p>
                      </div>
                    </ToggleCard>
                  ))}
                </div>

                {/* Preview módulos activados */}
                {perfil.objetivos.length > 0 && (
                  <div className="bg-slate-50 rounded-2xl p-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Sparkles size={12} className="text-green-500" />
                      {activados.length} módulos activados para tu perfil
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {activados.map(m => (
                        <span key={m.href} className="text-xs bg-white border border-slate-200 text-slate-600 font-medium px-2.5 py-1 rounded-full">
                          {m.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <button
                  onClick={() => setStep(v => v - 1)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-colors"
                >
                  <ChevronLeft size={16} /> Anterior
                </button>
              )}
              <button
                onClick={() => step < TOTAL_STEPS ? setStep(v => v + 1) : finish()}
                disabled={!canNext()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition-all active:scale-95"
              >
                {step < TOTAL_STEPS ? (
                  <><span>Continuar</span> <ChevronRight size={16} /></>
                ) : (
                  <><Sparkles size={16} /> <span>Comenzar con AUDITOR</span></>
                )}
              </button>
            </div>

            <p className="text-center text-xs text-slate-300 mt-4">
              Paso {step} de {TOTAL_STEPS} · Puedes editar esto en cualquier momento desde tu perfil
            </p>
          </div>
        ) : null}
      </div>

      {/* Bottom brand hint */}
      <div className="mt-8 flex items-center gap-2 text-slate-400 text-xs">
        <Building2 size={12} />
        <span>La configuración se guarda localmente en este dispositivo</span>
      </div>
    </div>
  );
}
