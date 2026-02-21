"use client";
import { useState, useEffect } from "react";
import Shell from "@/components/Shell";
import { FileDown, Printer, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

// Mirror of the diagnostic structure (question IDs and section weights)
const SECTIONS = [
  { id: "ambiental",  label: "Ambiental",  norm: "ISO 14001", color: "bg-green-500",  bar: "bg-green-500",  ids: ["a1","a2","a3","a4","a5","a6"] },
  { id: "social",     label: "Social",     norm: "GRI 400",   color: "bg-blue-500",   bar: "bg-blue-500",   ids: ["s1","s2","s3","s4","s5"]     },
  { id: "gobernanza", label: "Gobernanza", norm: "GRI 200",   color: "bg-purple-500", bar: "bg-purple-500", ids: ["g1","g2","g3","g4","g5"]     },
  { id: "calidad",    label: "Calidad",    norm: "ISO 9001",  color: "bg-orange-500", bar: "bg-orange-500", ids: ["q1","q2","q3","q4"]          },
];
const SCORE_MAP: Record<string, number> = { si: 2, parcial: 1, no: 0 };

type Action  = { title: string; progress: number; responsible: string; category: string };
type Risk    = { name: string; probability: number; impact: number; category: string };
type KPIData = { name: string; current: number; target: number; unit: string };

export default function ReportePage() {
  const [company,   setCompany]   = useState("");
  const [email,     setEmail]     = useState("");
  const [hydrated,  setHydrated]  = useState(false);
  const [diagAns,   setDiagAns]   = useState<Record<string, string>>({});
  const [actions,   setActions]   = useState<Action[]>([]);
  const [risks,     setRisks]     = useState<Risk[]>([]);
  const [kpis,      setKPIs]      = useState<KPIData[]>([]);

  useEffect(() => {
    setCompany(localStorage.getItem("auditor_company") || "Empresa");
    setEmail(localStorage.getItem("auditor_email") || "");
    try { const d = localStorage.getItem("auditor_diagnostico"); if (d) setDiagAns(JSON.parse(d).answers || {}); } catch {}
    try { const a = localStorage.getItem("auditor_plan");        if (a) setActions(JSON.parse(a));              } catch {}
    try { const r = localStorage.getItem("auditor_riesgos");     if (r) setRisks(JSON.parse(r));               } catch {}
    try { const k = localStorage.getItem("auditor_kpis");        if (k) setKPIs(JSON.parse(k));                } catch {}
    setHydrated(true);
  }, []);

  // Scores
  const sectionScores = SECTIONS.map(s => {
    const maxPts = s.ids.length * 2;
    const pts    = s.ids.reduce((acc, id) => acc + (SCORE_MAP[diagAns[id] ?? ""] ?? 0), 0);
    return { ...s, pts, maxPts, pct: maxPts > 0 ? Math.round((pts / maxPts) * 100) : 0 };
  });
  const totalPts    = sectionScores.reduce((a, s) => a + s.pts, 0);
  const totalMaxPts = sectionScores.reduce((a, s) => a + s.maxPts, 0);
  const globalPct   = totalMaxPts > 0 ? Math.round((totalPts / totalMaxPts) * 100) : 0;
  const level       = globalPct >= 75 ? "Avanzado" : globalPct >= 50 ? "En Desarrollo" : "Inicial";
  const levelColor  = globalPct >= 75 ? "text-green-400" : globalPct >= 50 ? "text-yellow-400" : "text-red-400";

  const completedActions = actions.filter(a => a.progress === 100).length;
  const criticalRisks    = risks.filter(r => r.probability * r.impact >= 15).length;
  const kpisOnTarget     = kpis.filter(k => k.target > 0 && k.current / k.target >= 0.8).length;

  const today = new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });

  if (!hydrated) return null;

  return (
    <Shell>
      <div className="p-6 md:p-8 max-w-4xl space-y-6">

        {/* Toolbar — hidden when printing */}
        <div className="flex items-center justify-between flex-wrap gap-3 print:hidden">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <FileDown className="text-green-500" size={26} /> Reporte ESG
            </h1>
            <p className="text-slate-500 text-sm mt-1">Informe ejecutivo de sostenibilidad</p>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <Printer size={16} /> Imprimir / PDF
          </button>
        </div>

        {/* ─── REPORT BODY ─────────────────────────────── */}

        {/* Cover card */}
        <div className="bg-slate-900 text-white rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-sm font-bold">A</div>
            <span className="font-bold tracking-wide">AUDITOR ESG</span>
          </div>
          <h2 className="text-2xl font-extrabold mb-1">Reporte de Sostenibilidad ESG</h2>
          <p className="text-slate-400 text-sm mb-6">{company} · {email} · {today}</p>

          <div className="flex items-end gap-6">
            <div>
              <p className={`text-6xl font-extrabold ${levelColor}`}>{globalPct}%</p>
              <p className="text-slate-400 text-sm mt-1">Score ESG Global</p>
              <p className={`font-semibold mt-0.5 ${levelColor}`}>{level}</p>
            </div>
            <div className="flex-1 space-y-2 pb-1">
              {sectionScores.map(s => (
                <div key={s.id} className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-20 shrink-0">{s.label}</span>
                  <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full ${s.bar} rounded-full`} style={{ width: `${s.pct}%` }} />
                  </div>
                  <span className="text-xs font-bold text-slate-300 w-8 text-right">{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-6">GRI 2021 · ISO 14001 · ISO 9001 · CSRD · ISO 31000</p>
        </div>

        {/* Summary metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Score ESG",         value: `${globalPct}%`,             sub: level,              icon: globalPct >= 75 ? CheckCircle : globalPct >= 50 ? AlertTriangle : XCircle, color: globalPct >= 75 ? "text-green-500" : globalPct >= 50 ? "text-yellow-500" : "text-red-500" },
            { label: "Plan de acción",    value: `${completedActions}/${actions.length}`, sub: "Completadas",     icon: CheckCircle,    color: "text-blue-500"   },
            { label: "Riesgos críticos",  value: criticalRisks,               sub: "ISO 31000",        icon: AlertTriangle,  color: "text-red-500"    },
            { label: "KPIs en meta",      value: `${kpisOnTarget}/${kpis.length}`,        sub: "≥80% del objetivo", icon: CheckCircle,   color: "text-green-500"  },
          ].map(item => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm text-center">
                <Icon className={`mx-auto mb-1 ${item.color}`} size={22} />
                <p className="text-xl font-bold text-slate-800">{item.value}</p>
                <p className="text-xs font-semibold text-slate-600 mt-0.5">{item.label}</p>
                <p className="text-xs text-slate-400">{item.sub}</p>
              </div>
            );
          })}
        </div>

        {/* Section detail */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-slate-800 text-lg mb-4">Desempeño por Dimensión</h3>
          <div className="space-y-5">
            {sectionScores.map(sec => {
              const Icon      = sec.pct >= 75 ? CheckCircle : sec.pct >= 50 ? AlertTriangle : XCircle;
              const iconColor = sec.pct >= 75 ? "text-green-500" : sec.pct >= 50 ? "text-yellow-500" : "text-red-500";
              return (
                <div key={sec.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Icon className={iconColor} size={16} />
                      <span className="font-semibold text-slate-800 text-sm">{sec.label}</span>
                      <span className="text-xs text-slate-400">{sec.norm}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-700">{sec.pct}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${sec.bar} rounded-full transition-all`} style={{ width: `${sec.pct}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 mt-0.5">
                    <span>{sec.pts} de {sec.maxPts} puntos</span>
                    <span>{sec.pct >= 75 ? "Avanzado" : sec.pct >= 50 ? "En desarrollo" : "Inicial"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Plan de acción */}
        {actions.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 mb-4">Plan de Acción ESG</h3>
            <div className="space-y-2">
              {actions.map((a, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${a.progress === 100 ? "bg-green-500" : "bg-slate-300"}`} />
                  <p className="text-sm text-slate-700 flex-1 truncate">{a.title}</p>
                  <span className="text-xs text-slate-400 shrink-0">👤 {a.responsible}</span>
                  <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${a.progress}%` }} />
                  </div>
                  <span className="text-xs font-bold text-slate-500 w-8 text-right shrink-0">{a.progress}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KPIs */}
        {kpis.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 mb-4">Indicadores Clave (KPIs)</h3>
            <div className="grid grid-cols-2 gap-3">
              {kpis.map((kpi, i) => {
                const pct = kpi.target > 0 ? Math.min(100, Math.round((kpi.current / kpi.target) * 100)) : 0;
                return (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-500 mb-1 truncate">{kpi.name}</p>
                    <p className="font-bold text-slate-800">
                      {kpi.current} <span className="text-slate-400 font-normal text-xs">{kpi.unit}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${pct >= 80 ? "bg-green-500" : "bg-red-400"}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-bold text-slate-500">{pct}%</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Meta: {kpi.target} {kpi.unit}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Risks summary */}
        {risks.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 mb-4">Resumen de Riesgos ESG</h3>
            <div className="space-y-2">
              {[...risks]
                .sort((a, b) => b.probability * b.impact - a.probability * a.impact)
                .slice(0, 5)
                .map((risk, i) => {
                  const score = risk.probability * risk.impact;
                  const lvl   = score >= 15 ? { label: "Crítico", bg: "bg-red-100 text-red-700" }
                              : score >= 10 ? { label: "Alto",    bg: "bg-orange-100 text-orange-700" }
                              : score >= 5  ? { label: "Medio",   bg: "bg-yellow-100 text-yellow-700" }
                              :               { label: "Bajo",    bg: "bg-green-100 text-green-700" };
                  return (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold shrink-0 ${lvl.bg}`}>{lvl.label}</span>
                      <p className="text-sm text-slate-700 flex-1 truncate">{risk.name}</p>
                      <span className="text-xs font-bold text-slate-500">{score}/25</span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 pb-4">
          <p>Reporte generado por AUDITOR ESG Platform</p>
          <p className="mt-1">{today} · GRI 2021 · ISO 14001 · ISO 9001 · CSRD · ISO 31000</p>
        </div>
      </div>
    </Shell>
  );
}
