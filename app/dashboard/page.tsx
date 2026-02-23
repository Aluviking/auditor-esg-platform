"use client";
import Shell from "@/components/Shell";
import {
  BarChart3, Wind, ClipboardList, ShieldCheck, ArrowRight,
  CheckCircle, Clock, Target, TrendingUp, AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell,
} from "recharts";

/* ── Constants ──────────────────────────────────────────────────────────── */
const SECTIONS_META = [
  { id: "ambiental",  label: "Ambiental",  norm: "ISO 14001", color: "bg-green-500",  hex: "#22c55e", ids: ["a1","a2","a3","a4","a5","a6"] },
  { id: "social",     label: "Social",     norm: "GRI 400",   color: "bg-blue-500",   hex: "#3b82f6", ids: ["s1","s2","s3","s4","s5"] },
  { id: "gobernanza", label: "Gobernanza", norm: "GRI 200",   color: "bg-purple-500", hex: "#a855f7", ids: ["g1","g2","g3","g4","g5"] },
  { id: "calidad",    label: "Calidad",    norm: "ISO 9001",  color: "bg-orange-500", hex: "#f97316", ids: ["q1","q2","q3","q4"] },
];
const SCORE_MAP: Record<string, number> = { si: 2, parcial: 1, no: 0 };

type DiagnosticoData = { answers: Record<string, string>; step: number } | null;
type CarbonData      = { fields: Record<string, string>; calculated: boolean } | null;
type Kpi             = { id: string; name: string; unit: string; current: number; target: number; category: string };
type PlanItem        = { id: string; title: string; responsible: string; dueDate: string; progress: number; category: string };

function parseLS<T>(key: string): T | null {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; } catch { return null; }
}

