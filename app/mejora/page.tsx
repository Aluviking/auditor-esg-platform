"use client";
import { useState, useEffect } from "react";
import Shell from "@/components/Shell";
import { RefreshCw, Plus, Trash2, CheckCircle, AlertCircle, Clock } from "lucide-react";

type Tipo  = "No conformidad" | "Observación" | "Oportunidad de mejora";
type Estado = "Abierta" | "En proceso" | "Cerrada";

type Hallazgo = {
  id: string;
  tipo: Tipo;
  descripcion: string;
  origen: string;
  norma: string;
  responsable: string;
  fechaLimite: string;
  accionCorrectiva: string;
  estado: Estado;
  fechaCreacion: string;
};

const NORMAS = ["ISO 9001", "ISO 14001", "ISO 45001", "ISO 27001", "NOM-035", "Auditoría interna", "Otro"];
const KEY    = "auditor_mejora";

function load(): Hallazgo[] {
  try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : []; } catch { return []; }
}

const EMPTY: Omit<Hallazgo, "id"|"fechaCreacion"> = {
  tipo: "No conformidad",
  descripcion: "",
  origen: "",
  norma: "ISO 9001",
  responsable: "",
  fechaLimite: "",
  accionCorrectiva: "",
  estado: "Abierta",
};

const TIPO_COLOR: Record<Tipo, string> = {
  "No conformidad":        "bg-red-100 text-red-700",
  "Observación":           "bg-yellow-100 text-yellow-700",
  "Oportunidad de mejora": "bg-blue-100 text-blue-700",
};

const ESTADO_CONFIG: Record<Estado, { icon: typeof CheckCircle; color: string }> = {
  "Abierta":    { icon: AlertCircle, color: "text-red-500"    },
  "En proceso": { icon: Clock,       color: "text-yellow-500" },
  "Cerrada":    { icon: CheckCircle, color: "text-green-500"  },
};

