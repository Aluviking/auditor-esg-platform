"use client";
import { useState, useEffect } from "react";
import Shell from "@/components/Shell";
import { Target, Plus, Trash2, TrendingUp, TrendingDown, Minus } from "lucide-react";

type Estado = "verde"|"amarillo"|"rojo";
type Tendencia = "up"|"down"|"flat";

type Indicador = {
  id: string;
  nombre: string;
  area: string;
  unidad: string;
  meta: string;
  actual: string;
  tendencia: Tendencia;
  norma: string;
  fecha: string;
};

const NORMAS = ["ISO 14001","ISO 9001","ISO 45001","ISO 27001","GRI","ESG","NOM-035","CSRD"];

function calcEstado(meta: string, actual: string, tendencia: Tendencia): Estado {
  const m = parseFloat(meta), a = parseFloat(actual);
  if (isNaN(m) || isNaN(a)) return "amarillo";
  const pct = (a / m) * 100;
  if (tendencia === "down") return pct <= 100 ? "verde" : pct <= 120 ? "amarillo" : "rojo";
  return pct >= 90 ? "verde" : pct >= 70 ? "amarillo" : "rojo";
}

const ESTADO_STYLE: Record<Estado, string> = {
  verde:    "bg-green-100 text-green-700 border-green-200",
  amarillo: "bg-yellow-100 text-yellow-700 border-yellow-200",
  rojo:     "bg-red-100 text-red-700 border-red-200",
};
const ESTADO_LABEL: Record<Estado, string> = {
  verde: "En meta", amarillo: "En riesgo", rojo: "Fuera de meta",
};

const KEY = "auditor_indicadores";

