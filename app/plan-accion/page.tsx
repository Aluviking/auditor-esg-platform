"use client";
import { useState, useEffect } from "react";
import Shell from "@/components/Shell";
import { Target, Plus, Trash2, CheckCircle, Clock, AlertCircle } from "lucide-react";

type Action = {
  id: string;
  title: string;
  responsible: string;
  dueDate: string;
  progress: number;
  category: "ambiental" | "social" | "gobernanza" | "calidad";
};

const STORAGE_KEY = "auditor_plan";

function loadActions(): Action[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

const CAT_COLORS: Record<string, string> = {
  ambiental:  "bg-green-100 text-green-700",
  social:     "bg-blue-100 text-blue-700",
  gobernanza: "bg-purple-100 text-purple-700",
  calidad:    "bg-orange-100 text-orange-700",
};

const EMPTY_FORM = {
  title: "",
  responsible: "",
  dueDate: "",
  category: "ambiental" as Action["category"],
};

export default function PlanAccionPage() {
  const [actions,  setActions]  = useState<Action[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState(EMPTY_FORM);

  useEffect(() => {
    setActions(loadActions());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(actions));
  }, [actions, hydrated]);

  function addAction() {
    if (!form.title.trim() || !form.responsible.trim() || !form.dueDate) return;
    setActions(p => [...p, { ...form, id: Date.now().toString(), progress: 0 }]);
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  function updateProgress(id: string, progress: number) {
    setActions(p => p.map(a => a.id === id ? { ...a, progress } : a));
  }

  function deleteAction(id: string) {
    if (!window.confirm("¿Eliminar esta acción?")) return;
    setActions(p => p.filter(a => a.id !== id));
  }

  const today     = new Date().toISOString().split("T")[0];
  const completed = actions.filter(a => a.progress === 100).length;
  const overdue   = actions.filter(a => a.dueDate < today && a.progress < 100).length;

  if (!hydrated) return null;

  return (
    <Shell>
      <div className="p-6 md:p-8 space-y-6 max-w-4xl">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Target className="text-green-500" size={26} /> Plan de Acción
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Seguimiento de compromisos ESG con responsables y fechas
            </p>
          </div>
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <Plus size={16} /> Nueva acción
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total acciones", value: actions.length, color: "text-slate-800"  },
            { label: "Completadas",    value: completed,       color: "text-green-600" },
            { label: "Vencidas",       value: overdue,         color: "text-red-500"   },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-800">Nueva acción ESG</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-500 mb-1 block">Descripción *</label>
                <input
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Ej: Implementar política ambiental"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Responsable *</label>
                <input
                  value={form.responsible}
                  onChange={e => setForm(p => ({ ...p, responsible: e.target.value }))}
                  placeholder="Nombre o Área"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Fecha límite *</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Categoría</label>
                <select
                  value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value as Action["category"] }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {["ambiental", "social", "gobernanza", "calidad"].map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowForm(false)} className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2">
                Cancelar
              </button>
              <button
                onClick={addAction}
                className="bg-green-600 hover:bg-green-500 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        )}

        {/* List */}
        {actions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <Target className="text-slate-200 mx-auto mb-3" size={48} />
            <p className="text-slate-400 text-sm">No hay acciones registradas.</p>
            <p className="text-slate-300 text-xs mt-1">Crea tu primera acción con el botón &quot;Nueva acción&quot;</p>
          </div>
        ) : (
          <div className="space-y-3">
            {actions.map(action => {
              const isOverdue = action.dueDate < today && action.progress < 100;
              const barColor  = action.progress === 100 ? "bg-green-500" : isOverdue ? "bg-red-400" : "bg-blue-500";
              return (
                <div key={action.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-slate-800 text-sm">{action.title}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CAT_COLORS[action.category]}`}>
                          {action.category}
                        </span>
                        {isOverdue && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 flex items-center gap-1 font-medium">
                            <AlertCircle size={10} /> Vencida
                          </span>
                        )}
                        {action.progress === 100 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1 font-medium">
                            <CheckCircle size={10} /> Completada
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                        <span>👤 {action.responsible}</span>
                        <span className="flex items-center gap-1"><Clock size={10} /> {action.dueDate}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteAction(action.id)}
                      className="text-slate-300 hover:text-red-400 transition-colors ml-2 shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${action.progress}%` }} />
                    </div>
                    <input
                      type="range" min={0} max={100} step={10}
                      value={action.progress}
                      onChange={e => updateProgress(action.id, Number(e.target.value))}
                      className="w-24 accent-green-500"
                    />
                    <span className="text-xs font-bold text-slate-600 w-8 text-right">{action.progress}%</span>
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
