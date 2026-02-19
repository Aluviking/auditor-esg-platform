"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import Shell from "@/components/Shell";
import { ClipboardList, ChevronRight, CheckCircle, AlertTriangle, XCircle, FileDown, RotateCcw } from "lucide-react";

// ── Batería de preguntas ESG ──────────────────────────────────────────────────
const SECTIONS = [
  {
    id: "ambiental",
    label: "Ambiental",
    norm: "ISO 14001",
    color: "bg-green-500",
    barColor: "bg-green-500",
    questions: [
      { id: "a1", text: "¿Tiene identificados sus aspectos e impactos ambientales significativos?" },
      { id: "a2", text: "¿Cuenta con política ambiental documentada y comunicada?" },
      { id: "a3", text: "¿Mide y registra sus emisiones de GEI (Scope 1 y 2)?" },
      { id: "a4", text: "¿Tiene objetivos de reducción de huella de carbono con metas anuales?" },
      { id: "a5", text: "¿Gestiona y documenta sus residuos peligrosos y no peligrosos?" },
      { id: "a6", text: "¿Realiza auditorías internas ambientales al menos 1 vez al año?" },
    ],
  },
  {
    id: "social",
    label: "Social",
    norm: "GRI 400",
    color: "bg-blue-500",
    barColor: "bg-blue-500",
    questions: [
      { id: "s1", text: "¿Cuenta con política de diversidad, equidad e inclusión?" },
      { id: "s2", text: "¿Realiza diagnóstico de riesgos psicosociales (NOM-035)?" },
      { id: "s3", text: "¿Tiene programa de seguridad y salud en el trabajo documentado?" },
      { id: "s4", text: "¿Mide satisfacción de empleados y tasa de rotación?" },
      { id: "s5", text: "¿Cuenta con canal de denuncias anónimas (ética)?" },
    ],
  },
  {
    id: "gobernanza",
    label: "Gobernanza",
    norm: "GRI 200",
    color: "bg-purple-500",
    barColor: "bg-purple-500",
    questions: [
      { id: "g1", text: "¿Tiene Código de Ética aprobado por dirección y publicado?" },
      { id: "g2", text: "¿Cuenta con políticas anti-corrupción y anti-soborno?" },
      { id: "g3", text: "¿Realiza debida diligencia a proveedores en criterios ESG?" },
      { id: "g4", text: "¿Publica reportes de sostenibilidad alineados a GRI o CSRD?" },
      { id: "g5", text: "¿La alta dirección tiene responsabilidades formales en ESG?" },
    ],
  },
  {
    id: "calidad",
    label: "Calidad",
    norm: "ISO 9001",
    color: "bg-orange-500",
    barColor: "bg-orange-500",
    questions: [
      { id: "q1", text: "¿Tiene sistema de gestión de calidad documentado?" },
      { id: "q2", text: "¿Controla versiones y aprobaciones de documentos y registros?" },
      { id: "q3", text: "¿Gestiona no conformidades con planes de acción correctiva?" },
      { id: "q4", text: "¿Realiza revisiones por la dirección periódicas?" },
    ],
  },
];

const TOTAL_QUESTIONS = SECTIONS.flatMap(s => s.questions).length;
const SCORE_MAP: Record<string, number> = { si: 2, parcial: 1, no: 0 };

type Answer = "si" | "no" | "parcial";
type Answers = Record<string, Answer>;

const STORAGE_KEY = "auditor_diagnostico";

function loadSaved(): { answers: Answers; step: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { answers: {}, step: 0 };
}

