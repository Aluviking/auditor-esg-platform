"use client";
import { useState, useEffect } from "react";
import Shell from "@/components/Shell";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";

type Risk = {
  id: string;
  name: string;
  category: "ambiental" | "social" | "gobernanza" | "operacional";
  probability: number;
  impact: number;
  mitigation: string;
};

const STORAGE_KEY = "auditor_riesgos";

function loadRisks(): Risk[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

const EMPTY_FORM = {
  name: "",
  category: "ambiental" as Risk["category"],
  probability: 3,
  impact: 3,
  mitigation: "",
};

function riskLevel(score: number) {
  if (score >= 15) return { label: "Crítico",  color: "text-red-700",    bg: "bg-red-100"    };
  if (score >= 10) return { label: "Alto",     color: "text-orange-700", bg: "bg-orange-100" };
  if (score >= 5)  return { label: "Medio",    color: "text-yellow-700", bg: "bg-yellow-100" };
  return               { label: "Bajo",     color: "text-green-700",  bg: "bg-green-100"  };
}

export default function RiesgosPage() {
  const [risks,    setRisks]    = useState<Risk[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState(EMPTY_FORM);

  useEffect(() => {
    setRisks(loadRisks());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(risks));
  }, [risks, hydrated]);

  function addRisk() {
    if (!form.name.trim()) return;
    setRisks(p => [...p, { ...form, id: Date.now().toString() }]);
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  const critical = risks.filter(r => r.probability * r.impact >= 15).length;
  const high     = risks.filter(r => { const s = r.probability * r.impact; return s >= 10 && s < 15; }).length;

  if (!hydrated) return null;

  return (
    <Shell>
      <div className="p-6 md:p-8 space-y-6 max-w-4xl">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <AlertTriangle className="text-orange-500" size={26} /> Gestión de Riesgos
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Matriz de riesgos ESG · ISO 31000
            </p>
          </div>
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <Plus size={16} /> Nuevo riesgo
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total riesgos", value: risks.length, color: "text-slate-800"   },
            { label: "Críticos",      value: critical,     color: "text-red-600"     },
            { label: "Altos",         value: high,         color: "text-orange-500"  },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex gap-3 flex-wrap">
          {[
            { label: "Bajo (1-4)",    bg: "bg-green-100",  text: "text-green-700"  },
            { label: "Medio (5-9)",   bg: "bg-yellow-100", text: "text-yellow-700" },
            { label: "Alto (10-14)",  bg: "bg-orange-100", text: "text-orange-700" },
            { label: "Crítico (15+)", bg: "bg-red-100",    text: "text-red-700"    },
          ].map(l => (
            <span key={l.label} className={`text-xs px-3 py-1 rounded-full font-medium ${l.bg} ${l.text}`}>
              {l.label}
            </span>
          ))}
          <span className="text-xs text-slate-400 self-center">Probabilidad × Impacto</span>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-800">Nuevo riesgo ESG</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-500 mb-1 block">Descripción del riesgo *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Ej: Incumplimiento de regulación ambiental"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Categoría</label>
                <select
                  value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value as Risk["category"] }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {["ambiental", "social", "gobernanza", "operacional"].map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div />
              <div>
                <label className="text-xs text-slate-500 mb-1 block">
                  Probabilidad: <strong>{form.probability}</strong>/5
                </label>
                <input
                  type="range" min={1} max={5} step={1}
                  value={form.probability}
                  onChange={e => setForm(p => ({ ...p, probability: Number(e.target.value) }))}
                  className="w-full accent-green-500"
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Muy baja</span><span>Muy alta</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">
                  Impacto: <strong>{form.impact}</strong>/5
                </label>
                <input
                  type="range" min={1} max={5} step={1}
                  value={form.impact}
                  onChange={e => setForm(p => ({ ...p, impact: Number(e.target.value) }))}
                  className="w-full accent-green-500"
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Mínimo</span><span>Máximo</span>
                </div>
              </div>

              {/* Live score preview */}
              <div className="sm:col-span-2 flex items-center gap-3">
                <span className="text-sm text-slate-500">Score calculado:</span>
                {(() => {
                  const score = form.probability * form.impact;
                  const lvl   = riskLevel(score);
                  return (
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${lvl.bg} ${lvl.color}`}>
                      {score}/25 — {lvl.label}
                    </span>
                  );
                })()}
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs text-slate-500 mb-1 block">Plan de mitigación</label>
                <textarea
                  value={form.mitigation}
                  onChange={e => setForm(p => ({ ...p, mitigation: e.target.value }))}
                  placeholder="Describe las acciones para reducir este riesgo..."
                  rows={2}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowForm(false)} className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2">
                Cancelar
              </button>
              <button
                onClick={addRisk}
                className="bg-green-600 hover:bg-green-500 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        )}

        {/* Risk list */}
        {risks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <AlertTriangle className="text-slate-200 mx-auto mb-3" size={48} />
            <p className="text-slate-400 text-sm">No hay riesgos registrados.</p>
            <p className="text-slate-300 text-xs mt-1">Agrega tu primer riesgo con el botón &quot;Nuevo riesgo&quot;</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...risks]
              .sort((a, b) => (b.probability * b.impact) - (a.probability * a.impact))
              .map(risk => {
                const score = risk.probability * risk.impact;
                const level = riskLevel(score);
                return (
                  <div key={risk.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-slate-800 text-sm">{risk.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${level.bg} ${level.color}`}>
                            {level.label} · {score}/25
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                            {risk.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                          <span>Probabilidad: <strong className="text-slate-600">{risk.probability}</strong>/5</span>
                          <span>Impacto: <strong className="text-slate-600">{risk.impact}</strong>/5</span>
                        </div>
                        {risk.mitigation && (
                          <p className="text-xs text-slate-500 mt-2 bg-slate-50 rounded-lg p-2 leading-relaxed">
                            {risk.mitigation}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setRisks(p => p.filter(r => r.id !== risk.id))}
                        className="text-slate-300 hover:text-red-400 transition-colors ml-3 shrink-0 mt-0.5"
                      >
                        <Trash2 size={15} />
                      </button>
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
