"use client";
import { useState, useEffect } from "react";
import Shell from "@/components/Shell";
import { BarChart2, Plus, Trash2, TrendingUp, TrendingDown } from "lucide-react";

type KPI = {
  id: string;
  name: string;
  unit: string;
  current: number;
  target: number;
  category: "ambiental" | "social" | "gobernanza" | "calidad";
};

const STORAGE_KEY = "auditor_kpis";

function loadKPIs(): KPI[] {
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
  name: "",
  unit: "",
  current: 0,
  target: 100,
  category: "ambiental" as KPI["category"],
};

export default function KPIsPage() {
  const [kpis,     setKPIs]     = useState<KPI[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState(EMPTY_FORM);

  useEffect(() => {
    setKPIs(loadKPIs());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(kpis));
  }, [kpis, hydrated]);

  function addKPI() {
    if (!form.name.trim() || !form.unit.trim()) return;
    setKPIs(p => [...p, { ...form, id: Date.now().toString() }]);
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  function updateCurrent(id: string, current: number) {
    setKPIs(p => p.map(k => k.id === id ? { ...k, current } : k));
  }

  if (!hydrated) return null;

  const onTarget = kpis.filter(k => k.target > 0 && (k.current / k.target) >= 0.8).length;

  return (
    <Shell>
      <div className="p-6 md:p-8 space-y-6 max-w-4xl">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <BarChart2 className="text-green-500" size={26} /> Indicadores KPI
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Métricas de desempeño ESG con metas anuales
            </p>
          </div>
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <Plus size={16} /> Nuevo KPI
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total KPIs",    value: kpis.length, color: "text-slate-800"  },
            { label: "En meta (≥80%)", value: onTarget,    color: "text-green-600" },
            { label: "Fuera de meta", value: kpis.length - onTarget, color: "text-red-500" },
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
            <h3 className="font-bold text-slate-800">Nuevo indicador ESG</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-500 mb-1 block">Nombre del KPI *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Ej: Emisiones CO₂ totales"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Unidad *</label>
                <input
                  value={form.unit}
                  onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}
                  placeholder="tCO₂e, %, kWh, horas..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Categoría</label>
                <select
                  value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value as KPI["category"] }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {["ambiental", "social", "gobernanza", "calidad"].map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Valor actual</label>
                <input
                  type="number"
                  value={form.current}
                  onChange={e => setForm(p => ({ ...p, current: Number(e.target.value) }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Meta anual</label>
                <input
                  type="number"
                  value={form.target}
                  onChange={e => setForm(p => ({ ...p, target: Number(e.target.value) }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowForm(false)} className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2">
                Cancelar
              </button>
              <button
                onClick={addKPI}
                className="bg-green-600 hover:bg-green-500 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        )}

        {/* KPI Grid */}
        {kpis.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <BarChart2 className="text-slate-200 mx-auto mb-3" size={48} />
            <p className="text-slate-400 text-sm">No hay KPIs registrados.</p>
            <p className="text-slate-300 text-xs mt-1">Agrega tu primer indicador con el botón &quot;Nuevo KPI&quot;</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {kpis.map(kpi => {
              const pct      = kpi.target > 0 ? Math.min(100, Math.round((kpi.current / kpi.target) * 100)) : 0;
              const good     = pct >= 80;
              return (
                <div key={kpi.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{kpi.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${CAT_COLORS[kpi.category]}`}>
                        {kpi.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {good
                        ? <TrendingUp size={16} className="text-green-500" />
                        : <TrendingDown size={16} className="text-red-400" />
                      }
                      <button
                        onClick={() => setKPIs(p => p.filter(k => k.id !== kpi.id))}
                        className="text-slate-300 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-end justify-between mb-2">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <input
                          type="number"
                          value={kpi.current}
                          onChange={e => updateCurrent(kpi.id, Number(e.target.value))}
                          className="w-20 text-2xl font-bold text-slate-800 bg-transparent border-b border-slate-200 focus:outline-none focus:border-green-500"
                        />
                        <span className="text-sm text-slate-400">{kpi.unit}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">Meta: {kpi.target} {kpi.unit}</p>
                    </div>
                    <span className={`text-lg font-bold ${good ? "text-green-600" : "text-red-500"}`}>{pct}%</span>
                  </div>

                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${good ? "bg-green-500" : "bg-red-400"}`}
                      style={{ width: `${pct}%` }}
                    />
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
