"use client";
import { useState, useEffect } from "react";
import Shell from "@/components/Shell";
import { Globe, Plus, Trash2, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";

/* ── Types ──────────────────────────────────────────────────────────────── */
type Iniciativa = {
  id: string;
  ods: string;
  descripcion: string;
  responsable: string;
  progreso: number;
};
type OdsData = {
  seleccionados: string[];
  iniciativas: Iniciativa[];
};

/* ── ODS Catalog ────────────────────────────────────────────────────────── */
const ODS_LIST = [
  { id: "ODS1",  num: 1,  titulo: "Fin de la pobreza",           color: "#E5243B", desc: "Erradicar la pobreza en todas sus formas" },
  { id: "ODS2",  num: 2,  titulo: "Hambre cero",                 color: "#DDA63A", desc: "Lograr la seguridad alimentaria" },
  { id: "ODS3",  num: 3,  titulo: "Salud y bienestar",           color: "#4C9F38", desc: "Garantizar una vida sana y promover el bienestar" },
  { id: "ODS4",  num: 4,  titulo: "Educación de calidad",        color: "#C5192D", desc: "Garantizar una educación inclusiva y equitativa" },
  { id: "ODS5",  num: 5,  titulo: "Igualdad de género",          color: "#FF3A21", desc: "Lograr la igualdad de género" },
  { id: "ODS6",  num: 6,  titulo: "Agua limpia y saneamiento",   color: "#26BDE2", desc: "Garantizar agua potable y su gestión sostenible" },
  { id: "ODS7",  num: 7,  titulo: "Energía asequible y limpia",  color: "#FCC30B", desc: "Garantizar acceso a energía asequible y sostenible" },
  { id: "ODS8",  num: 8,  titulo: "Trabajo decente y crecimiento",color: "#A21942", desc: "Fomentar el trabajo decente y el crecimiento" },
  { id: "ODS9",  num: 9,  titulo: "Industria, innovación",       color: "#FD6925", desc: "Construir infraestructuras resilientes" },
  { id: "ODS10", num: 10, titulo: "Reducción de desigualdades",  color: "#DD1367", desc: "Reducir la desigualdad en y entre los países" },
  { id: "ODS11", num: 11, titulo: "Ciudades sostenibles",        color: "#FD9D24", desc: "Lograr ciudades y comunidades sostenibles" },
  { id: "ODS12", num: 12, titulo: "Producción responsable",      color: "#BF8B2E", desc: "Garantizar modalidades de consumo sostenibles" },
  { id: "ODS13", num: 13, titulo: "Acción por el clima",         color: "#3F7E44", desc: "Adoptar medidas urgentes para combatir el cambio climático" },
  { id: "ODS14", num: 14, titulo: "Vida submarina",              color: "#0A97D9", desc: "Conservar los océanos, mares y recursos marinos" },
  { id: "ODS15", num: 15, titulo: "Vida de ecosistemas terrestres", color: "#56C02B", desc: "Gestionar sosteniblemente los bosques" },
  { id: "ODS16", num: 16, titulo: "Paz, justicia e instituciones", color: "#00689D", desc: "Promover sociedades justas, pacíficas e inclusivas" },
  { id: "ODS17", num: 17, titulo: "Alianzas para lograr los objetivos", color: "#19486A", desc: "Fortalecer los medios de implementación" },
];

const KEY = "auditor_ods";
const EMPTY: OdsData = { seleccionados: [], iniciativas: [] };

function parseLS<T>(k: string, fallback: T): T {
  try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : fallback; } catch { return fallback; }
}