/* ── Custom Tooltip for BarChart ──────────────────────────────────────── */
function KpiTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-bold text-slate-700 mb-1 truncate max-w-[140px]">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="text-slate-500">{p.name}: <span className="font-semibold text-slate-800">{p.value}</span></p>
      ))}
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const [company,    setCompany]    = useState("");
  const [diagData,   setDiagData]   = useState<DiagnosticoData>(null);
  const [carbonData, setCarbonData] = useState<CarbonData>(null);
  const [kpis,       setKpis]       = useState<Kpi[]>([]);
  const [plan,       setPlan]       = useState<PlanItem[]>([]);
  const [hydrated,   setHydrated]   = useState(false);

  useEffect(() => {
    setCompany(localStorage.getItem("auditor_company") || "");
    setDiagData(parseLS<DiagnosticoData>("auditor_diagnostico"));
    setCarbonData(parseLS<CarbonData>("auditor_carbon"));
    setKpis(parseLS<Kpi[]>("auditor_kpis") || []);
    setPlan(parseLS<PlanItem[]>("auditor_plan") || []);
    setHydrated(true);
  }, []);

  /* ── ESG scores ─────────────────────────────────────────────────────── */
  const { globalPct, sectionPcts, totalAnswered, totalQuestions, radarData } = useMemo(() => {
    if (!diagData?.answers) return {
      globalPct: 0, sectionPcts: {} as Record<string, number>,
      totalAnswered: 0, totalQuestions: 20, radarData: [],
    };
    const answers = diagData.answers;
    let totalPts = 0, totalMax = 0;
    const pcts: Record<string, number> = {};
    const radar: { dimension: string; score: number; fullMark: number }[] = [];
    SECTIONS_META.forEach(sec => {
      const maxPts = sec.ids.length * 2;
      const pts    = sec.ids.reduce((acc, id) => acc + (SCORE_MAP[answers[id] ?? ""] ?? 0), 0);
      pcts[sec.id] = Math.round((pts / maxPts) * 100);
      radar.push({ dimension: sec.label, score: pcts[sec.id], fullMark: 100 });
      totalPts += pts; totalMax += maxPts;
    });
    return {
      globalPct:      totalMax > 0 ? Math.round((totalPts / totalMax) * 100) : 0,
      sectionPcts:    pcts,
      totalAnswered:  Object.keys(answers).length,
      totalQuestions: 20,
      radarData:      radar,
    };
  }, [diagData]);

  /* ── Carbon total ───────────────────────────────────────────────────── */
  const carbonTotal = useMemo(() => {
    if (!carbonData?.calculated || !carbonData.fields) return null;
    const f = carbonData.fields;
    const n = (v: string) => parseFloat(v) || 0;
    return (
      n(f.gasolina) * 2.31 + n(f.diesel) * 2.68 + n(f.gas_natural) * 2.02 +
      n(f.electricidad) * 0.45 +
      n(f.vuelos_corto) * 0.255 + n(f.vuelos_largo) * 0.195 + n(f.residuos) * 0.52
    );
  }, [carbonData]);

  /* ── KPI bar data ───────────────────────────────────────────────────── */
  const kpiBarData = useMemo(() =>
    kpis.slice(0, 5).map(k => ({
      name: k.name.length > 18 ? k.name.slice(0, 18) + "…" : k.name,
      fullName: k.name,
      Actual: k.current,
      Meta:   k.target,
      unit:   k.unit,
      onTrack: k.current <= k.target,
    })), [kpis]);

  /* ── Plan summary ───────────────────────────────────────────────────── */
  const planSummary = useMemo(() => {
    if (!plan.length) return null;
    const avg = Math.round(plan.reduce((a, p) => a + p.progress, 0) / plan.length);
    const done = plan.filter(p => p.progress === 100).length;
    const overdue = plan.filter(p => p.progress < 100 && new Date(p.dueDate) < new Date()).length;
    return { avg, done, overdue, total: plan.length };
  }, [plan]);

  const diagCompleted = diagData?.step === 1;
  const diagStarted   = totalAnswered > 0;
  const hasDiag       = diagCompleted || diagStarted;
  const hasCarbon     = carbonTotal !== null;
  const hasKpis       = kpis.length > 0;
  const hasPlan       = plan.length > 0;

  const levelLabel = globalPct >= 75 ? "Avanzado" : globalPct >= 50 ? "En desarrollo" : "Inicial";
  const levelColor = globalPct >= 75 ? "text-green-500" : globalPct >= 50 ? "text-yellow-500" : "text-red-500";

  if (!hydrated) return null;

  return (
    <Shell>
      <div className="p-4 sm:p-8 max-w-5xl space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
            Bienvenido{company ? `, ${company}` : ""}
          </h1>
          <p className="text-slate-500 text-sm mt-1">Panel de gestión ESG</p>
        </div>

        {/* ── Score hero ───────────────────────────────────────────────── */}
        {hasDiag ? (
          <div className="space-y-4">
            {/* Score card */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="text-center sm:text-left shrink-0">
                  <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Score ESG Global</p>
                  <div className={`text-6xl font-extrabold ${levelColor}`}>{globalPct}%</div>
                  <p className={`text-sm font-semibold mt-1 ${levelColor}`}>{levelLabel}</p>
                </div>
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <StatMini label="Preguntas respondidas" value={`${totalAnswered}/${totalQuestions}`} color="text-slate-200" />
                  <StatMini label="Huella de carbono"     value={hasCarbon ? `${carbonTotal!.toFixed(1)} tCO₂e` : "—"} color="text-green-400" />
                  <StatMini label="Diagnóstico"           value={diagCompleted ? "Completado" : "En progreso"} color={diagCompleted ? "text-green-400" : "text-yellow-400"} />
                </div>
              </div>
              <div className="mt-5">
                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                  <span>Progreso diagnóstico</span>
                  <span>{Math.round((totalAnswered / totalQuestions) * 100)}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${(totalAnswered / totalQuestions) * 100}%` }} />
                </div>
              </div>
            </div>

            {/* Radar + Section scores */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Radar chart */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <p className="text-sm font-bold text-slate-700 mb-3">Dimensiones ESG</p>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: "#64748b" }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Score" dataKey="score" stroke="#22c55e" fill="#22c55e" fillOpacity={0.25} strokeWidth={2} dot={{ r: 3, fill: "#22c55e" }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Section bars */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <p className="text-sm font-bold text-slate-700 mb-4">Puntaje por dimensión</p>
                <div className="space-y-3">
                  {SECTIONS_META.map(sec => (
                    <div key={sec.id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-600">{sec.label}</span>
                        <span className="text-slate-400">{sec.norm} · <span className="font-bold text-slate-700">{sectionPcts[sec.id] ?? 0}%</span></span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${sec.color} rounded-full transition-all`} style={{ width: `${sectionPcts[sec.id] ?? 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm text-center">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="text-green-500" size={28} />
            </div>
            <h2 className="text-slate-800 font-bold text-base mb-2">Tu Score ESG aparecerá aquí</h2>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">
              Completa el diagnóstico ESG y registra tus datos en los módulos para visualizar tus indicadores.
            </p>
            <Link href="/diagnostico" className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-green-600 hover:text-green-500">
              Iniciar diagnóstico <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* ── KPIs chart ───────────────────────────────────────────────── */}
        {hasKpis && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <TrendingUp size={16} className="text-blue-500" /> KPIs vs Metas
              </p>
              <Link href="/kpis" className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1">
                Ver todos <ArrowRight size={12} />
              </Link>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kpiBarData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<KpiTooltip />} />
                  <Bar dataKey="Actual" radius={[4, 4, 0, 0]} maxBarSize={28}>
                    {kpiBarData.map((entry, i) => (
                      <Cell key={i} fill={entry.onTrack ? "#22c55e" : "#f97316"} />
                    ))}
                  </Bar>
                  <Bar dataKey="Meta" fill="#e2e8f0" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 justify-end">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-green-500 inline-block" /> Actual (en meta)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-orange-400 inline-block" /> Actual (fuera de meta)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-slate-200 inline-block" /> Meta</span>
            </div>
          </div>
        )}

        {/* ── Plan de Acción summary ────────────────────────────────────── */}
        {hasPlan && planSummary && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Target size={16} className="text-purple-500" /> Plan de Acción
              </p>
              <Link href="/plan-accion" className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1">
                Ver plan <ArrowRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-3 bg-slate-50 rounded-xl">
                <p className="text-2xl font-extrabold text-slate-800">{planSummary.avg}%</p>
                <p className="text-xs text-slate-400 mt-0.5">Avance promedio</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-xl">
                <p className="text-2xl font-extrabold text-green-600">{planSummary.done}</p>
                <p className="text-xs text-slate-400 mt-0.5">Completadas</p>
              </div>
              <div className={`text-center p-3 rounded-xl ${planSummary.overdue > 0 ? "bg-red-50" : "bg-slate-50"}`}>
                <p className={`text-2xl font-extrabold ${planSummary.overdue > 0 ? "text-red-500" : "text-slate-400"}`}>{planSummary.overdue}</p>
                <p className="text-xs text-slate-400 mt-0.5">Vencidas</p>
              </div>
            </div>
            <div className="space-y-2">
              {plan.slice(0, 3).map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{item.title}</p>
                    <div className="h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                      <div className={`h-full rounded-full ${item.progress === 100 ? "bg-green-500" : "bg-blue-400"}`} style={{ width: `${item.progress}%` }} />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-500 shrink-0">{item.progress}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Alerts: vencimientos / riesgos ───────────────────────────── */}
        {(hasPlan && planSummary && planSummary.overdue > 0) && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={18} />
            <div>
              <p className="text-red-700 text-sm font-semibold">
                {planSummary.overdue} acción{planSummary.overdue > 1 ? "es" : ""} vencida{planSummary.overdue > 1 ? "s" : ""}
              </p>
              <p className="text-red-400 text-xs mt-0.5">Revisa tu plan de acción y actualiza el estado de las tareas pendientes.</p>
            </div>
            <Link href="/plan-accion" className="ml-auto text-xs font-semibold text-red-500 hover:text-red-700 whitespace-nowrap">
              Ver plan →
            </Link>
          </div>
        )}

        {/* ── Módulos rápidos ───────────────────────────────────────────── */}
        <div>
          <h2 className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3">Accesos rápidos</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: "/carbon",      icon: Wind,         label: "Carbon Box",    done: hasCarbon,    color: "bg-green-50 border-green-100",   iconColor: "text-green-500"  },
              { href: "/diagnostico", icon: ClipboardList,label: "Diagnóstico",   done: diagCompleted,color: "bg-blue-50 border-blue-100",     iconColor: "text-blue-500"   },
              { href: "/auditoria",   icon: ShieldCheck,  label: "Auditoría",     done: false,        color: "bg-orange-50 border-orange-100", iconColor: "text-orange-500" },
              { href: "/riesgos",     icon: BarChart3,    label: "Riesgos",       done: false,        color: "bg-purple-50 border-purple-100", iconColor: "text-purple-500" },
            ].map(({ href, icon: Icon, label, done, color, iconColor }) => (
              <Link key={href} href={href}
                className={`${color} border rounded-2xl p-4 flex flex-col gap-2 hover:shadow-md transition-shadow`}>
                <div className="flex items-center justify-between">
                  <Icon className={`${iconColor}`} size={18} />
                  {done
                    ? <CheckCircle size={12} className="text-green-500" />
                    : <Clock size={12} className="text-slate-300" />
                  }
                </div>
                <p className="font-bold text-slate-800 text-xs">{label}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Standards */}
        <div className="flex flex-wrap gap-2 pb-4">
          {["ISO 14001", "ISO 9001", "GRI 2021", "GHG Protocol", "CSRD", "NOM-035"].map(s => (
            <span key={s} className="text-xs text-slate-400 border border-slate-200 rounded-full px-3 py-1 bg-white">{s}</span>
          ))}
        </div>
      </div>
    </Shell>
  );
}

function StatMini({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white/10 rounded-xl p-3">
      <p className={`text-sm font-bold ${color}`}>{value}</p>
      <p className="text-slate-400 text-xs mt-0.5 leading-tight">{label}</p>
    </div>
  );
}