export default function MejoraPage() {
  const [hallazgos, setHallazgos] = useState<Hallazgo[]>([]);
  const [hydrated,  setHydrated]  = useState(false);
  const [showForm,  setShowForm]  = useState(false);
  const [form,      setForm]      = useState(EMPTY);

  useEffect(() => { setHallazgos(load()); setHydrated(true); }, []);
  useEffect(() => { if (hydrated) localStorage.setItem(KEY, JSON.stringify(hallazgos)); }, [hallazgos, hydrated]);

  function add() {
    if (!form.descripcion.trim() || !form.responsable.trim()) return;
    setHallazgos(p => [...p, { ...form, id: Date.now().toString(), fechaCreacion: new Date().toISOString().split("T")[0] }]);
    setForm(EMPTY);
    setShowForm(false);
  }

  function toggleEstado(id: string) {
    setHallazgos(p => p.map(h => {
      if (h.id !== id) return h;
      const next: Estado = h.estado === "Abierta" ? "En proceso" : h.estado === "En proceso" ? "Cerrada" : "Abierta";
      return { ...h, estado: next };
    }));
  }

  if (!hydrated) return null;

  const abiertas   = hallazgos.filter(h => h.estado === "Abierta").length;
  const enProceso  = hallazgos.filter(h => h.estado === "En proceso").length;
  const cerradas   = hallazgos.filter(h => h.estado === "Cerrada").length;
  const today      = new Date().toISOString().split("T")[0];
  const vencidas   = hallazgos.filter(h => h.fechaLimite && h.fechaLimite < today && h.estado !== "Cerrada").length;

  return (
    <Shell>
      <div className="p-4 sm:p-8 max-w-5xl space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
              <RefreshCw className="text-blue-500" size={24} /> Mejora Continua
            </h1>
            <p className="text-slate-500 text-sm mt-1">No conformidades · Observaciones · Oportunidades de mejora</p>
          </div>
          <button onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all">
            <Plus size={15} /> Registrar hallazgo
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Abiertas",   value: abiertas,  color: "text-red-600"    },
            { label: "En proceso", value: enProceso,  color: "text-yellow-600" },
            { label: "Cerradas",   value: cerradas,   color: "text-green-600"  },
            { label: "Vencidas",   value: vencidas,   color: "text-orange-600" },
          ].map(s => (
            <div key={s.label} className="bg-white border border-slate-100 rounded-xl p-4 text-center shadow-sm">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800">Nuevo hallazgo</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-form">Tipo *</label>
                <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value as Tipo }))} className="select-form">
                  {(["No conformidad","Observación","Oportunidad de mejora"] as Tipo[]).map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label-form">Norma / Origen</label>
                <select value={form.norma} onChange={e => setForm(p => ({ ...p, norma: e.target.value }))} className="select-form">
                  {NORMAS.map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="label-form">Descripción del hallazgo *</label>
                <textarea value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
                  rows={2} placeholder="Describe el hallazgo encontrado..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition-all" />
              </div>
              <div>
                <label className="label-form">Origen / Proceso</label>
                <input type="text" value={form.origen} onChange={e => setForm(p => ({ ...p, origen: e.target.value }))}
                  placeholder="Auditoría, revisión, quejas..." className="select-form" />
              </div>
              <div>
                <label className="label-form">Responsable *</label>
                <input type="text" value={form.responsable} onChange={e => setForm(p => ({ ...p, responsable: e.target.value }))}
                  placeholder="Nombre / Cargo" className="select-form" />
              </div>
              <div>
                <label className="label-form">Fecha límite</label>
                <input type="date" value={form.fechaLimite} onChange={e => setForm(p => ({ ...p, fechaLimite: e.target.value }))}
                  className="select-form" />
              </div>
              <div>
                <label className="label-form">Estado inicial</label>
                <select value={form.estado} onChange={e => setForm(p => ({ ...p, estado: e.target.value as Estado }))} className="select-form">
                  {(["Abierta","En proceso"] as Estado[]).map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="label-form">Acción correctiva / de mejora</label>
                <textarea value={form.accionCorrectiva} onChange={e => setForm(p => ({ ...p, accionCorrectiva: e.target.value }))}
                  rows={2} placeholder="Describe la acción propuesta..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition-all" />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700">Cancelar</button>
              <button onClick={add} disabled={!form.descripcion.trim() || !form.responsable.trim()}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-semibold rounded-xl active:scale-95 transition-all">
                Guardar
              </button>
            </div>
          </div>
        )}

        {/* List */}
        {hallazgos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-14 text-center">
            <RefreshCw className="text-slate-200 mx-auto mb-3" size={44} />
            <h3 className="text-slate-500 font-semibold mb-1">Sin hallazgos registrados</h3>
            <p className="text-slate-400 text-sm">Registra no conformidades, observaciones y oportunidades de mejora.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Hallazgo</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">Norma</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Responsable</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Fecha límite</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {hallazgos.map(h => {
                  const cfg     = ESTADO_CONFIG[h.estado];
                  const Icon    = cfg.icon;
                  const vencida = h.fechaLimite && h.fechaLimite < today && h.estado !== "Cerrada";
                  return (
                    <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 max-w-[220px]">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mr-2 ${TIPO_COLOR[h.tipo]}`}>
                          {h.tipo === "No conformidad" ? "NC" : h.tipo === "Observación" ? "OBS" : "OM"}
                        </span>
                        <p className="truncate text-slate-700 font-medium mt-1">{h.descripcion}</p>
                        {h.accionCorrectiva && <p className="text-xs text-slate-400 truncate">{h.accionCorrectiva}</p>}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs hidden sm:table-cell">{h.norma}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">{h.responsable}</td>
                      <td className="px-4 py-3 text-xs hidden md:table-cell">
                        <span className={vencida ? "text-red-500 font-semibold" : "text-slate-500"}>{h.fechaLimite || "—"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleEstado(h.id)}
                          className={`flex items-center gap-1.5 text-xs font-semibold ${cfg.color} hover:opacity-70 transition-opacity`}>
                          <Icon size={13} /> {h.estado}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setHallazgos(p => p.filter(x => x.id !== h.id))}
                          className="text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Shell>
  );
}