export default function DiagnosticoPage() {
  const [answers,       setAnswers]       = useState<Answers>({});
  const [step,          setStep]          = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const [hydrated,      setHydrated]      = useState(false);

  // ── Load from localStorage once on mount ─────────────────────────────────
  useEffect(() => {
    const saved = loadSaved();
    setAnswers(saved.answers);
    setStep(saved.step);
    setHydrated(true);
  }, []);

  // ── Persist to localStorage on every change ───────────────────────────────
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, step }));
  }, [answers, step, hydrated]);

  // ── Answer handler — stable reference, no unnecessary re-renders ──────────
  const answer = useCallback((id: string, val: Answer) => {
    setAnswers(prev => ({ ...prev, [id]: val }));
  }, []);

  // ── Scoring — only recalculates when answers change ───────────────────────
  const sectionScores = useMemo(() =>
    SECTIONS.map(sec => {
      const maxPts = sec.questions.length * 2;
      const pts    = sec.questions.reduce(
        (acc, q) => acc + (SCORE_MAP[answers[q.id] ?? ""] ?? 0), 0
      );
      return { ...sec, pts, maxPts, pct: Math.round((pts / maxPts) * 100) };
    }),
  [answers]);

  const totalPts    = useMemo(() => sectionScores.reduce((a, s) => a + s.pts, 0),    [sectionScores]);
  const totalMaxPts = useMemo(() => sectionScores.reduce((a, s) => a + s.maxPts, 0), [sectionScores]);
  const globalPct   = totalMaxPts > 0 ? Math.round((totalPts / totalMaxPts) * 100) : 0;
  const totalAnswered = Object.keys(answers).length;

  const level      = globalPct >= 75 ? "Avanzado" : globalPct >= 50 ? "En desarrollo" : "Inicial";
  const levelColor = globalPct >= 75 ? "text-green-400" : globalPct >= 50 ? "text-yellow-400" : "text-red-400";

  // ── Sorted roadmap — stable sort (no mutation) ────────────────────────────
  const roadmap = useMemo(
    () => [...sectionScores].sort((a, b) => a.pct - b.pct),
    [sectionScores]
  );

  function handleReset() {
    if (!window.confirm("¿Seguro que deseas borrar todas las respuestas?")) return;
    localStorage.removeItem(STORAGE_KEY);
    setAnswers({});
    setStep(0);
    setActiveSection(0);
  }

  const currentSection = SECTIONS[activeSection];

  if (!hydrated) return null; // avoid hydration flash

  return (
    <Shell>
      <div className="p-8 space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <ClipboardList className="text-green-500" size={26} /> Diagnóstico ESG
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Batería de indicadores · ISO 14001 · GRI 2021 · ISO 9001 · NOM-035
            </p>
          </div>
          <div className="flex items-center gap-2">
            {step === 0 && totalAnswered > 0 && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
              >
                <RotateCcw size={14} /> Reiniciar
              </button>
            )}
            {step === 1 && (
              <button className="flex items-center gap-2 bg-green-600 hover:bg-green-500 active:scale-95 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all">
                <FileDown size={16} /> Descargar reporte
              </button>
            )}
          </div>
        </div>

        {step === 0 ? (
          <>
            {/* Progress */}
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>{totalAnswered} de {TOTAL_QUESTIONS} preguntas respondidas</span>
                <span className="font-semibold">{Math.round((totalAnswered / TOTAL_QUESTIONS) * 100)}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-200"
                  style={{ width: `${(totalAnswered / TOTAL_QUESTIONS) * 100}%` }}
                />
              </div>
            </div>

            {/* Section tabs */}
            <div className="flex gap-2 flex-wrap">
              {SECTIONS.map((s, i) => {
                const answered = s.questions.filter(q => answers[q.id]).length;
                const done     = answered === s.questions.length;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(i)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                      activeSection === i
                        ? "bg-slate-800 text-white"
                        : done
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {done && <CheckCircle size={11} />}
                    {s.label}
                    <span className="opacity-60">· {s.norm}</span>
                  </button>
                );
              })}
            </div>

            {/* Questions card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className={`${currentSection.color} px-6 py-3 flex items-center justify-between`}>
                <h2 className="text-white font-bold text-sm">{currentSection.label} — {currentSection.norm}</h2>
                <span className="text-white/70 text-xs">
                  {currentSection.questions.filter(q => answers[q.id]).length} / {currentSection.questions.length}
                </span>
              </div>
              <div className="divide-y divide-slate-50">
                {currentSection.questions.map((q, qi) => (
                  <QuestionRow
                    key={q.id}
                    qi={qi}
                    q={q}
                    selected={answers[q.id]}
                    onAnswer={answer}
                  />
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                disabled={activeSection === 0}
                onClick={() => setActiveSection(p => p - 1)}
                className="text-sm text-slate-500 hover:text-slate-800 disabled:opacity-30 transition-colors px-3 py-2"
              >
                ← Anterior
              </button>
              {activeSection < SECTIONS.length - 1 ? (
                <button
                  onClick={() => setActiveSection(p => p + 1)}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
                >
                  Siguiente sección <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 active:scale-95 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
                >
                  Ver resultados <ChevronRight size={16} />
                </button>
              )}
            </div>
          </>
        ) : (
          /* ── RESULTADOS ── */
          <div className="space-y-5">
            {/* Score global */}
            <div className="bg-slate-900 text-white rounded-2xl p-8 text-center">
              <p className="text-slate-400 text-sm mb-2 uppercase tracking-widest text-xs">Score ESG Global</p>
              <div className={`text-7xl font-extrabold ${levelColor}`}>{globalPct}%</div>
              <p className={`text-xl font-bold mt-1 ${levelColor}`}>{level}</p>
              <p className="text-slate-500 text-sm mt-3">
                {totalPts} de {totalMaxPts} puntos · {totalAnswered} preguntas respondidas
              </p>
            </div>

            {/* Por sección */}
            <div className="grid grid-cols-2 gap-4">
              {sectionScores.map(sec => {
                const Icon      = sec.pct >= 75 ? CheckCircle : sec.pct >= 50 ? AlertTriangle : XCircle;
                const iconColor = sec.pct >= 75 ? "text-green-500" : sec.pct >= 50 ? "text-yellow-500" : "text-red-500";
                return (
                  <div key={sec.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-bold text-slate-800">{sec.label}</p>
                        <p className="text-xs text-slate-400">{sec.norm}</p>
                      </div>
                      <Icon className={iconColor} size={26} />
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                      <div
                        className={`h-full ${sec.barColor} rounded-full transition-all`}
                        style={{ width: `${sec.pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">{sec.pts}/{sec.maxPts} pts</span>
                      <span className="text-sm font-bold text-slate-700">{sec.pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hoja de ruta */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4">Hoja de Ruta Recomendada</h3>
              <div className="space-y-2">
                {roadmap.map((sec, i) => (
                  <div key={sec.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-700">
                        {sec.pct < 50 ? "Prioridad alta" : sec.pct < 75 ? "Prioridad media" : "Mantener"} — {sec.label}
                      </p>
                      <p className="text-xs text-slate-400">{sec.norm} · Score actual: {sec.pct}%</p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                      sec.pct >= 75 ? "bg-green-100 text-green-700" :
                      sec.pct >= 50 ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"}`}>
                      {sec.pct >= 75 ? "Avanzado" : sec.pct >= 50 ? "En proceso" : "Inicial"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep(0)}
                className="text-sm text-slate-500 hover:text-slate-800 transition-colors underline"
              >
                ← Volver al diagnóstico
              </button>
              <span className="text-xs text-slate-400">
                Tus respuestas están guardadas automáticamente
              </span>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}

// ── QuestionRow — isolated component to avoid full re-render on each click ───
const QuestionRow = ({
  qi, q, selected, onAnswer,
}: {
  qi: number;
  q: { id: string; text: string };
  selected: Answer | undefined;
  onAnswer: (id: string, val: Answer) => void;
}) => (
  <div className="px-6 py-4">
    <p className="text-slate-700 text-sm mb-3 leading-relaxed">
      <span className="text-slate-300 mr-2 select-none">{qi + 1}.</span>
      {q.text}
    </p>
    <div className="flex gap-2">
      {(["si", "parcial", "no"] as const).map(opt => (
        <button
          key={opt}
          onClick={() => onAnswer(q.id, opt)}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all active:scale-95 ${
            selected === opt
              ? opt === "si"      ? "bg-green-500  text-white border-green-500"
              : opt === "parcial" ? "bg-yellow-400 text-white border-yellow-400"
                                  : "bg-red-400   text-white border-red-400"
              : "border-slate-200 text-slate-500 hover:border-slate-400 bg-white"
          }`}
        >
          {opt === "si" ? "Sí" : opt === "parcial" ? "Parcial" : "No"}
        </button>
      ))}
    </div>
  </div>
);
