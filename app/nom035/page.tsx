"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import Shell from "@/components/Shell";
import { Brain, CheckCircle, AlertTriangle, XCircle, ChevronRight, ChevronLeft, RotateCcw } from "lucide-react";

/* ────────────────────────────────────────────────────────────────
   NOM-035-STPS-2018 · Batería de identificación y análisis de
   factores de riesgo psicosocial (Guía de referencia II — versión
   para centros de trabajo con más de 50 trabajadores)
──────────────────────────────────────────────────────────────── */

type Respuesta = 0 | 1 | 2 | 3 | 4; // Siempre→4, Casi siempre→3, Algunas veces→2, Casi nunca→1, Nunca→0
type RespMap  = Record<string, Respuesta>;

interface Pregunta {
  id: string;
  texto: string;
  inversa?: boolean; // ítem positivo → puntaje invertido
}

interface Dominio {
  id: string;
  label: string;
  categoria: string;
  preguntas: Pregunta[];
}

const OPCIONES: { label: string; value: Respuesta }[] = [
  { label: "Siempre",        value: 4 },
  { label: "Casi siempre",   value: 3 },
  { label: "Algunas veces",  value: 2 },
  { label: "Casi nunca",     value: 1 },
  { label: "Nunca",          value: 0 },
];

const DOMINIOS: Dominio[] = [
  {
    id: "CE",
    label: "Condiciones en el ambiente de trabajo",
    categoria: "Condiciones del ambiente",
    preguntas: [
      { id: "CE1", texto: "El lugar donde trabajo es peligroso" },
      { id: "CE2", texto: "En mi trabajo estoy expuesto a accidentes" },
      { id: "CE3", texto: "Mi trabajo me exige estar en contacto con sustancias peligrosas" },
      { id: "CE4", texto: "En mi trabajo hay muido, temperatura o iluminación que afecta mi desempeño" },
    ],
  },
  {
    id: "CO",
    label: "Carga de trabajo",
    categoria: "Factores propios de la actividad",
    preguntas: [
      { id: "CO1", texto: "Mi trabajo me exige hacer mucho esfuerzo físico" },
      { id: "CO2", texto: "Me preocupa sufrir un accidente en mi trabajo" },
      { id: "CO3", texto: "Considero que las actividades que realizo son peligrosas" },
      { id: "CO4", texto: "Por la cantidad de trabajo que tengo debo quedarme tiempo extra" },
      { id: "CO5", texto: "Por mis responsabilidades en el trabajo debo llevar trabajo a casa" },
      { id: "CO6", texto: "Debo atender asuntos de trabajo cuando estoy de descanso" },
      { id: "CO7", texto: "Cuando estoy en casa sigo pensando en el trabajo" },
      { id: "CO8", texto: "Pienso que el trabajo que tengo es pesado" },
    ],
  },
  {
    id: "FC",
    label: "Falta de control sobre el trabajo",
    categoria: "Factores propios de la actividad",
    preguntas: [
      { id: "FC1", texto: "Mi trabajo exige que esté muy concentrado" },
      { id: "FC2", texto: "Mi trabajo requiere que memorice mucha información" },
      { id: "FC3", texto: "En mi trabajo tengo que tomar decisiones difíciles muy rápido" },
      { id: "FC4", texto: "Mi trabajo exige que atienda varios asuntos al mismo tiempo" },
      { id: "FC5", texto: "En mi trabajo soy responsable de cosas de mucho valor" },
      { id: "FC6", texto: "En mi trabajo me da poca libertad para decidir cómo hacerlo", inversa: true },
    ],
  },
  {
    id: "OT",
    label: "Organización del tiempo de trabajo",
    categoria: "Organización del tiempo de trabajo",
    preguntas: [
      { id: "OT1", texto: "Mi trabajo me exige laborar en días de descanso, festivos o fines de semana" },
      { id: "OT2", texto: "Considero que el tiempo que trabajo es mayor al que me pagan" },
      { id: "OT3", texto: "Mi horario de trabajo no me permite tener tiempo para mi familia" },
      { id: "OT4", texto: "Debo trabajar muy rápido" },
    ],
  },
  {
    id: "RL",
    label: "Relaciones en el trabajo",
    categoria: "Liderazgo y relaciones",
    preguntas: [
      { id: "RL1", texto: "Mi jefe tiene comportamientos que afectan mi bienestar" },
      { id: "RL2", texto: "Me insultan, humillan, calumnian, difaman, ridiculizan o discriminan" },
      { id: "RL3", texto: "Siento que mis compañeros me excluyen" },
      { id: "RL4", texto: "Tengo problemas con mis compañeros" },
      { id: "RL5", texto: "En el trabajo me asignan tareas que van en contra de mis principios éticos o legales" },
    ],
  },
  {
    id: "LS",
    label: "Liderazgo negativo",
    categoria: "Liderazgo y relaciones",
    preguntas: [
      { id: "LS1", texto: "Mi jefe es grosero conmigo" },
      { id: "LS2", texto: "Mi jefe no da importancia a mis reportes sobre problemas de trabajo" },
      { id: "LS3", texto: "Mi jefe no resuelve problemas de manera eficaz" },
      { id: "LS4", texto: "Mi jefe me exige trabajar de forma excesiva" },
    ],
  },
  {
    id: "EP",
    label: "Entorno organizacional",
    categoria: "Entorno organizacional",
    preguntas: [
      { id: "EP1", texto: "Mi trabajo no me da satisfacción", inversa: false },
      { id: "EP2", texto: "No me siento orgulloso de trabajar en esta empresa", inversa: false },
      { id: "EP3", texto: "Me siento mal con lo que gano", inversa: false },
      { id: "EP4", texto: "Siento que no me dan el reconocimiento que merezco" },
      { id: "EP5", texto: "No me dan el apoyo que necesito cuando tengo alguna duda sobre el trabajo" },
    ],
  },
];

