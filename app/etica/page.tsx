"use client";
import { useState, useEffect } from "react";
import Shell from "@/components/Shell";
import { Shield, Plus, EyeOff, CheckCircle, Clock, AlertCircle, Trash2 } from "lucide-react";

type Categoria = "Fraude" | "Acoso" | "Corrupción" | "Conflicto de interés" | "Discriminación" | "Otro";
type Estado    = "Recibida" | "En investigación" | "Resuelta" | "Desestimada";

type Reporte = {
  id: string;
  folio: string;
  categoria: Categoria;
  descripcion: string;
  fecha: string;
  estado: Estado;
  anonimo: boolean;
  notificante?: string;
  resolucion?: string;
};

const KEY = "auditor_etica";

function load(): Reporte[] {
  try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : []; } catch { return []; }
}

function genFolio(): string {
  return "ETI-" + Date.now().toString().slice(-6);
}

const ESTADO_CONFIG: Record<Estado, { icon: typeof CheckCircle; color: string; bg: string }> = {
  "Recibida":         { icon: AlertCircle, color: "text-blue-700",   bg: "bg-blue-100"   },
  "En investigación": { icon: Clock,       color: "text-yellow-700", bg: "bg-yellow-100" },
  "Resuelta":         { icon: CheckCircle, color: "text-green-700",  bg: "bg-green-100"  },
  "Desestimada":      { icon: EyeOff,      color: "text-slate-500",  bg: "bg-slate-100"  },
};

const CAT_COLORS: Record<Categoria, string> = {
  "Fraude":              "bg-red-100 text-red-700",
  "Acoso":               "bg-pink-100 text-pink-700",
  "Corrupción":          "bg-orange-100 text-orange-700",
  "Conflicto de interés":"bg-purple-100 text-purple-700",
  "Discriminación":      "bg-yellow-100 text-yellow-700",
  "Otro":                "bg-slate-100 text-slate-600",
};

export default function EticaPage() {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [categoria,    setCat]  = useState<Categoria>("Fraude");
  const [descripcion,  setDesc] = useState("");
  const [anonimo,      setAnon] = useState(true);
  const [notificante,  setNot]  = useState("");

  useEffect(() => { setReportes(load()); setHydrated(true); }, []);
  useEffect(() => { if (hydrated) localStorage.setItem(KEY, JSON.stringify(reportes)); }, [reportes, hydrated]);

  function submit() {
    if (!descripcion.trim()) return;
    setReportes(p => [...p, {
      id: Date.now().toString(),
      folio: genFolio(),
      categoria,
      descripcion,
      fecha: new Date().toISOString().split("T")[0],
      estado: "Recibida",
      anonimo,
      notificante: anonimo ? undefined : notificante,
    }]);
    setDesc(""); setNot(""); setAnon(true); setShowForm(false);
  }

  function avanzarEstado(id: string) {
    const order: Estado[] = ["Recibida","En investigación","Resuelta"];
    setReportes(p => p.map(r => {
      if (r.id !== id) return r;
      const idx  = order.indexOf(r.estado);
      const next = idx < order.length - 1 ? order[idx + 1] : r.estado;
      return { ...r, estado: next };
    }));
  }

  if (!hydrated) return null;

  const recibidas   = reportes.filter(r => r.estado === "Recibida").length;
  const investigando = reportes.filter(r => r.estado === "En investigación").length;
  const resueltas   = reportes.filter(r => r.estado === "Resuelta").length;

  return (
    <Shell>
      <div className="p-4 sm:p-8 max-w-4xl space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Shield className="text-indigo-500" size={24} /> Canal Ético
            </h1>
            <p className="text-slate-500 text-sm mt-1">ISO 37001 · ISO 37301 · Denuncias anónimas y confidenciales</p>
          </div>
          <button onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all">
            <Plus size={15} /> Nueva denuncia
          </button>
        </div>

        {/* Banner */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex items-start gap-4">
          <EyeOff className="text-indigo-400 shrink-0 mt-0.5" size={22} />
          <div>
            <p className="font-semibold text-indigo-800 text-sm">Canal de denuncia confidencial</p>
            <p className="text-indigo-600 text-sm mt-0.5">
              Todas las denuncias se gestionan con confidencialidad. Puedes reportar de forma anónima.
              Las represalias contra denunciantes están prohibidas.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Recibidas",   value: recibidas,   color: "text-blue-600"   },
            { label: "En proceso",  value: investigando, color: "text-yellow-600" },
            { label: "Resueltas",   value: resueltas,   color: "text-green-600"  },
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
            <h3 className="font-bold text-slate-800">Registrar denuncia o reporte ético</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-form">Categoría</label>
                <select value={categoria} onChange={e => setCat(e.target.value as Categoria)} className="select-form">
                  {(["Fraude","Acoso","Corrupción","Conflicto de interés","Discriminación","Otro"] as Categoria[]).map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3 pt-5">
                <input type="checkbox" id="anon" checked={anonimo} onChange={e => setAnon(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600" />
                <label htmlFor="anon" className="text-sm text-slate-600 font-medium cursor-pointer">
                  Reportar de forma anónima
                </label>
              </div>
              {!anonimo && (
                <div className="sm:col-span-2">
                  <label className="label-form">Tu nombre (opcional)</label>
                  <input type="text" value={notificante} onChange={e => setNot(e.target.value)}
                    placeholder="Solo visible para el administrador ético"
                    className="select-form" />
                </div>
              )}
              <div className="sm:col-span-2">
                <label className="label-form">Descripción de los hechos *</label>
                <textarea value={descripcion} onChange={e => setDesc(e.target.value)} rows={4}
                  placeholder="Describe los hechos con la mayor cantidad de detalles posible (fechas, personas involucradas, evidencias)..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none transition-all" />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700">Cancelar</button>
              <button onClick={submit} disabled={!descripcion.trim()}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-semibold rounded-xl active:scale-95 transition-all">
                Enviar denuncia
              </button>
            </div>
          </div>
        )}

        {/* List */}
        {reportes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-14 text-center">
            <Shield className="text-slate-200 mx-auto mb-3" size={44} />
            <h3 className="text-slate-500 font-semibold mb-1">Sin reportes registrados</h3>
            <p className="text-slate-400 text-sm">Los reportes éticos se gestionan con total confidencialidad.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reportes.map(r => {
              const cfg  = ESTADO_CONFIG[r.estado];
              const Icon = cfg.icon;
              return (
                <div key={r.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-mono text-slate-400">{r.folio}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CAT_COLORS[r.categoria]}`}>{r.categoria}</span>
                        {r.anonimo && (
                          <span className="text-xs text-slate-400 flex items-center gap-1"><EyeOff size={10} /> Anónimo</span>
                        )}
                      </div>
                      <p className="text-slate-700 text-sm leading-relaxed">{r.descripcion}</p>
                      <p className="text-xs text-slate-400 mt-1">{r.fecha}{r.notificante ? ` · ${r.notificante}` : ""}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <button onClick={() => avanzarEstado(r.id)}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color} hover:opacity-70 transition-opacity`}>
                        <Icon size={12} /> {r.estado}
                      </button>
                      <button onClick={() => setReportes(p => p.filter(x => x.id !== r.id))}
                        className="text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 size={13} />
                      </button>
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
