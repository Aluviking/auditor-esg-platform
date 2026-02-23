"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import Shell from "@/components/Shell";
import { Users, Plus, ChevronRight, ChevronLeft, CheckCircle, AlertTriangle, XCircle, RotateCcw, Trash2 } from "lucide-react";

// ── Batería de evaluación de proveedores ──────────────────────────────────────
const SECCIONES = [
  {
    id: "ambiental", label: "Ambiental", norm: "ISO 14001 / GRI 300", color: "bg-green-500",
    preguntas: [
      { id: "pa1", texto: "¿Cuenta con política ambiental documentada?" },
      { id: "pa2", texto: "¿Mide y registra sus emisiones de gases de efecto invernadero?" },
      { id: "pa3", texto: "¿Gestiona adecuadamente sus residuos peligrosos y no peligrosos?" },
      { id: "pa4", texto: "¿Tiene certificación ISO 14001 o equivalente?" },
      { id: "pa5", texto: "¿Cuenta con metas de reducción de huella ambiental?" },
    ],
  },
  {
    id: "social", label: "Social", norm: "GRI 400 / SA 8000", color: "bg-blue-500",
    preguntas: [
      { id: "ps1", texto: "¿Cumple con la legislación laboral aplicable en su país?" },
      { id: "ps2", texto: "¿Prohíbe el trabajo infantil y el trabajo forzoso?" },
      { id: "ps3", texto: "¿Cuenta con programa de seguridad y salud ocupacional?" },
      { id: "ps4", texto: "¿Tiene política de no discriminación e igualdad de oportunidades?" },
      { id: "ps5", texto: "¿Permite la libre asociación y negociación colectiva?" },
    ],
  },
  {
    id: "gobernanza", label: "Gobernanza", norm: "ISO 37001 / ISO 37301", color: "bg-purple-500",
    preguntas: [
      { id: "pg1", texto: "¿Cuenta con Código de Ética o Conducta publicado?" },
      { id: "pg2", texto: "¿Tiene políticas anti-corrupción y anti-soborno implementadas?" },
      { id: "pg3", texto: "¿Dispone de canal de denuncias para empleados y partes interesadas?" },
      { id: "pg4", texto: "¿Sus estados financieros son auditados por terceros independientes?" },
    ],
  },
];

const TOTAL_PREGUNTAS = SECCIONES.flatMap(s => s.preguntas).length;
const SCORE_MAP: Record<string, number> = { si: 2, parcial: 1, no: 0 };

type Answer  = "si" | "parcial" | "no";
type Answers = Record<string, Answer>;

type Proveedor = {
  id: string;
  nombre: string;
  rfc: string;
  categoria: string;
  fecha: string;
  answers: Answers;
  completado: boolean;
};

const STORAGE_KEY = "auditor_proveedores";