const TOTAL_ITEMS = DOMINIOS.reduce((a, d) => a + d.preguntas.length, 0);
const KEY = "auditor_nom035";

function calcScore(preguntas: Pregunta[], resp: RespMap): number {
  return preguntas.reduce((acc, p) => {
    const val = resp[p.id] ?? undefined;
    if (val === undefined) return acc;
    const score = p.inversa ? (4 - val) : val;
    return acc + score;
  }, 0);
}

function nivelDominio(pct: number) {
  if (pct >= 75) return { label: "Muy alto", color: "text-red-700",    bg: "bg-red-100",    border: "border-red-200"    };
  if (pct >= 50) return { label: "Alto",     color: "text-orange-700", bg: "bg-orange-100", border: "border-orange-200" };
  if (pct >= 25) return { label: "Medio",    color: "text-yellow-700", bg: "bg-yellow-100", border: "border-yellow-200" };
  return               { label: "Bajo",     color: "text-green-700",  bg: "bg-green-100",  border: "border-green-200"  };
}

export default function Nom035Page() {
  const [respuestas, setRespuestas] = useState<RespMap>({});
  const [paso,       setPaso]       = useState(0); // 0 = intro, 1..N = dominio, N+1 = resultados
  const [hydrated,   setHydrated]   = useState(false);

  useEffect(() => {
    try { const r = localStorage.getItem(KEY); if (r) { const p = JSON.parse(r); setRespuestas(p.resp || {}); setPaso(p.paso || 0); } } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify({ resp: respuestas, paso }));
  }, [respuestas, paso, hydrated]);

  const setResp = useCallback((id: string, val: Respuesta) => {
    setRespuestas(prev => ({ ...prev, [id]: val }));
  }, []);

  const dominioActual = DOMINIOS[paso - 1];
  const totalPasos    = DOMINIOS.length;
  const respondidas   = Object.keys(respuestas).length;
  const porcentaje    = Math.round((respondidas / TOTAL_ITEMS) * 100);

  const resultados = useMemo(() => {
    return DOMINIOS.map(d => {
      const maxScore = d.preguntas.length * 4;
      const score    = calcScore(d.preguntas, respuestas);
      const pct      = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
      return { ...d, score, maxScore, pct, nivel: nivelDominio(pct) };
    });
  }, [respuestas]);

  const globalPct = useMemo(() => {
    const maxTotal = TOTAL_ITEMS * 4;
    const total    = DOMINIOS.reduce((acc, d) => acc + calcScore(d.preguntas, respuestas), 0);
    return maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;
  }, [respuestas]);

  const globalNivel = nivelDominio(globalPct);

  function reset() {
    if (!window.confirm("¿Reiniciar la batería? Se perderán todas las respuestas.")) return;
    setRespuestas({});
    setPaso(0);
  }

  if (!hydrated) return null;

  /* ── INTRO ── */
  if (paso === 0) {
    return (
      <Shell>
        <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center shrink-0">
              <Brain className="text-white" size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Batería Psicosocial</h1>
              <p className="text-slate-500 text-sm">NOM-035-STPS-2018 · Guía de referencia II</p>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6 space-y-3">
            <h2 className="font-bold text-purple-900">¿Qué evalúa esta batería?</h2>
            <p className="text-purple-800 text-sm leading-relaxed">
              Identifica los <strong>factores de riesgo psicosocial</strong> en el entorno laboral conforme a la norma
              mexicana NOM-035-STPS-2018, que es de carácter obligatorio para todos los centros de trabajo en México.
            </p>
            <ul className="text-sm text-purple-800 space-y-1 ml-3 list-disc">
              <li>Condiciones del ambiente y carga de trabajo</li>
              <li>Control sobre el trabajo y tiempo laboral</li>
              <li>Relaciones en el trabajo y liderazgo</li>
              <li>Entorno organizacional y satisfacción</li>
            </ul>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Reactivos",  value: TOTAL_ITEMS },
              { label: "Dominios",   value: DOMINIOS.length },
              { label: "Duración",   value: "~10 min" },
            ].map(s => (
              <div key={s.label} className="bg-white border border-slate-100 rounded-xl p-4 text-center shadow-sm">
                <p className="text-2xl font-bold text-slate-800">{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {respondidas > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-3">
              <p className="text-amber-800 text-sm font-medium">Tienes {respondidas} respuestas guardadas ({porcentaje}%)</p>
              <button onClick={reset} className="text-amber-600 hover:text-amber-800 text-xs flex items-center gap-1">
                <RotateCcw size={12} /> Reiniciar
              </button>
            </div>
          )}

          <button
            onClick={() => setPaso(1)}
            className="w-full bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2 text-lg"
          >
            {respondidas > 0 ? "Continuar evaluación" : "Iniciar evaluación"}
            <ChevronRight size={22} />
          </button>

          <p className="text-xs text-slate-400 text-center">
            Las respuestas son confidenciales y se almacenan solo en este dispositivo.
          </p>
        </div>
      </Shell>
    );
  }

  /* ── RESULTADOS ── */
  if (paso === totalPasos + 1) {
    return (
      <Shell>
        <div className="p-4 sm:p-8 max-w-3xl space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Brain className="text-purple-500" size={24} /> Resultados NOM-035
              </h1>
              <p className="text-slate-500 text-sm mt-1">{respondidas}/{TOTAL_ITEMS} reactivos respondidos</p>
            </div>
            <div className="text-right">
              <p className={`text-4xl font-extrabold ${globalNivel.color}`}>{globalPct}%</p>
              <p className={`text-sm font-semibold ${globalNivel.color}`}>{globalNivel.label}</p>
            </div>
          </div>

          {/* Score global bar */}
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                globalPct >= 75 ? "bg-red-500" : globalPct >= 50 ? "bg-orange-400" : globalPct >= 25 ? "bg-yellow-400" : "bg-green-500"
              }`}
              style={{ width: `${globalPct}%` }}
            />
          </div>

          {/* Legend */}
          <div className="flex gap-2 flex-wrap text-xs">
            {[
              { label: "Bajo (<25%)",       bg: "bg-green-100 text-green-700" },
              { label: "Medio (25-49%)",    bg: "bg-yellow-100 text-yellow-700" },
              { label: "Alto (50-74%)",     bg: "bg-orange-100 text-orange-700" },
              { label: "Muy alto (≥75%)",   bg: "bg-red-100 text-red-700" },
            ].map(l => (
              <span key={l.label} className={`px-3 py-1 rounded-full font-medium ${l.bg}`}>{l.label}</span>
            ))}
          </div>

          {/* Dominio cards */}
          <div className="space-y-3">
            {resultados.map(d => (
              <div key={d.id} className={`bg-white rounded-2xl border p-5 shadow-sm ${d.nivel.border}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{d.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{d.categoria}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border shrink-0 ${d.nivel.bg} ${d.nivel.color} ${d.nivel.border}`}>
                    {d.nivel.label}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        d.pct >= 75 ? "bg-red-500" : d.pct >= 50 ? "bg-orange-400" : d.pct >= 25 ? "bg-yellow-400" : "bg-green-500"
                      }`}
                      style={{ width: `${d.pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-600 w-10 text-right">{d.pct}%</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{d.score} de {d.maxScore} puntos</p>
              </div>
            ))}
          </div>

          {/* Recomendaciones */}
          {globalPct >= 50 && (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
              <h3 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                <AlertTriangle size={16} /> Recomendaciones NOM-035
              </h3>
              <ul className="text-sm text-orange-700 space-y-1 ml-4 list-disc">
                {resultados.filter(d => d.pct >= 50).map(d => (
                  <li key={d.id}>
                    <strong>{d.label}</strong> — Nivel {d.nivel.label.toLowerCase()}. Implementar acciones correctivas.
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setPaso(totalPasos)}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 border border-slate-200 px-4 py-2 rounded-xl"
            >
              <ChevronLeft size={15} /> Regresar
            </button>
            <button
              onClick={reset}
              className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 border border-red-200 px-4 py-2 rounded-xl ml-auto"
            >
              <RotateCcw size={14} /> Reiniciar
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  /* ── DOMINIO ACTUAL ── */
  const dominioRespondidas = dominioActual.preguntas.filter(p => respuestas[p.id] !== undefined).length;
  const dominioCompleto    = dominioRespondidas === dominioActual.preguntas.length;

  return (
    <Shell>
      <div className="p-4 sm:p-8 max-w-2xl space-y-5">
        {/* Progress header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-400 mb-1">Dominio {paso} de {totalPasos}</p>
            <h2 className="font-bold text-slate-800">{dominioActual.label}</h2>
            <p className="text-xs text-slate-500">{dominioActual.categoria}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold text-purple-600">{porcentaje}%</p>
            <p className="text-xs text-slate-400">completado</p>
          </div>
        </div>

        {/* Step bar */}
        <div className="flex gap-1">
          {DOMINIOS.map((d, i) => {
            const done = d.preguntas.every(p => respuestas[p.id] !== undefined);
            const active = i + 1 === paso;
            return (
              <div key={d.id} className={`flex-1 h-1.5 rounded-full ${
                done ? "bg-purple-500" : active ? "bg-purple-300" : "bg-slate-200"
              }`} />
            );
          })}
        </div>

        {/* Preguntas */}
        <div className="space-y-4">
          {dominioActual.preguntas.map((p, idx) => (
            <QuestionCard key={p.id} idx={idx + 1} pregunta={p} respuesta={respuestas[p.id]} onSelect={setResp} />
          ))}
        </div>

        {/* Nav buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => setPaso(v => Math.max(0, v - 1))}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 text-sm transition-colors"
          >
            <ChevronLeft size={15} /> Anterior
          </button>
          <button
            onClick={() => setPaso(v => v + 1)}
            disabled={!dominioCompleto}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all active:scale-95"
          >
            {paso === totalPasos ? "Ver resultados" : "Siguiente dominio"}
            <ChevronRight size={15} />
          </button>
        </div>
        {!dominioCompleto && (
          <p className="text-xs text-slate-400 text-center">
            Responde los {dominioActual.preguntas.length - dominioRespondidas} reactivo{dominioActual.preguntas.length - dominioRespondidas !== 1 ? "s" : ""} restante{dominioActual.preguntas.length - dominioRespondidas !== 1 ? "s" : ""} para continuar
          </p>
        )}
      </div>
    </Shell>
  );
}

/* ── Sub-componentes ── */

function QuestionCard({
  idx, pregunta, respuesta, onSelect,
}: {
  idx: number;
  pregunta: Pregunta;
  respuesta: Respuesta | undefined;
  onSelect: (id: string, val: Respuesta) => void;
}) {
  return (
    <div className={`bg-white rounded-2xl border p-4 shadow-sm transition-all ${respuesta !== undefined ? "border-purple-200" : "border-slate-100"}`}>
      <p className="text-slate-700 text-sm leading-relaxed mb-3">
        <span className="text-slate-300 text-xs font-mono mr-2">{idx}.</span>
        {pregunta.texto}
      </p>
      <div className="flex flex-wrap gap-2">
        {OPCIONES.map(op => (
          <button
            key={op.value}
            onClick={() => onSelect(pregunta.id, op.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all active:scale-95 ${
              respuesta === op.value
                ? "bg-purple-600 text-white border-purple-600"
                : "border-slate-200 text-slate-500 hover:border-purple-300 hover:text-purple-700 bg-white"
            }`}
          >
            {op.label}
          </button>
        ))}
      </div>
    </div>
  );
}