export default function IndicadoresPage() {
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [hydrated,    setHydrated]    = useState(false);
  const [showForm,    setShowForm]    = useState(false);

  // Form
  const [fNombre,    setFNombre]    = useState("");
  const [fArea,      setFArea]      = useState("");
  const [fUnidad,    setFUnidad]    = useState("");
  const [fMeta,      setFMeta]      = useState("");
  const [fActual,    setFActual]    = useState("");
  const [fTendencia, setFTendencia] = useState<Tendencia>("up");
  const [fNorma,     setFNorma]     = useState("ISO 14001");

  useEffect(() => {
    try { const r = localStorage.getItem(KEY); if (r) setIndicadores(JSON.parse(r)); } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify(indicadores));
  }, [indicadores, hydrated]);

  function addIndicador() {
    if (!fNombre.trim()) return;
    setIndicadores(prev => [...prev, {
      id: Date.now().toString(),
      nombre: fNombre, area: fArea, unidad: fUnidad,
      meta: fMeta, actual: fActual, tendencia: fTendencia,
      norma: fNorma, fecha: new Date().toISOString().split("T")[0],
    }]);
    setFNombre(""); setFArea(""); setFUnidad(""); setFMeta(""); setFActual(""); setShowForm(false);
  }

  function updateActual(id: string, val: string) {
    setIndicadores(prev => prev.map(ind => ind.id===id ? { ...ind, actual: val } : ind));
  }

  const enMeta     = indicadores.filter(i => calcEstado(i.meta,i.actual,i.tendencia)==="verde").length;
  const enRiesgo   = indicadores.filter(i => calcEstado(i.meta,i.actual,i.tendencia)==="amarillo").length;
  const fueraMeta  = indicadores.filter(i => calcEstado(i.meta,i.actual,i.tendencia)==="rojo").length;

  if (!hydrated) return null;

  return (
    <Shell>
      <div className="p-4 sm:p-8 max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Target className="text-green-500" size={24} /> Indicadores y Objetivos
            </h1>
            <p className="text-slate-500 text-sm mt-1">ISO 9001 §9.1 · ISO 14001 §9.1 · GRI 2021</p>
          </div>
          <button onClick={() => setShowForm(v=>!v)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 active:scale-95 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all">
            <Plus size={15}/> Nuevo indicador
          </button>
        </div>

        {/* Stats semáforo */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
            <p className="text-2xl font-bold text-green-600">{enMeta || "—"}</p>
            <p className="text-xs text-slate-500 mt-1">En meta</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4">
            <p className="text-2xl font-bold text-yellow-600">{enRiesgo || "—"}</p>
            <p className="text-xs text-slate-500 mt-1">En riesgo</p>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
            <p className="text-2xl font-bold text-red-500">{fueraMeta || "—"}</p>
            <p className="text-xs text-slate-500 mt-1">Fuera de meta</p>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-700 text-sm">Nuevo indicador</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FI label="Nombre del indicador *" value={fNombre} onChange={setFNombre} placeholder="Ej. Reducción de emisiones GEI" />
              <FI label="Área / Proceso" value={fArea} onChange={setFArea} placeholder="Ej. Ambiental, Calidad..." />
              <FI label="Unidad de medida" value={fUnidad} onChange={setFUnidad} placeholder="%, tCO₂e, #, días..." />
              <FI label="Meta / Valor objetivo" value={fMeta} onChange={setFMeta} placeholder="100" />
              <FI label="Valor actual" value={fActual} onChange={setFActual} placeholder="85" />
              <div>
                <label className="label-form">Tendencia deseada</label>
                <select value={fTendencia} onChange={e=>setFTendencia(e.target.value as Tendencia)} className="select-form">
                  <option value="up">↑ Aumentar (ej. satisfacción)</option>
                  <option value="down">↓ Reducir (ej. emisiones, accidentes)</option>
                  <option value="flat">→ Mantener</option>
                </select>
              </div>
              <div>
                <label className="label-form">Norma de referencia</label>
                <select value={fNorma} onChange={e=>setFNorma(e.target.value)} className="select-form">
                  {NORMAS.map(n=><option key={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={()=>setShowForm(false)} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-800">Cancelar</button>
              <button onClick={addIndicador} disabled={!fNombre.trim()} className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white text-sm font-semibold rounded-xl active:scale-95 transition-all">Guardar</button>
            </div>
          </div>
        )}

        {/* Indicadores */}
        {indicadores.length===0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-14 text-center">
            <Target className="text-slate-300 mx-auto mb-3" size={44}/>
            <h3 className="text-slate-600 font-semibold mb-1">Sin indicadores definidos</h3>
            <p className="text-slate-400 text-sm max-w-xs mx-auto">
              Define tus objetivos e indicadores clave por área y norma. El semáforo mostrará
              automáticamente si estás en meta, en riesgo o fuera de meta.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {indicadores.map(ind => {
              const estado  = calcEstado(ind.meta, ind.actual, ind.tendencia);
              const pct     = ind.meta && ind.actual ? Math.round((parseFloat(ind.actual)/parseFloat(ind.meta))*100) : 0;
              const barPct  = Math.min(pct, 100);
              const barColor = estado==="verde"?"bg-green-500":estado==="amarillo"?"bg-yellow-400":"bg-red-400";
              const TIcon   = ind.tendencia==="up" ? TrendingUp : ind.tendencia==="down" ? TrendingDown : Minus;
              const tColor  = ind.tendencia==="up" ? "text-green-500" : ind.tendencia==="down" ? "text-blue-500" : "text-slate-400";
              return (
                <div key={ind.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-slate-800 text-sm">{ind.nombre}</p>
                        <TIcon size={14} className={tColor}/>
                        <span className="text-xs text-slate-400 border border-slate-200 rounded-full px-2 py-0.5">{ind.norma}</span>
                      </div>
                      {ind.area && <p className="text-xs text-slate-400 mt-0.5">{ind.area}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${ESTADO_STYLE[estado]}`}>
                        {ESTADO_LABEL[estado]}
                      </span>
                      <button onClick={()=>setIndicadores(p=>p.filter(x=>x.id!==ind.id))} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${barColor} rounded-full transition-all`} style={{width:`${barPct}%`}}/>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm shrink-0">
                      <input
                        type="number"
                        value={ind.actual}
                        onChange={e => updateActual(ind.id, e.target.value)}
                        className="w-20 border border-slate-200 rounded-lg px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-green-400"
                      />
                      <span className="text-slate-400 text-xs">/ {ind.meta} {ind.unidad}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Shell>
  );
}

function FI({ label, value, onChange, placeholder }: { label:string; value:string; onChange:(v:string)=>void; placeholder:string }) {
  return (
    <div>
      <label className="label-form">{label}</label>
      <input type="text" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"/>
    </div>
  );
}
