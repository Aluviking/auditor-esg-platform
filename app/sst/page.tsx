"use client";
import { useState, useEffect, useMemo } from "react";
import Shell from "@/components/Shell";
import { HeartPulse, Plus, Trash2, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

const DIAGNOSTICO_SST = [
  {
    id: "pol", label: "Política y Compromiso", norm: "ISO 45001 §5.2",
    preguntas: [
      { id: "d1", texto: "¿Existe una política de SST documentada, aprobada por la alta dirección y comunicada?" },
      { id: "d2", texto: "¿La dirección demuestra liderazgo activo en materia de SST?" },
      { id: "d3", texto: "¿Se han asignado roles y responsabilidades de SST formalmente?" },
    ],
  },
  {
    id: "peli", label: "Identificación de Peligros", norm: "ISO 45001 §6.1",
    preguntas: [
      { id: "d4", texto: "¿Se identifican, evalúan y documentan los peligros y riesgos laborales?" },
      { id: "d5", texto: "¿Participan los trabajadores en la identificación de peligros?" },
      { id: "d6", texto: "¿Se mantiene actualizado el panorama de factores de riesgo?" },
    ],
  },
  {
    id: "ctrl", label: "Controles Operacionales", norm: "ISO 45001 §8",
    preguntas: [
      { id: "d7", texto: "¿Existen controles para eliminación, sustitución o reducción de riesgos?" },
      { id: "d8", texto: "¿Se cuenta con equipo de protección personal adecuado y en buen estado?" },
      { id: "d9", texto: "¿Se tienen planes de emergencia y evacuación documentados y practicados?" },
    ],
  },
  {
    id: "eval", label: "Evaluación y Medición", norm: "ISO 45001 §9",
    preguntas: [
      { id: "d10", texto: "¿Se monitorean indicadores de accidentabilidad (IF, IG, ISP)?" },
      { id: "d11", texto: "¿Se realizan auditorías internas de SST periódicamente?" },
      { id: "d12", texto: "¿Se investigan los accidentes e incidentes con análisis de causa raíz?" },
    ],
  },
];

const TOTAL_DIAG = DIAGNOSTICO_SST.flatMap(s => s.preguntas).length;
const SCORE_MAP: Record<string, number> = { si: 2, parcial: 1, no: 0 };

type Answer = "si"|"parcial"|"no";

type Peligro = {
  id: string;
  descripcion: string;
  area: string;
  tipo: string;
  probabilidad: number;
  severidad: number;
  control: string;
  estado: "Activo"|"Controlado";
};

const KEY = "auditor_sst";

export default function SSTPage() {
  const [tab,      setTab]      = useState<"diagnostico"|"peligros">("diagnostico");
  const [answers,  setAnswers]  = useState<Record<string, Answer>>({});
  const [seccion,  setSeccion]  = useState(0);
  const [peligros, setPeligros] = useState<Peligro[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Form peligro
  const [pDesc, setPDesc] = useState("");
  const [pArea, setPArea] = useState("");
  const [pTipo, setPTipo] = useState("Físico");
  const [pProb, setPProb] = useState(2);
  const [pSev,  setPSev]  = useState(2);
  const [pCtrl, setPCtrl] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { const d = JSON.parse(raw); setAnswers(d.answers||{}); setPeligros(d.peligros||[]); }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify({ answers, peligros }));
  }, [answers, peligros, hydrated]);

  const { globalPct, seccionPcts } = useMemo(() => {
    let totalPts=0, totalMax=0;
    const pcts: Record<string,number> = {};
    DIAGNOSTICO_SST.forEach(s => {
      const max = s.preguntas.length * 2;
      const pts = s.preguntas.reduce((a,q) => a + (SCORE_MAP[answers[q.id] ?? ""] ?? 0), 0);
      pcts[s.id] = Math.round((pts/max)*100);
      totalPts += pts; totalMax += max;
    });
    return { globalPct: totalMax > 0 ? Math.round((totalPts/totalMax)*100) : 0, seccionPcts: pcts };
  }, [answers]);

  function addPeligro() {
    if (!pDesc.trim()) return;
    setPeligros(prev => [...prev, {
      id: Date.now().toString(), descripcion: pDesc, area: pArea, tipo: pTipo,
      probabilidad: pProb, severidad: pSev, control: pCtrl, estado: "Activo",
    }]);
    setPDesc(""); setPArea(""); setPCtrl(""); setPProb(2); setPSev(2); setShowForm(false);
  }

  const respondidas = Object.keys(answers).length;
  const seccionActual = DIAGNOSTICO_SST[seccion];
  const levelColor = globalPct>=75?"text-green-400":globalPct>=50?"text-yellow-400":"text-red-400";
  const level = globalPct>=75?"Adecuado":globalPct>=50?"En desarrollo":"Inicial";

  if (!hydrated) return null;

  return (
    <Shell>
      <div className="p-4 sm:p-8 max-w-4xl space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
              <HeartPulse className="text-green-500" size={24} /> SST — Seguridad y Salud en el Trabajo
            </h1>
            <p className="text-slate-500 text-sm mt-1">ISO 45001 · NOM-030 · NOM-035</p>
          </div>
          {tab==="diagnostico" && (
            <div className="text-right">
              <p className={`text-3xl font-extrabold ${levelColor}`}>{globalPct}%</p>
              <p className="text-slate-400 text-xs">{level}</p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {(["diagnostico","peligros"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                tab===t ? "bg-slate-800 text-white" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
              }`}>
              {t==="diagnostico" ? "Diagnóstico ISO 45001" : "Peligros y Riesgos"}
            </button>
          ))}
        </div>

        {/* ── DIAGNÓSTICO ── */}
        {tab==="diagnostico" && (
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>{respondidas}/{TOTAL_DIAG} respondidas</span>
                <span>{Math.round((respondidas/TOTAL_DIAG)*100)}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all" style={{width:`${(respondidas/TOTAL_DIAG)*100}%`}}/>
              </div>
            </div>

            {/* Tabs sección */}
            <div className="flex gap-2 flex-wrap">
              {DIAGNOSTICO_SST.map((s,i) => {
                const done = s.preguntas.every(q=>answers[q.id]);
                return (
                  <button key={s.id} onClick={()=>setSeccion(i)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 ${
                      seccion===i ? "bg-slate-800 text-white" : done ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}>
                    {done && <CheckCircle size={10}/>}{s.label}
                  </button>
                );
              })}
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="bg-green-600 px-5 py-3 flex justify-between items-center">
                <h2 className="text-white font-bold text-sm">{seccionActual.label}</h2>
                <span className="text-white/70 text-xs">{seccionActual.norm}</span>
              </div>
              <div className="divide-y divide-slate-50">
                {seccionActual.preguntas.map((q,qi) => (
                  <div key={q.id} className="px-5 py-4">
                    <p className="text-slate-700 text-sm mb-3 leading-relaxed">
                      <span className="text-slate-300 mr-2">{qi+1}.</span>{q.texto}
                    </p>
                    <div className="flex gap-2">
                      {(["si","parcial","no"] as const).map(opt => (
                        <button key={opt} onClick={() => setAnswers(p=>({...p,[q.id]:opt}))}
                          className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all active:scale-95 ${
                            answers[q.id]===opt
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

            <div className="flex justify-between">
              <button disabled={seccion===0} onClick={()=>setSeccion(s=>s-1)} className="text-sm text-slate-500 hover:text-slate-800 disabled:opacity-30 px-3 py-2">← Anterior</button>
              {seccion < DIAGNOSTICO_SST.length-1 && (
                <button onClick={()=>setSeccion(s=>s+1)} className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all">Siguiente →</button>
              )}
            </div>
          </div>
        )}

        {/* ── PELIGROS ── */}
        {tab==="peligros" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-slate-500 text-sm">{peligros.length} peligro{peligros.length!==1?"s":""} registrado{peligros.length!==1?"s":""}</p>
              <button onClick={()=>setShowForm(v=>!v)} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 active:scale-95 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all">
                <Plus size={15}/> Registrar peligro
              </button>
            </div>

            {showForm && (
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-700 text-sm">Nuevo peligro / riesgo</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label-form">Descripción *</label>
                    <input type="text" value={pDesc} onChange={e=>setPDesc(e.target.value)} placeholder="Trabajo en alturas, exposición a químicos..."
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"/>
                  </div>
                  <div>
                    <label className="label-form">Área / Proceso</label>
                    <input type="text" value={pArea} onChange={e=>setPArea(e.target.value)} placeholder="Almacén, Producción..."
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"/>
                  </div>
                  <div>
                    <label className="label-form">Tipo de peligro</label>
                    <select value={pTipo} onChange={e=>setPTipo(e.target.value)} className="select-form">
                      {["Físico","Químico","Biológico","Ergonómico","Psicosocial","Mecánico","Eléctrico"].map(t=><option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label-form">Probabilidad</label>
                      <select value={pProb} onChange={e=>setPProb(+e.target.value)} className="select-form">
                        {[1,2,3,4,5].map(v=><option key={v}>{v}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label-form">Severidad</label>
                      <select value={pSev} onChange={e=>setPSev(+e.target.value)} className="select-form">
                        {[1,2,3,4,5].map(v=><option key={v}>{v}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label-form">Medida de control / EPP</label>
                    <input type="text" value={pCtrl} onChange={e=>setPCtrl(e.target.value)} placeholder="Casco, arnés, capacitación, señalización..."
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"/>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={()=>setShowForm(false)} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-800">Cancelar</button>
                  <button onClick={addPeligro} disabled={!pDesc.trim()} className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white text-sm font-semibold rounded-xl active:scale-95 transition-all">Guardar</button>
                </div>
              </div>
            )}

            {peligros.length===0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-14 text-center">
                <AlertTriangle className="text-slate-300 mx-auto mb-3" size={44}/>
                <h3 className="text-slate-600 font-semibold mb-1">Sin peligros registrados</h3>
                <p className="text-slate-400 text-sm max-w-xs mx-auto">Registra los peligros identificados en tu lugar de trabajo con su nivel de riesgo y medidas de control.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {peligros.map(p => {
                  const score = p.probabilidad * p.severidad;
                  const nivel = score>=15?"Crítico":score>=8?"Alto":score>=4?"Medio":"Bajo";
                  const nc    = score>=15?"bg-red-100 text-red-700":score>=8?"bg-orange-100 text-orange-700":score>=4?"bg-yellow-100 text-yellow-700":"bg-green-100 text-green-700";
                  return (
                    <div key={p.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-semibold text-slate-800 text-sm">{p.descripcion}</p>
                          <span className="text-xs border border-slate-200 rounded-full px-2 py-0.5 text-slate-400">{p.tipo}</span>
                        </div>
                        {p.area && <p className="text-xs text-slate-400 mb-1">Área: {p.area}</p>}
                        {p.control && <p className="text-xs text-slate-500">Control: {p.control}</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-center">
                          <p className="text-xs text-slate-400">P×S</p>
                          <p className="font-bold text-slate-700">{score}</p>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${nc}`}>{nivel}</span>
                        <button onClick={()=>setPeligros(prev=>prev.filter(x=>x.id!==p.id))} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={15}/></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </Shell>
  );
}
