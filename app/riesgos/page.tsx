"use client";
import { useState, useEffect } from "react";
import Shell from "@/components/Shell";
import { Scale, Plus, Trash2, AlertTriangle } from "lucide-react";

type NivelR = 1|2|3|4|5;

type Riesgo = {
  id: string;
  descripcion: string;
  area: string;
  norma: string;
  probabilidad: NivelR;
  impacto: NivelR;
  control: string;
  responsable: string;
};

type ReqLegal = {
  id: string;
  requisito: string;
  norma: string;
  aplica: "si"|"no"|"parcial";
  evidencia: string;
  responsable: string;
  vencimiento: string;
};

const NORMAS_LEGAL = [
  "ISO 14001", "ISO 9001", "ISO 45001", "ISO 27001",
  "ISO 37001", "ISO 37301", "CSRD", "GRI 2021", "NOM-035", "NOM-030", "LGPD / GDPR",
];

const NIVEL_RIESGO = (p: number, i: number) => {
  const score = p * i;
  if (score >= 15) return { label: "Crítico",  color: "bg-red-100 text-red-700 border-red-200" };
  if (score >= 8)  return { label: "Alto",     color: "bg-orange-100 text-orange-700 border-orange-200" };
  if (score >= 4)  return { label: "Medio",    color: "bg-yellow-100 text-yellow-700 border-yellow-200" };
  return             { label: "Bajo",     color: "bg-green-100 text-green-700 border-green-200" };
};

const APLICA_STYLE: Record<string, string> = {
  si:      "bg-green-100 text-green-700",
  parcial: "bg-yellow-100 text-yellow-700",
  no:      "bg-red-100 text-red-700",
};

const KEY_RIESGOS = "auditor_riesgos_lista";
const KEY_LEGAL   = "auditor_legal_lista";

function load<T>(key: string, fallback: T): T {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; } catch { return fallback; }
}

