"use client";
import { useState, useEffect } from "react";
import Shell from "@/components/Shell";
import { GraduationCap, Plus, Trash2, CheckCircle, Clock, XCircle, Users } from "lucide-react";

/* ── Types ──────────────────────────────────────────────────────────────── */
type Estado = "Planificada" | "Realizada" | "Cancelada";
type Sesion = {
  id: string;
  titulo: string;
  fecha: string;
  facilitador: string;
  area: string;
  norma: string;
  horas: number;
  participantes: number;
  estado: Estado;
  descripcion: string;
};

const KEY = "auditor_capacitacion";
const ESTADOS: Estado[] = ["Planificada", "Realizada", "Cancelada"];
const ESTADO_CONFIG: Record<Estado, { color: string; icon: typeof CheckCircle }> = {
  Planificada: { color: "bg-blue-100 text-blue-700",   icon: Clock },
  Realizada:   { color: "bg-green-100 text-green-700", icon: CheckCircle },
  Cancelada:   { color: "bg-red-100 text-red-500",     icon: XCircle },
};
const NORMAS = ["ISO 9001", "ISO 14001", "ISO 45001", "ISO 27001", "NOM-035", "GRI 2021", "General"];
const AREAS  = ["Operaciones", "RRHH", "TI", "Calidad", "Seguridad", "Dirección", "Compras", "Mantenimiento"];

function parseLS<T>(k: string, fallback: T): T {
  try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : fallback; } catch { return fallback; }
}
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

const EMPTY_FORM = { titulo: "", fecha: "", facilitador: "", area: "", norma: "ISO 9001", horas: 4, participantes: 10, estado: "Planificada" as Estado, descripcion: "" };

