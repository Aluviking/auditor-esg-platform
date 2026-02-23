"use client";
import { useState, useEffect } from "react";
import Shell from "@/components/Shell";
import { ClipboardCheck, Plus, Trash2, CheckCircle, XCircle, MinusCircle, ChevronDown, ChevronUp } from "lucide-react";

/* ── Types ──────────────────────────────────────────────────────────────── */
type ItemStatus = "OK" | "NOK" | "NA" | "";
type CheckItem = {
  id: string;
  descripcion: string;
  norma: string;
  status: ItemStatus;
  observacion: string;
};
type Inspeccion = {
  id: string;
  titulo: string;
  fecha: string;
  area: string;
  inspector: string;
  estado: "Abierta" | "En progreso" | "Cerrada";
  items: CheckItem[];
};

const KEY = "auditor_inspecciones";

function parseLS<T>(k: string, fallback: T): T {
  try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : fallback; } catch { return fallback; }
}
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

const TEMPLATES: CheckItem[] = [
  { id: uid(), descripcion: "EPP disponible y en buen estado",           norma: "ISO 45001", status: "", observacion: "" },
  { id: uid(), descripcion: "Señalización de emergencia visible",         norma: "ISO 45001", status: "", observacion: "" },
  { id: uid(), descripcion: "Extintores vigentes y accesibles",          norma: "ISO 45001", status: "", observacion: "" },
  { id: uid(), descripcion: "Registros de capacitación actualizados",    norma: "ISO 9001",  status: "", observacion: "" },
  { id: uid(), descripcion: "Procedimientos documentados disponibles",   norma: "ISO 9001",  status: "", observacion: "" },
  { id: uid(), descripcion: "Residuos segregados correctamente",         norma: "ISO 14001", status: "", observacion: "" },
  { id: uid(), descripcion: "Derrames potenciales controlados",          norma: "ISO 14001", status: "", observacion: "" },
];

const ESTADOS: Array<Inspeccion["estado"]> = ["Abierta", "En progreso", "Cerrada"];
const ESTADO_COLORS: Record<Inspeccion["estado"], string> = {
  Abierta: "bg-blue-100 text-blue-700",
  "En progreso": "bg-yellow-100 text-yellow-700",
  Cerrada: "bg-green-100 text-green-700",
};

function calcScore(items: CheckItem[]): { ok: number; nok: number; na: number; total: number; pct: number } {
  const ok  = items.filter(i => i.status === "OK").length;
  const nok = items.filter(i => i.status === "NOK").length;
  const na  = items.filter(i => i.status === "NA").length;
  const answered = ok + nok;
  const pct = answered > 0 ? Math.round((ok / answered) * 100) : 0;
  return { ok, nok, na, total: items.length, pct };
}