export default function RiesgosPage() {
  const [tab,      setTab]      = useState<"legal"|"riesgos">("riesgos");
  const [riesgos,  setRiesgos]  = useState<Riesgo[]>([]);
  const [legales,  setLegales]  = useState<ReqLegal[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Nuevo riesgo
  const [nDesc,  setNDesc]  = useState("");
  const [nArea,  setNArea]  = useState("");
  const [nNorma, setNNorma] = useState("ISO 14001");
  const [nProb,  setNProb]  = useState<NivelR>(2);
  const [nImp,   setNImp]   = useState<NivelR>(2);
  const [nCtrl,  setNCtrl]  = useState("");
  const [nResp,  setNResp]  = useState("");
  const [showFormR, setShowFormR] = useState(false);

  // Nuevo req legal
  const [lReq,  setLReq]  = useState("");
  const [lNorm, setLNorm] = useState("ISO 14001");
  const [lApl,  setLApl]  = useState<"si"|"no"|"parcial">("si");
  const [lEvi,  setLEvi]  = useState("");
  const [lResp, setLResp] = useState("");
  const [lVenc, setLVenc] = useState("");
  const [showFormL, setShowFormL] = useState(false);

  useEffect(() => {
    setRiesgos(load(KEY_RIESGOS, []));
    setLegales(load(KEY_LEGAL, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY_RIESGOS, JSON.stringify(riesgos));
    localStorage.setItem(KEY_LEGAL,   JSON.stringify(legales));
  }, [riesgos, legales, hydrated]);

  function addRiesgo() {
    if (!nDesc.trim()) return;
    setRiesgos(prev => [...prev, {
      id: Date.now().toString(), descripcion: nDesc, area: nArea, norma: nNorma,
      probabilidad: nProb, impacto: nImp, control: nCtrl, responsable: nResp,
    }]);
    setNDesc(""); setNArea(""); setNCtrl(""); setNResp(""); setNProb(2); setNImp(2); setShowFormR(false);
  }

  function addLegal() {
    if (!lReq.trim()) return;
    setLegales(prev => [...prev, {
      id: Date.now().toString(), requisito: lReq, norma: lNorm, aplica: lApl,
      evidencia: lEvi, responsable: lResp, vencimiento: lVenc,
    }]);
    setLReq(""); setLEvi(""); setLResp(""); setLVenc(""); setShowFormL(false);
  }

  if (!hydrated) return null;

  return (
    <Shell>
      <div className="p-4 sm:p-8 max-w-5xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Scale className="text-green-500" size={24} /> Riesgos y Cumplimiento Legal
          </h1>
          <p className="text-slate-500 text-sm mt-1">ISO 31000 · ISO 37301 · Matriz Legal</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {(["riesgos","legal"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                tab===t ? "bg-slate-800 text-white" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
              }`}>
              {t==="riesgos" ? "Matriz de Riesgos" : "Matriz Legal"}
            </button>
          ))}
        </div>

        {/* ── RIESGOS ── */}
        {tab==="riesgos" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-slate-500 text-sm">
                {riesgos.length} riesgo{riesgos.length!==1?"s":""} registrado{riesgos.length!==1?"s":""}
              </p>
              <button onClick={() => setShowFormR(v=>!v)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-500 active:scale-95 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all">
                <Plus size={15} /> Agregar riesgo
              </button>
            </div>

            {showFormR && (
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-700 text-sm">Nuevo riesgo</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput label="Descripción del riesgo *" value={nDesc} onChange={setNDesc} placeholder="Incumplimiento de requisitos ISO 14001..." />
                  <FormInput label="Área / Proceso" value={nArea} onChange={setNArea} placeholder="Operaciones, Calidad..." />
                  <div>
                    <label className="label-form">Norma de referencia</label>
                    <select value={nNorma} onChange={e=>setNNorma(e.target.value)} className="select-form">
                      {NORMAS_LEGAL.map(n=><option key={n}>{n}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label-form">Probabilidad (1-5)</label>
                      <select value={nProb} onChange={e=>setNProb(+e.target.value as NivelR)} className="select-form">
                        {[1,2,3,4,5].map(v=><option key={v}>{v}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label-form">Impacto (1-5)</label>
                      <select value={nImp} onChange={e=>setNImp(+e.target.value as NivelR)} className="select-form">
                        {[1,2,3,4,5].map(v=><option key={v}>{v}</option>)}
                      </select>
                    </div>
                  </div>
                  <FormInput label="Control / Tratamiento" value={nCtrl} onChange={setNCtrl} placeholder="Auditoría mensual, capacitación..." />
                  <FormInput label="Responsable" value={nResp} onChange={setNResp} placeholder="Nombre / Cargo" />
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={()=>setShowFormR(false)} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-800 transition-colors">Cancelar</button>
                  <button onClick={addRiesgo} disabled={!nDesc.trim()} className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white text-sm font-semibold rounded-xl active:scale-95 transition-all">Guardar</button>
                </div>
              </div>
            )}

            {riesgos.length===0 ? (
              <EmptyState icon={<AlertTriangle size={44} className="text-slate-300" />} label="Sin riesgos registrados"
                desc="Registra los riesgos identificados en tu organización con su probabilidad, impacto y controles asignados." />
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                      <th className="px-4 py-3 text-left">Riesgo</th>
                      <th className="px-4 py-3 text-left hidden sm:table-cell">Norma</th>
                      <th className="px-4 py-3 text-center">P×I</th>
                      <th className="px-4 py-3 text-left hidden md:table-cell">Control</th>
                      <th className="px-4 py-3 text-left hidden md:table-cell">Responsable</th>
                      <th className="px-4 py-3 text-left">Nivel</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {riesgos.map(r => {
                      const nivel = NIVEL_RIESGO(r.probabilidad, r.impacto);
                      return (
                        <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-800 max-w-[180px]">
                            <p className="truncate">{r.descripcion}</p>
                            {r.area && <p className="text-xs text-slate-400">{r.area}</p>}
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-xs hidden sm:table-cell">{r.norma}</td>
                          <td className="px-4 py-3 text-center font-bold text-slate-700">{r.probabilidad * r.impacto}</td>
                          <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell max-w-[140px]">
                            <p className="truncate">{r.control || "—"}</p>
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">{r.responsable || "—"}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${nivel.color}`}>{nivel.label}</span>
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={()=>setRiesgos(p=>p.filter(x=>x.id!==r.id))} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── LEGAL ── */}
        {tab==="legal" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-slate-500 text-sm">{legales.length} requisito{legales.length!==1?"s":""} registrado{legales.length!==1?"s":""}</p>
              <button onClick={()=>setShowFormL(v=>!v)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-500 active:scale-95 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all">
                <Plus size={15} /> Agregar requisito
              </button>
            </div>

            {showFormL && (
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-700 text-sm">Nuevo requisito legal</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput label="Requisito / Obligación *" value={lReq} onChange={setLReq} placeholder="Ej. Política ambiental documentada y comunicada..." />
                  <div>
                    <label className="label-form">Norma</label>
                    <select value={lNorm} onChange={e=>setLNorm(e.target.value)} className="select-form">
                      {NORMAS_LEGAL.map(n=><option key={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label-form">¿Aplica?</label>
                    <select value={lApl} onChange={e=>setLApl(e.target.value as "si"|"no"|"parcial")} className="select-form">
                      <option value="si">Sí — cumplido</option>
                      <option value="parcial">Parcial — en proceso</option>
                      <option value="no">No — pendiente</option>
                    </select>
                  </div>
                  <FormInput label="Evidencia / Documento" value={lEvi} onChange={setLEvi} placeholder="Política v2.1, Procedimiento PR-04..." />
                  <FormInput label="Responsable" value={lResp} onChange={setLResp} placeholder="Área o persona" />
                  <FormInput label="Fecha de vencimiento / revisión" value={lVenc} onChange={setLVenc} placeholder="2026-12-31" />
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={()=>setShowFormL(false)} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-800">Cancelar</button>
                  <button onClick={addLegal} disabled={!lReq.trim()} className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white text-sm font-semibold rounded-xl active:scale-95 transition-all">Guardar</button>
                </div>
              </div>
            )}

            {legales.length===0 ? (
              <EmptyState icon={<Scale size={44} className="text-slate-300"/>} label="Matriz legal vacía"
                desc="Registra los requisitos legales y normativos aplicables a tu organización, su estado de cumplimiento y la evidencia correspondiente." />
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                      <th className="px-4 py-3 text-left">Requisito</th>
                      <th className="px-4 py-3 text-left hidden sm:table-cell">Norma</th>
                      <th className="px-4 py-3 text-left">Estado</th>
                      <th className="px-4 py-3 text-left hidden md:table-cell">Evidencia</th>
                      <th className="px-4 py-3 text-left hidden md:table-cell">Vencimiento</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {legales.map(l => (
                      <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-800 max-w-[200px]">
                          <p className="truncate">{l.requisito}</p>
                          {l.responsable && <p className="text-xs text-slate-400">{l.responsable}</p>}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs hidden sm:table-cell">{l.norma}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${APLICA_STYLE[l.aplica]}`}>
                            {l.aplica==="si"?"Cumplido":l.aplica==="parcial"?"Parcial":"Pendiente"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell max-w-[140px]">
                          <p className="truncate">{l.evidencia||"—"}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">{l.vencimiento||"—"}</td>
                        <td className="px-4 py-3">
                          <button onClick={()=>setLegales(p=>p.filter(x=>x.id!==l.id))} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </Shell>
  );
}

function FormInput({ label, value, onChange, placeholder }: { label:string; value:string; onChange:(v:string)=>void; placeholder:string }) {
  return (
    <div>
      <label className="label-form">{label}</label>
      <input type="text" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition-all" />
    </div>
  );
}

function EmptyState({ icon, label, desc }: { icon: React.ReactNode; label: string; desc: string }) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-14 text-center">
      <div className="flex justify-center mb-3">{icon}</div>
      <h3 className="text-slate-600 font-semibold mb-1">{label}</h3>
      <p className="text-slate-400 text-sm max-w-xs mx-auto">{desc}</p>
    </div>
  );
}