export default function CapacitacionPage() {
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [hydrated,  setHydrated] = useState(false);
  const [showNew,   setShowNew]  = useState(false);
  const [form,      setForm]     = useState(EMPTY_FORM);
  const [filter,    setFilter]   = useState<Estado | "Todas">("Todas");

  useEffect(() => {
    setSesiones(parseLS(KEY, []));
    setHydrated(true);
  }, []);

  function save(next: Sesion[]) {
    setSesiones(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }

  function createSesion() {
    if (!form.titulo.trim()) return;
    const s: Sesion = {
      id: uid(),
      titulo: form.titulo.trim(),
      fecha: form.fecha || new Date().toISOString().slice(0, 10),
      facilitador: form.facilitador.trim(),
      area: form.area,
      norma: form.norma,
      horas: form.horas,
      participantes: form.participantes,
      estado: form.estado,
      descripcion: form.descripcion.trim(),
    };
    save([...sesiones, s]);
    setForm(EMPTY_FORM);
    setShowNew(false);
  }

  function deleteSesion(id: string) {
    save(sesiones.filter(s => s.id !== id));
  }

  function changeEstado(id: string, estado: Estado) {
    save(sesiones.map(s => s.id === id ? { ...s, estado } : s));
  }

  if (!hydrated) return null;

  const filtered = filter === "Todas" ? sesiones : sesiones.filter(s => s.estado === filter);

  const totalHoras = sesiones.filter(s => s.estado === "Realizada").reduce((a, s) => a + s.horas, 0);
  const totalParticipantes = sesiones.filter(s => s.estado === "Realizada").reduce((a, s) => a + s.participantes, 0);
  const realizadas = sesiones.filter(s => s.estado === "Realizada").length;
  const planificadas = sesiones.filter(s => s.estado === "Planificada").length;

  return (
    <Shell>
      <div className="p-4 sm:p-8 max-w-4xl space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
              <GraduationCap className="text-indigo-500" size={22} /> Capacitación y Competencias
            </h1>
            <p className="text-slate-500 text-sm mt-1">Gestión de formación ISO 9001 / ISO 45001 / NOM-035</p>
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
          >
            <Plus size={15} /> Nueva sesión
          </button>
        </div>

        {/* KPIs */}
        {sesiones.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
              <p className="text-2xl font-extrabold text-indigo-600">{realizadas}</p>
              <p className="text-xs text-slate-400 mt-0.5">Sesiones realizadas</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
              <p className="text-2xl font-extrabold text-blue-500">{planificadas}</p>
              <p className="text-xs text-slate-400 mt-0.5">Planificadas</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
              <p className="text-2xl font-extrabold text-green-600">{totalHoras}</p>
              <p className="text-xs text-slate-400 mt-0.5">Horas impartidas</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
              <p className="text-2xl font-extrabold text-purple-600">{totalParticipantes}</p>
              <p className="text-xs text-slate-400 mt-0.5">Participantes totales</p>
            </div>
          </div>
        )}

        {/* New session form */}
        {showNew && (
          <div className="bg-white rounded-2xl border border-indigo-200 shadow-sm p-5 space-y-4">
            <p className="font-bold text-slate-800">Nueva sesión de capacitación</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">Título *</label>
                <input type="text" placeholder="Ej. Introducción a ISO 14001 — Gestión Ambiental"
                  value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">Fecha</label>
                <input type="date" value={form.fecha} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">Facilitador</label>
                <input type="text" placeholder="Nombre del instructor"
                  value={form.facilitador} onChange={e => setForm(p => ({ ...p, facilitador: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">Área</label>
                <select value={form.area} onChange={e => setForm(p => ({ ...p, area: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
                  <option value="">Seleccionar...</option>
                  {AREAS.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">Norma asociada</label>
                <select value={form.norma} onChange={e => setForm(p => ({ ...p, norma: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
                  {NORMAS.map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">Duración (horas)</label>
                <input type="number" min={1} max={40} value={form.horas}
                  onChange={e => setForm(p => ({ ...p, horas: parseInt(e.target.value) || 1 }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">N° participantes</label>
                <input type="number" min={1} value={form.participantes}
                  onChange={e => setForm(p => ({ ...p, participantes: parseInt(e.target.value) || 1 }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">Estado inicial</label>
                <select value={form.estado} onChange={e => setForm(p => ({ ...p, estado: e.target.value as Estado }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
                  {ESTADOS.map(e => <option key={e}>{e}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">Descripción / Objetivos</label>
                <textarea placeholder="Objetivos de aprendizaje, temario..." rows={2}
                  value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={createSesion}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold py-2 rounded-xl transition-colors">
                Registrar sesión
              </button>
              <button onClick={() => { setShowNew(false); setForm(EMPTY_FORM); }}
                className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold rounded-xl transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Filter tabs */}
        {sesiones.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {(["Todas", ...ESTADOS] as Array<"Todas" | Estado>).map(est => (
              <button key={est} onClick={() => setFilter(est)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                  filter === est ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}>
                {est} {est !== "Todas" && `(${sesiones.filter(s => s.estado === est).length})`}
              </button>
            ))}
          </div>
        )}

        {/* Sessions list */}
        {filtered.length === 0 && !showNew ? (
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-10 text-center">
            <GraduationCap className="text-slate-300 mx-auto mb-3" size={40} />
            <p className="text-slate-500 font-semibold text-sm">Sin sesiones registradas</p>
            <p className="text-slate-400 text-xs mt-1">Registra tus capacitaciones para llevar el control por ISO</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(sesion => {
              const cfg = ESTADO_CONFIG[sesion.estado];
              const StatusIcon = cfg.icon;
              return (
                <div key={sesion.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-slate-800 text-sm">{sesion.titulo}</p>
                        <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>
                          <StatusIcon size={10} /> {sesion.estado}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 border border-slate-200 rounded px-1.5">{sesion.norma}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                        <span>{sesion.fecha}</span>
                        {sesion.area && <span>· {sesion.area}</span>}
                        {sesion.facilitador && <span>· {sesion.facilitador}</span>}
                        <span className="flex items-center gap-1"><Clock size={10} /> {sesion.horas}h</span>
                        <span className="flex items-center gap-1"><Users size={10} /> {sesion.participantes} participantes</span>
                      </div>
                      {sesion.descripcion && (
                        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{sesion.descripcion}</p>
                      )}
                      {/* State changer */}
                      <div className="flex gap-1.5 mt-3">
                        {ESTADOS.map(est => (
                          <button key={est} onClick={() => changeEstado(sesion.id, est)}
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${
                              sesion.estado === est
                                ? ESTADO_CONFIG[est].color
                                : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                            }`}>
                            {est}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => deleteSesion(sesion.id)} className="text-slate-200 hover:text-red-400 transition-colors shrink-0">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-xs text-slate-400 pb-4">ISO 9001 cláusula 7.2 · ISO 45001 cláusula 7.2 · NOM-035 · GRI 404</p>
      </div>
    </Shell>
  );
}
