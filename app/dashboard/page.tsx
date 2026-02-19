"use client";
import Shell from "@/components/Shell";
import { BarChart3, Wind, ClipboardList, ShieldCheck, ArrowRight, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";

// ── Score constants (must match diagnostico page) ─────────────────────────────
const SECTIONS_META = [
  { id: "ambiental",  label: "Ambiental",  norm: "ISO 14001", color: "bg-green-500",  ids: ["a1","a2","a3","a4","a5","a6"] },
  { id: "social",     label: "Social",     norm: "GRI 400",   color: "bg-blue-500",   ids: ["s1","s2","s3","s4","s5"] },
  { id: "gobernanza", label: "Gobernanza", norm: "GRI 200",   color: "bg-purple-500", ids: ["g1","g2","g3","g4","g5"] },
  { id: "calidad",    label: "Calidad",    norm: "ISO 9001",  color: "bg-orange-500", ids: ["q1","q2","q3","q4"] },
];
const SCORE_MAP: Record<string, number> = { si: 2, parcial: 1, no: 0 };

type DiagnosticoData = { answers: Record<string, string>; step: number } | null;
type CarbonData      = { fields: Record<string, string>; calculated: boolean } | null;

function parseLS<T>(key: string): T | null {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; } catch { return null; }
}

export default function DashboardPage() {
  const [company,    setCompany]    = useState("");
  const [diagData,   setDiagData]   = useState<DiagnosticoData>(null);
  const [carbonData, setCarbonData] = useState<CarbonData>(null);
  const [hydrated,   setHydrated]   = useState(false);

  useEffect(() => {
    setCompany(localStorage.getItem("auditor_company") || "");
    setDiagData(parseLS<DiagnosticoData>("auditor_diagnostico"));
    setCarbonData(parseLS<CarbonData>("auditor_carbon"));
    setHydrated(true);
  }, []);

  // ── Compute ESG scores from saved answers ─────────────────────────────────
  const { globalPct, sectionPcts, totalAnswered, totalQuestions } = useMemo(() => {
    if (!diagData?.answers) return { globalPct: 0, sectionPcts: {} as Record<string, number>, totalAnswered: 0, totalQuestions: 20 };
    const answers = diagData.answers;
    let totalPts = 0, totalMax = 0;
    const pcts: Record<string, number> = {};
    SECTIONS_META.forEach(sec => {
      const maxPts = sec.ids.length * 2;
      const pts    = sec.ids.reduce((acc, id) => acc + (SCORE_MAP[answers[id] ?? ""] ?? 0), 0);
      pcts[sec.id] = Math.round((pts / maxPts) * 100);
      totalPts += pts; totalMax += maxPts;
    });
    return {
      globalPct:      totalMax > 0 ? Math.round((totalPts / totalMax) * 100) : 0,
      sectionPcts:    pcts,
      totalAnswered:  Object.keys(answers).length,
      totalQuestions: 20,
    };
  }, [diagData]);

  // ── Carbon total ──────────────────────────────────────────────────────────
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

  const diagCompleted = diagData?.step === 1;
  const diagStarted   = totalAnswered > 0;
  const hasDiag       = diagCompleted || diagStarted;
  const hasCarbon     = carbonTotal !== null;
  const hasData       = hasDiag || hasCarbon;

  const levelLabel = globalPct >= 75 ? "Avanzado" : globalPct >= 50 ? "En desarrollo" : "Inicial";
  const levelColor = globalPct >= 75 ? "text-green-500" : globalPct >= 50 ? "text-yellow-500" : "text-red-500";

  if (!hydrated) return null;

  return (
    <Shell>
      <div className="p-4 sm:p-8 max-w-4xl space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
            Bienvenido{company ? `, ${company}` : ""}
          </h1>
          <p className="text-slate-500 text-sm mt-1">Panel de gestión ESG</p>
        </div>

        {/* ── Score panel — shows real data or empty state ── */}
        {hasData ? (
          <div className="space-y-4">
            {/* Global score card */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                {/* Score circle */}
                <div className="text-center sm:text-left">
                  <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Score ESG Global</p>
                  <div className={`text-6xl font-extrabold ${hasDiag ? levelColor : "text-slate-600"}`}>
                    {hasDiag ? `${globalPct}%` : "—"}
                  </div>
                  {hasDiag && (
                    <p className={`text-sm font-semibold mt-1 ${levelColor}`}>{levelLabel}</p>
                  )}
                </div>

                {/* Mini stats */}
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <StatMini
                    label="Preguntas respondidas"
                    value={hasDiag ? `${totalAnswered}/${totalQuestions}` : "—"}
                    color="text-slate-200"
                  />
                  <StatMini
                    label="Huella de carbono"
                    value={hasCarbon ? `${carbonTotal!.toFixed(1)} tCO₂e` : "—"}
                    color="text-green-400"
                  />
                  <StatMini
                    label="Diagnóstico"
                    value={diagCompleted ? "Completado" : diagStarted ? "En progreso" : "Pendiente"}
                    color={diagCompleted ? "text-green-400" : diagStarted ? "text-yellow-400" : "text-slate-500"}
                  />
                </div>
              </div>

              {/* Progress bar */}
              {hasDiag && (
                <div className="mt-5">
                  <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                    <span>Progreso diagnóstico</span>
                    <span>{Math.round((totalAnswered / totalQuestions) * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${(totalAnswered / totalQuestions) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Section scores — only if diagnostic has answers */}
            {hasDiag && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {SECTIONS_META.map(sec => (
                  <div key={sec.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                    <p className="text-xs font-semibold text-slate-600">{sec.label}</p>
                    <p className="text-xs text-slate-400 mb-2">{sec.norm}</p>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1.5">
                      <div
                        className={`h-full ${sec.color} rounded-full transition-all`}
                        style={{ width: `${sectionPcts[sec.id] ?? 0}%` }}
                      />
                    </div>
                    <p className="text-right text-sm font-bold text-slate-700">
                      {sectionPcts[sec.id] !== undefined ? `${sectionPcts[sec.id]}%` : "—"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Empty state */
          <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm text-center">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="text-green-500" size={28} />
            </div>
            <h2 className="text-slate-800 font-bold text-base mb-2">Tu Score ESG aparecerá aquí</h2>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">
              Completa el diagnóstico ESG y registra tus datos en los módulos
              para visualizar tus indicadores y estado de certificación.
            </p>
          </div>
        )}

        {/* ── Módulos ── */}
        <div>
          <h2 className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3">
            Módulos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                href: "/carbon", icon: Wind, label: "Carbon Box",
                desc: "Huella de carbono Scope 1, 2 y 3.",
                done: hasCarbon, color: "bg-green-50 border-green-100", iconColor: "text-green-500",
                cta: hasCarbon ? "Ver resultados" : "Iniciar cálculo",
              },
              {
                href: "/diagnostico", icon: ClipboardList, label: "Diagnóstico ESG",
                desc: "Batería de indicadores ESG.",
                done: diagCompleted, color: "bg-blue-50 border-blue-100", iconColor: "text-blue-500",
                cta: diagCompleted ? "Ver resultados" : diagStarted ? "Continuar" : "Comenzar",
              },
              {
                href: "/documentos", icon: BarChart3, label: "Control Documental",
                desc: "Documentos ISO 14001 e ISO 9001.",
                done: false, color: "bg-purple-50 border-purple-100", iconColor: "text-purple-500",
                cta: "Gestionar",
              },
              {
                href: "/auditoria", icon: ShieldCheck, label: "Auditoría",
                desc: "Hallazgos y no conformidades.",
                done: false, color: "bg-orange-50 border-orange-100", iconColor: "text-orange-500",
                cta: "Ver auditoría",
              },
            ].map(({ href, icon: Icon, label, desc, done, color, iconColor, cta }) => (
              <div key={href} className={`${color} border rounded-2xl p-5 flex flex-col gap-3`}>
                <div className="flex items-start gap-3">
                  <Icon className={`${iconColor} shrink-0 mt-0.5`} size={20} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-800 text-sm">{label}</p>
                      {done
                        ? <CheckCircle size={13} className="text-green-500 shrink-0" />
                        : <Clock size={13} className="text-slate-300 shrink-0" />
                      }
                    </div>
                    <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
                <Link
                  href={href}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {cta} <ArrowRight size={12} />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Standards */}
        <div className="flex flex-wrap gap-2 pb-4">
          {["ISO 14001", "ISO 9001", "GRI 2021", "GHG Protocol", "CSRD", "NOM-035"].map(s => (
            <span key={s} className="text-xs text-slate-400 border border-slate-200 rounded-full px-3 py-1 bg-white">
              {s}
            </span>
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