export default function InspeccionesPage() {
  const [inspecciones, setInspecciones] = useState<Inspeccion[]>([]);
  const [hydrated,     setHydrated]     = useState(false);
  const [expanded,     setExpanded]     = useState<string | null>(null);
  const [showNew,      setShowNew]      = useState(false);
  const [newForm, setNewForm] = useState({ titulo: "", fecha: "", area: "", inspector: "" });

  useEffect(() => {
    setInspecciones(parseLS(KEY, []));
    setHydrated(true);
  }, []);

  function save(next: Inspeccion[]) {
    setInspecciones(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }

  function createInspeccion() {
    if (!newForm.titulo.trim()) return;
    const insp: Inspeccion = {
      id: uid(),
      titulo: newForm.titulo.trim(),
      fecha: newForm.fecha || new Date().toISOString().slice(0, 10),
      area: newForm.area.trim(),
      inspector: newForm.inspector.trim(),
      estado: "Abierta",
      items: TEMPLATES.map(t => ({ ...t, id: uid() })),
    };
    save([...inspecciones, insp]);
    setNewForm({ titulo: "", fecha: "", area: "", inspector: "" });
    setShowNew(false);
    setExpanded(insp.id);
  }

  function deleteInspeccion(id: string) {
    save(inspecciones.filter(i => i.id !== id));
  }

  function updateEstado(id: string, estado: Inspeccion["estado"]) {
    save(inspecciones.map(i => i.id === id ? { ...i, estado } : i));
  }

  function updateItemStatus(inspId: string, itemId: string, status: ItemStatus) {
    save(inspecciones.map(insp =>
      insp.id === inspId
        ? { ...insp, items: insp.items.map(it => it.id === itemId ? { ...it, status } : it) }
        : insp
    ));
  }

  function updateItemObs(inspId: string, itemId: string, obs: string) {
    save(inspecciones.map(insp =>
      insp.id === inspId
        ? { ...insp, items: insp.items.map(it => it.id === itemId ? { ...it, observacion: obs } : it) }
        : insp
    ));
  }

  function addItem(inspId: string) {
    const newItem: CheckItem = { id: uid(), descripcion: "Nuevo ítem de inspección", norma: "ISO 9001", status: "", observacion: "" };
    save(inspecciones.map(insp =>
      insp.id === inspId ? { ...insp, items: [...insp.items, newItem] } : insp
    ));
  }

  function removeItem(inspId: string, itemId: string) {
    save(inspecciones.map(insp =>
      insp.id === inspId ? { ...insp, items: insp.items.filter(it => it.id !== itemId) } : insp
    ));
  }

  if (!hydrated) return null;

  const totalAbiertas = inspecciones.filter(i => i.estado !== "Cerrada").length;
  const avgScore = inspecciones.length > 0
    ? Math.round(inspecciones.reduce((a, i) => a + calcScore(i.items).pct, 0) / inspecciones.length)
    : 0;

  return (
    <Shell>
      <div className="p-4 sm:p-8 max-w-4xl space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
              <ClipboardCheck className="text-orange-500" size={22} /> Inspecciones de Campo
            </h1>
            <p className="text-slate-500 text-sm mt-1">Checklists de verificación ISO 9001, ISO 14001, ISO 45001</p>
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
          >
            <Plus size={15} /> Nueva inspección
          </button>
        </div>

        {/* Stats */}
        {inspecciones.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
              <p className="text-2xl font-extrabold text-slate-800">{inspecciones.length}</p>
              <p className="text-xs text-slate-400 mt-0.5">Total inspecciones</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
              <p className="text-2xl font-extrabold text-yellow-500">{totalAbiertas}</p>
              <p className="text-xs text-slate-400 mt-0.5">Abiertas / En progreso</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
              <p className={`text-2xl font-extrabold ${avgScore >= 80 ? "text-green-600" : avgScore >= 60 ? "text-yellow-500" : "text-red-500"}`}>
                {avgScore}%
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Conformidad promedio</p>
            </div>
          </div>
        )}

        {/* New inspection form */}
        {showNew && (
          <div className="bg-white rounded-2xl border border-orange-200 shadow-sm p-5 space-y-3">
            <p className="font-bold text-slate-800">Nueva inspección</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">Título *</label>
                <input type="text" placeholder="Ej. Inspección de planta norte"
                  value={newForm.titulo} onChange={e => setNewForm(p => ({ ...p, titulo: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">Fecha</label>
                <input type="date" value={newForm.fecha} onChange={e => setNewForm(p => ({ ...p, fecha: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">Área</label>
                <input type="text" placeholder="Ej. Producción, Almacén..."
                  value={newForm.area} onChange={e => setNewForm(p => ({ ...p, area: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">Inspector</label>
                <input type="text" placeholder="Nombre del inspector"
                  value={newForm.inspector} onChange={e => setNewForm(p => ({ ...p, inspector: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
            </div>
            <p className="text-xs text-slate-400">Se crearán {TEMPLATES.length} ítems de verificación estándar. Puedes editarlos después.</p>
            <div className="flex gap-2">
              <button onClick={createInspeccion}
                className="flex-1 bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold py-2 rounded-xl transition-colors">
                Crear inspección
              </button>
              <button onClick={() => setShowNew(false)}
                className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold rounded-xl transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* List */}
        {inspecciones.length === 0 && !showNew ? (
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-10 text-center">
            <ClipboardCheck className="text-slate-300 mx-auto mb-3" size={40} />
            <p className="text-slate-500 font-semibold text-sm">Sin inspecciones registradas</p>
            <p className="text-slate-400 text-xs mt-1">Crea tu primera inspección de campo para comenzar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {inspecciones.map(insp => {
              const score = calcScore(insp.items);
              const isExp = expanded === insp.id;
              return (
                <div key={insp.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center gap-3 p-4">
                    <button onClick={() => setExpanded(isExp ? null : insp.id)} className="flex-1 flex items-start gap-3 text-left">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-slate-800">{insp.titulo}</p>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ESTADO_COLORS[insp.estado]}`}>
                            {insp.estado}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {insp.fecha} {insp.area && `· ${insp.area}`} {insp.inspector && `· ${insp.inspector}`}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                            <CheckCircle size={11} /> {score.ok} OK
                          </div>
                          <div className="flex items-center gap-1 text-xs text-red-500 font-semibold">
                            <XCircle size={11} /> {score.nok} NOK
                          </div>
                          <div className="flex items-center gap-1 text-xs text-slate-400 font-semibold">
                            <MinusCircle size={11} /> {score.na} N/A
                          </div>
                          <div className="ml-auto flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${score.pct >= 80 ? "bg-green-500" : score.pct >= 60 ? "bg-yellow-400" : "bg-red-400"}`}
                                style={{ width: `${score.pct}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-600">{score.pct}%</span>
                          </div>
                        </div>
                      </div>
                      {isExp ? <ChevronUp size={16} className="text-slate-400 shrink-0 mt-1" /> : <ChevronDown size={16} className="text-slate-400 shrink-0 mt-1" />}
                    </button>
                    <button onClick={() => deleteInspeccion(insp.id)} className="text-slate-200 hover:text-red-400 transition-colors shrink-0">
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Expanded checklist */}
                  {isExp && (
                    <div className="border-t border-slate-100">
                      {/* Estado control */}
                      <div className="px-4 py-3 bg-slate-50 flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500 mr-1">Estado:</span>
                        {ESTADOS.map(est => (
                          <button key={est} onClick={() => updateEstado(insp.id, est)}
                            className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${
                              insp.estado === est ? ESTADO_COLORS[est] : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                            }`}>
                            {est}
                          </button>
                        ))}
                      </div>

                      {/* Items */}
                      <div className="p-4 space-y-2">
                        {insp.items.map(item => (
                          <div key={item.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm text-slate-800 font-semibold">{item.descripcion}</p>
                                <span className="text-[10px] font-bold text-slate-400 border border-slate-200 rounded px-1">{item.norma}</span>
                              </div>
                              {item.status === "NOK" && (
                                <input
                                  type="text"
                                  placeholder="Observación / hallazgo"
                                  value={item.observacion}
                                  onChange={e => updateItemObs(insp.id, item.id, e.target.value)}
                                  className="mt-1.5 w-full border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300"
                                />
                              )}
                            </div>
                            {/* Status buttons */}
                            <div className="flex gap-1 shrink-0">
                              {(["OK", "NOK", "NA"] as ItemStatus[]).map(s => (
                                <button key={s} onClick={() => updateItemStatus(insp.id, item.id, item.status === s ? "" : s)}
                                  className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors ${
                                    item.status === s
                                      ? s === "OK" ? "bg-green-500 text-white"
                                        : s === "NOK" ? "bg-red-500 text-white"
                                        : "bg-slate-400 text-white"
                                      : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                                  }`}>
                                  {s}
                                </button>
                              ))}
                              <button onClick={() => removeItem(insp.id, item.id)} className="text-slate-200 hover:text-red-400 transition-colors ml-0.5">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                        <button onClick={() => addItem(insp.id)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-orange-500 hover:text-orange-700 mt-1">
                          <Plus size={13} /> Agregar ítem
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <p className="text-xs text-slate-400 pb-4">ISO 9001 · ISO 14001 · ISO 45001</p>
      </div>
    </Shell>
  );
}