function loadProveedores(): Proveedor[] {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
}
function saveProveedores(list: Proveedor[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {}
}

function calcScore(answers: Answers) {
  const max = TOTAL_PREGUNTAS * 2;
  const pts = Object.values(answers).reduce((a, v) => a + (SCORE_MAP[v] ?? 0), 0);
  return Math.round((pts / max) * 100);
}

const NIVEL_LABEL = (pct: number) =>
  pct >= 75 ? "Aprobado" : pct >= 50 ? "Condicionado" : "Rechazado";
const NIVEL_COLOR = (pct: number) =>
  pct >= 75 ? "text-green-600 bg-green-50 border-green-200" :
  pct >= 50 ? "text-yellow-600 bg-yellow-50 border-yellow-200" :
              "text-red-600 bg-red-50 border-red-200";

export default function ProveedoresPage() {
  const [lista,       setLista]       = useState<Proveedor[]>([]);
  const [vista,       setVista]       = useState<"lista"|"nuevo"|"evaluar">("lista");
  const [activoId,    setActivoId]    = useState<string|null>(null);
  const [seccion,     setSeccion]     = useState(0);
  const [hydrated,    setHydrated]    = useState(false);
  // Nuevo proveedor form
  const [nombre,   setNombre]   = useState("");
  const [rfc,      setRfc]      = useState("");
  const [categoria,setCategoria]= useState("");

  useEffect(() => { setLista(loadProveedores()); setHydrated(true); }, []);
  useEffect(() => { if (hydrated) saveProveedores(lista); }, [lista, hydrated]);

  const proveedor = lista.find(p => p.id === activoId) ?? null;

  const answer = useCallback((qid: string, val: Answer) => {
    setLista(prev => prev.map(p =>
      p.id === activoId ? { ...p, answers: { ...p.answers, [qid]: val } } : p
    ));
  }, [activoId]);

  function crearProveedor() {
    if (!nombre.trim()) return;
    const nuevo: Proveedor = {
      id: Date.now().toString(),
      nombre: nombre.trim(), rfc: rfc.trim(), categoria: categoria.trim(),
      fecha: new Date().toISOString().split("T")[0],
      answers: {}, completado: false,
    };
    setLista(prev => [...prev, nuevo]);
    setNombre(""); setRfc(""); setCategoria("");
    setActivoId(nuevo.id); setSeccion(0); setVista("evaluar");
  }

  function finalizarEvaluacion() {
    setLista(prev => prev.map(p => p.id === activoId ? { ...p, completado: true } : p));
    setVista("lista");
  }

  function eliminar(id: string) {
    if (!window.confirm("¿Eliminar este proveedor?")) return;
    setLista(prev => prev.filter(p => p.id !== id));
  }

  const seccionActual = SECCIONES[seccion];

  if (!hydrated) return null;

  // ── LISTA ──────────────────────────────────────────────────────────────────
  if (vista === "lista") return (
    <Shell>
      <div className="p-4 sm:p-8 max-w-4xl space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Users className="text-green-500" size={24} /> Evaluación de Proveedores ESG
            </h1>
            <p className="text-slate-500 text-sm mt-1">ISO 28001 · GRI 308 · SA 8000 · ISO 37001</p>
          </div>
          <button
            onClick={() => setVista("nuevo")}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 active:scale-95 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all"
          >
            <Plus size={16} /> Agregar proveedor
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total proveedores",    value: lista.length || "—",                                       color: "text-slate-700" },
            { label: "Aprobados",             value: lista.filter(p => calcScore(p.answers) >= 75).length || "—", color: "text-green-600" },
            { label: "Pendientes evaluación", value: lista.filter(p => !p.completado).length || "—",           color: "text-yellow-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-slate-400 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Lista */}
        {lista.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-14 text-center">
            <Users className="text-slate-300 mx-auto mb-3" size={44} />
            <h3 className="text-slate-600 font-semibold mb-1">Sin proveedores registrados</h3>
            <p className="text-slate-400 text-sm max-w-xs mx-auto">
              Agrega proveedores para evaluarlos en criterios ambientales, sociales y de gobernanza
              alineados a ISO 28001 y GRI.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {lista.map(p => {
              const pct   = calcScore(p.answers);
              const nivel = NIVEL_LABEL(pct);
              const color = NIVEL_COLOR(pct);
              const Icon  = pct >= 75 ? CheckCircle : pct >= 50 ? AlertTriangle : XCircle;
              return (
                <div key={p.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 flex items-center gap-4">
                  <Icon className={pct >= 75 ? "text-green-500" : pct >= 50 ? "text-yellow-500" : "text-red-400"} size={22} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-slate-800 text-sm">{p.nombre}</p>
                      {p.categoria && <span className="text-xs text-slate-400 border border-slate-200 rounded-full px-2 py-0.5">{p.categoria}</span>}
                    </div>
                    <div className="flex gap-3 mt-1 text-xs text-slate-400">
                      {p.rfc && <span>RFC: {p.rfc}</span>}
                      <span>Evaluado: {p.fecha}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full mt-2 w-48">
                      <div className={`h-full rounded-full ${pct >= 75 ? "bg-green-500" : pct >= 50 ? "bg-yellow-400" : "bg-red-400"}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${color}`}>{nivel} {pct}%</span>
                    <button
                      onClick={() => { setActivoId(p.id); setSeccion(0); setVista("evaluar"); }}
                      className="text-slate-400 hover:text-slate-700 transition-colors p-1"
                    ><ChevronRight size={18} /></button>
                    <button onClick={() => eliminar(p.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1"><Trash2 size={16} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Shell>
  );

  // ── NUEVO PROVEEDOR ────────────────────────────────────────────────────────
  if (vista === "nuevo") return (
    <Shell>
      <div className="p-4 sm:p-8 max-w-xl space-y-6">
        <button onClick={() => setVista("lista")} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition-colors">
          <ChevronLeft size={16} /> Volver
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Agregar proveedor</h1>
          <p className="text-slate-500 text-sm mt-1">Registra los datos básicos para iniciar la evaluación ESG</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <Field label="Nombre / Razón social *" value={nombre} onChange={setNombre} placeholder="Proveedor ABC S.A. de C.V." />
          <Field label="RFC / NIT / RUC" value={rfc} onChange={setRfc} placeholder="ABC123456XYZ" />
          <Field label="Categoría / Rubro" value={categoria} onChange={setCategoria} placeholder="Ej. Materias primas, Logística, Servicios..." />
        </div>
        <button
          onClick={crearProveedor}
          disabled={!nombre.trim()}
          className="w-full bg-green-600 hover:bg-green-500 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all text-sm"
        >
          Crear y comenzar evaluación →
        </button>
      </div>
    </Shell>
  );

  // ── EVALUACIÓN ─────────────────────────────────────────────────────────────
  if (!proveedor) return null;
  const respondidas = Object.keys(proveedor.answers).length;
  const pctProgress = Math.round((respondidas / TOTAL_PREGUNTAS) * 100);

  return (
    <Shell>
      <div className="p-4 sm:p-8 max-w-3xl space-y-5">
        <button onClick={() => setVista("lista")} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition-colors">
          <ChevronLeft size={16} /> Volver a lista
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-800">{proveedor.nombre}</h1>
          <p className="text-slate-500 text-sm">Evaluación ESG · {respondidas}/{TOTAL_PREGUNTAS} respondidas</p>
        </div>

        {/* Progress */}
        <div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${pctProgress}%` }} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          {SECCIONES.map((s, i) => {
            const done = s.preguntas.every(q => proveedor.answers[q.id]);
            return (
              <button key={s.id} onClick={() => setSeccion(i)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 ${
                  seccion === i ? "bg-slate-800 text-white" : done ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}>
                {done && <CheckCircle size={10} />}{s.label}
              </button>
            );
          })}
        </div>

        {/* Preguntas */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className={`${seccionActual.color} px-5 py-3 flex justify-between items-center`}>
            <h2 className="text-white font-bold text-sm">{seccionActual.label} — {seccionActual.norm}</h2>
            <span className="text-white/70 text-xs">
              {seccionActual.preguntas.filter(q => proveedor.answers[q.id]).length}/{seccionActual.preguntas.length}
            </span>
          </div>
          <div className="divide-y divide-slate-50">
            {seccionActual.preguntas.map((q, qi) => (
              <div key={q.id} className="px-5 py-4">
                <p className="text-slate-700 text-sm mb-3 leading-relaxed">
                  <span className="text-slate-300 mr-2 select-none">{qi + 1}.</span>{q.texto}
                </p>
                <div className="flex gap-2">
                  {(["si","parcial","no"] as const).map(opt => (
                    <button key={opt} onClick={() => answer(q.id, opt)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all active:scale-95 ${
                        proveedor.answers[q.id] === opt
                          ? opt==="si" ? "bg-green-500 text-white border-green-500"
                          : opt==="parcial" ? "bg-yellow-400 text-white border-yellow-400"
                          : "bg-red-400 text-white border-red-400"
                          : "border-slate-200 text-slate-500 hover:border-slate-400 bg-white"
                      }`}>
                      {opt==="si"?"Sí":opt==="parcial"?"Parcial":"No"}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button disabled={seccion===0} onClick={() => setSeccion(s=>s-1)}
            className="text-sm text-slate-500 hover:text-slate-800 disabled:opacity-30 px-3 py-2 transition-colors">
            ← Anterior
          </button>
          {seccion < SECCIONES.length-1 ? (
            <button onClick={() => setSeccion(s=>s+1)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all">
              Siguiente <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={finalizarEvaluacion}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 active:scale-95 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all">
              Finalizar evaluación <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </Shell>
  );
}

function Field({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{label}</label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all" />
    </div>
  );
}