export default function OdsPage() {
  const [data,       setData]       = useState<OdsData>(EMPTY);
  const [hydrated,   setHydrated]   = useState(false);
  const [expandedOds,setExpandedOds]= useState<string | null>(null);
  const [newIniciativa, setNewIniciativa] = useState({ descripcion: "", responsable: "", progreso: 0 });
  const [addingFor,  setAddingFor]  = useState<string | null>(null);

  useEffect(() => {
    setData(parseLS(KEY, EMPTY));
    setHydrated(true);
  }, []);

  function save(next: OdsData) {
    setData(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }

  function toggleOds(id: string) {
    const sel = data.seleccionados.includes(id)
      ? data.seleccionados.filter(s => s !== id)
      : [...data.seleccionados, id];
    save({ ...data, seleccionados: sel });
  }

  function addIniciativa(odsId: string) {
    if (!newIniciativa.descripcion.trim()) return;
    const item: Iniciativa = {
      id: Date.now().toString(),
      ods: odsId,
      descripcion: newIniciativa.descripcion.trim(),
      responsable: newIniciativa.responsable.trim(),
      progreso: newIniciativa.progreso,
    };
    save({ ...data, iniciativas: [...data.iniciativas, item] });
    setNewIniciativa({ descripcion: "", responsable: "", progreso: 0 });
    setAddingFor(null);
  }

  function deleteIniciativa(id: string) {
    save({ ...data, iniciativas: data.iniciativas.filter(i => i.id !== id) });
  }

  function updateProgreso(id: string, progreso: number) {
    save({ ...data, iniciativas: data.iniciativas.map(i => i.id === id ? { ...i, progreso } : i) });
  }

  if (!hydrated) return null;

  const selectedOdsList = ODS_LIST.filter(o => data.seleccionados.includes(o.id));

  return (
    <Shell>
      <div className="p-4 sm:p-8 max-w-5xl space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Globe className="text-blue-500" size={22} /> ODS — Agenda 2030
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Selecciona los Objetivos de Desarrollo Sostenible relevantes para tu organización y gestiona tus iniciativas.
          </p>
        </div>

        {/* Stats */}
        {data.seleccionados.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
              <p className="text-2xl font-extrabold text-blue-600">{data.seleccionados.length}</p>
              <p className="text-xs text-slate-400 mt-0.5">ODS seleccionados</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
              <p className="text-2xl font-extrabold text-purple-600">{data.iniciativas.length}</p>
              <p className="text-xs text-slate-400 mt-0.5">Iniciativas</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
              <p className="text-2xl font-extrabold text-green-600">
                {data.iniciativas.length > 0
                  ? Math.round(data.iniciativas.reduce((a, i) => a + i.progreso, 0) / data.iniciativas.length)
                  : 0}%
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Avance promedio</p>
            </div>
          </div>
        )}

        {/* ODS grid */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-sm font-bold text-slate-700 mb-4">Seleccionar ODS aplicables</p>
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 gap-2">
            {ODS_LIST.map(ods => {
              const sel = data.seleccionados.includes(ods.id);
              return (
                <button
                  key={ods.id}
                  onClick={() => toggleOds(ods.id)}
                  title={ods.titulo}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all active:scale-95 ${
                    sel ? "border-transparent shadow-md" : "border-slate-100 hover:border-slate-300"
                  }`}
                  style={sel ? { borderColor: ods.color, backgroundColor: ods.color + "18" } : {}}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-extrabold text-xs shrink-0"
                    style={{ backgroundColor: ods.color }}
                  >
                    {ods.num}
                  </div>
                  <p className="text-center text-[9px] leading-tight font-semibold text-slate-600 line-clamp-2">{ods.titulo}</p>
                  {sel && <CheckCircle size={10} style={{ color: ods.color }} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Iniciativas por ODS */}
        {selectedOdsList.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-bold text-slate-700">Iniciativas por ODS</p>
            {selectedOdsList.map(ods => {
              const iniciativas = data.iniciativas.filter(i => i.ods === ods.id);
              const isExpanded = expandedOds === ods.id;
              const avgProgreso = iniciativas.length > 0
                ? Math.round(iniciativas.reduce((a, i) => a + i.progreso, 0) / iniciativas.length)
                : 0;

              return (
                <div key={ods.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  {/* ODS header */}
                  <button
                    onClick={() => setExpandedOds(isExpanded ? null : ods.id)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shrink-0" style={{ backgroundColor: ods.color }}>
                      {ods.num}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm">{ods.titulo}</p>
                      <p className="text-xs text-slate-400">{iniciativas.length} iniciativa{iniciativas.length !== 1 ? "s" : ""} · {avgProgreso}% avance</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {iniciativas.length > 0 && (
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${avgProgreso}%`, backgroundColor: ods.color }} />
                        </div>
                      )}
                      {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 p-4 space-y-3">
                      {iniciativas.length === 0 && (
                        <p className="text-xs text-slate-400 italic">No hay iniciativas registradas.</p>
                      )}
                      {iniciativas.map(ini => (
                        <div key={ini.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800">{ini.descripcion}</p>
                            {ini.responsable && <p className="text-xs text-slate-400 mt-0.5">Responsable: {ini.responsable}</p>}
                            <div className="flex items-center gap-2 mt-2">
                              <input
                                type="range" min={0} max={100} value={ini.progreso}
                                onChange={e => updateProgreso(ini.id, parseInt(e.target.value))}
                                className="flex-1 h-1.5 accent-green-500"
                              />
                              <span className="text-xs font-bold text-slate-600 w-8 text-right">{ini.progreso}%</span>
                            </div>
                          </div>
                          <button onClick={() => deleteIniciativa(ini.id)} className="text-slate-300 hover:text-red-400 transition-colors shrink-0 mt-0.5">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}

                      {/* Add iniciativa */}
                      {addingFor === ods.id ? (
                        <div className="p-3 border border-slate-200 rounded-xl space-y-2">
                          <input
                            type="text"
                            placeholder="Descripción de la iniciativa"
                            value={newIniciativa.descripcion}
                            onChange={e => setNewIniciativa(p => ({ ...p, descripcion: e.target.value }))}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                          <input
                            type="text"
                            placeholder="Responsable"
                            value={newIniciativa.responsable}
                            onChange={e => setNewIniciativa(p => ({ ...p, responsable: e.target.value }))}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                          <div>
                            <label className="text-xs text-slate-500 mb-1 block">Progreso inicial: {newIniciativa.progreso}%</label>
                            <input
                              type="range" min={0} max={100} value={newIniciativa.progreso}
                              onChange={e => setNewIniciativa(p => ({ ...p, progreso: parseInt(e.target.value) }))}
                              className="w-full h-1.5 accent-green-500"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => addIniciativa(ods.id)}
                              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 rounded-xl transition-colors">
                              Agregar
                            </button>
                            <button onClick={() => { setAddingFor(null); setNewIniciativa({ descripcion: "", responsable: "", progreso: 0 }); }}
                              className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-colors">
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setAddingFor(ods.id); setNewIniciativa({ descripcion: "", responsable: "", progreso: 0 }); }}
                          className="flex items-center gap-1.5 text-xs font-semibold text-blue-500 hover:text-blue-700 transition-colors"
                        >
                          <Plus size={13} /> Agregar iniciativa
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {data.seleccionados.length === 0 && (
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-8 text-center">
            <Globe className="text-slate-300 mx-auto mb-3" size={36} />
            <p className="text-slate-500 text-sm font-semibold">Selecciona los ODS relevantes para tu empresa</p>
            <p className="text-slate-400 text-xs mt-1">Alineado a GRI 2021, CSRD y la Agenda 2030</p>
          </div>
        )}

        <p className="text-xs text-slate-400 pb-4">Alineado a GRI 2021 · CSRD · Agenda 2030 ONU</p>
      </div>
    </Shell>
  );
}
