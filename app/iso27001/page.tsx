"use client";
import { useState, useEffect, useMemo } from "react";
import Shell from "@/components/Shell";
import { Lock, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

type Estado = "si" | "parcial" | "no" | "";

const DOMINIOS = [
  {
    id: "A5", label: "A.5 Políticas de seguridad", controles: [
      { id: "5.1", texto: "Políticas de seguridad de la información definidas y aprobadas por dirección" },
    ],
  },
  {
    id: "A6", label: "A.6 Organización de la seguridad", controles: [
      { id: "6.1", texto: "Roles y responsabilidades de seguridad de la información asignados" },
      { id: "6.2", texto: "Política de dispositivos móviles y teletrabajo establecida" },
    ],
  },
  {
    id: "A7", label: "A.7 Seguridad del personal", controles: [
      { id: "7.1", texto: "Antecedentes verificados antes de la contratación" },
      { id: "7.2", texto: "Concienciación, educación y formación en seguridad impartida" },
      { id: "7.3", texto: "Proceso de desvinculación y devolución de activos definido" },
    ],
  },
  {
    id: "A8", label: "A.8 Gestión de activos", controles: [
      { id: "8.1", texto: "Inventario de activos de información actualizado" },
      { id: "8.2", texto: "Clasificación de la información implementada" },
      { id: "8.3", texto: "Procedimientos de manejo de medios removibles" },
    ],
  },
  {
    id: "A9", label: "A.9 Control de acceso", controles: [
      { id: "9.1", texto: "Política de control de acceso documentada" },
      { id: "9.2", texto: "Gestión de acceso de usuarios (altas, bajas, modificaciones)" },
      { id: "9.3", texto: "Uso de contraseñas seguras y autenticación multifactor" },
      { id: "9.4", texto: "Control de acceso a sistemas y aplicaciones" },
    ],
  },
  {
    id: "A10", label: "A.10 Criptografía", controles: [
      { id: "10.1", texto: "Política de uso de controles criptográficos y gestión de claves" },
    ],
  },
  {
    id: "A11", label: "A.11 Seguridad física y del entorno", controles: [
      { id: "11.1", texto: "Perímetros de seguridad física definidos y controlados" },
      { id: "11.2", texto: "Equipos protegidos contra amenazas físicas y ambientales" },
    ],
  },
  {
    id: "A12", label: "A.12 Seguridad en operaciones", controles: [
      { id: "12.1", texto: "Procedimientos operativos documentados y comunicados" },
      { id: "12.2", texto: "Protección contra malware implementada" },
      { id: "12.3", texto: "Copias de seguridad de la información realizadas y verificadas" },
      { id: "12.4", texto: "Registros de eventos monitorizados y protegidos" },
      { id: "12.6", texto: "Gestión de vulnerabilidades técnicas en sistemas" },
    ],
  },
  {
    id: "A13", label: "A.13 Seguridad en comunicaciones", controles: [
      { id: "13.1", texto: "Redes gestionadas y controladas para proteger información" },
      { id: "13.2", texto: "Acuerdos de transferencia de información con terceros establecidos" },
    ],
  },
  {
    id: "A14", label: "A.14 Adquisición, desarrollo y mantenimiento", controles: [
      { id: "14.1", texto: "Requisitos de seguridad incluidos en nuevos sistemas o mejoras" },
      { id: "14.2", texto: "Prácticas de desarrollo seguro establecidas" },
    ],
  },
  {
    id: "A15", label: "A.15 Relaciones con proveedores", controles: [
      { id: "15.1", texto: "Política de seguridad con proveedores y acuerdos de nivel de servicio" },
      { id: "15.2", texto: "Monitoreo y revisión de servicios de proveedores" },
    ],
  },
  {
    id: "A16", label: "A.16 Gestión de incidentes", controles: [
      { id: "16.1", texto: "Procedimiento de reporte y gestión de incidentes de seguridad" },
    ],
  },
  {
    id: "A17", label: "A.17 Continuidad del negocio", controles: [
      { id: "17.1", texto: "Plan de continuidad del negocio que incluye seguridad de la información" },
    ],
  },
  {
    id: "A18", label: "A.18 Cumplimiento", controles: [
      { id: "18.1", texto: "Requisitos legales, estatutarios y contractuales identificados" },
      { id: "18.2", texto: "Revisiones independientes de la seguridad de la información realizadas" },
    ],
  },
];

const TOTAL = DOMINIOS.flatMap(d => d.controles).length;
const SCORE_MAP: Record<string, number> = { si: 2, parcial: 1, no: 0 };
const KEY = "auditor_iso27001";

export default function Iso27001Page() {
  const [estados,  setEstados]  = useState<Record<string, Estado>>({});
  const [activoD,  setActivoD]  = useState("A5");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try { const r = localStorage.getItem(KEY); if (r) setEstados(JSON.parse(r)); } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify(estados));
  }, [estados, hydrated]);

  const set = (id: string, val: Estado) =>
    setEstados(prev => ({ ...prev, [id]: val }));

  const { globalPct, dominioPcts } = useMemo(() => {
    let totalPts = 0, totalMax = 0;
    const pcts: Record<string, number> = {};
    DOMINIOS.forEach(d => {
      const maxPts = d.controles.length * 2;
      const pts    = d.controles.reduce((a, c) => a + (SCORE_MAP[estados[c.id] ?? ""] ?? 0), 0);
      pcts[d.id]   = Math.round((pts / maxPts) * 100);
      totalPts += pts; totalMax += maxPts;
    });
    return { globalPct: totalMax > 0 ? Math.round((totalPts / totalMax) * 100) : 0, dominioPcts: pcts };
  }, [estados]);

  const respondidas  = Object.keys(estados).length;
  const level        = globalPct >= 75 ? "Maduro" : globalPct >= 50 ? "En desarrollo" : "Inicial";
  const levelColor   = globalPct >= 75 ? "text-green-400" : globalPct >= 50 ? "text-yellow-400" : "text-red-400";
  const dominioActual = DOMINIOS.find(d => d.id === activoD)!;

  if (!hydrated) return null;

  return (
    <Shell>
      <div className="p-4 sm:p-8 max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Lock className="text-green-500" size={24} /> ISO 27001 — Seguridad de la Información
            </h1>
            <p className="text-slate-500 text-sm mt-1">Gap analysis · {TOTAL} controles · Anexo A</p>
          </div>
          <div className="text-right">
            <p className={`text-3xl font-extrabold ${levelColor}`}>{globalPct}%</p>
            <p className="text-slate-500 text-xs">{level} · {respondidas}/{TOTAL}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${(respondidas/TOTAL)*100}%` }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Domain list */}
          <div className="lg:col-span-1 space-y-1">
            {DOMINIOS.map(d => {
              const pct  = dominioPcts[d.id] ?? 0;
              const done = d.controles.every(c => estados[c.id]);
              return (
                <button key={d.id} onClick={() => setActivoD(d.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2 ${
                    activoD === d.id ? "bg-slate-800 text-white font-semibold" : "text-slate-500 hover:bg-slate-100"
                  }`}>
                  {done
                    ? <CheckCircle size={13} className="text-green-500 shrink-0" />
                    : pct > 0
                    ? <AlertTriangle size={13} className="text-yellow-500 shrink-0" />
                    : <XCircle size={13} className="text-slate-300 shrink-0" />
                  }
                  <span className="truncate text-xs">{d.id} · {pct}%</span>
                </button>
              );
            })}
          </div>

          {/* Controls */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="bg-slate-800 px-5 py-3 flex justify-between items-center">
                <h2 className="text-white font-bold text-sm">{dominioActual.label}</h2>
                <span className="text-slate-400 text-xs">
                  {dominioActual.controles.filter(c => estados[c.id]).length}/{dominioActual.controles.length} evaluados
                </span>
              </div>
              <div className="divide-y divide-slate-50">
                {dominioActual.controles.map((ctrl, i) => (
                  <div key={ctrl.id} className="px-5 py-4">
                    <p className="text-slate-700 text-sm mb-3 leading-relaxed">
                      <span className="text-slate-300 text-xs mr-2 font-mono">{ctrl.id}</span>
                      {ctrl.texto}
                    </p>
                    <div className="flex gap-2">
                      {(["si","parcial","no"] as const).map(opt => (
                        <button key={opt} onClick={() => set(ctrl.id, opt)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all active:scale-95 ${
                            estados[ctrl.id] === opt
                              ? opt==="si"      ? "bg-green-500 text-white border-green-500"
                              : opt==="parcial" ? "bg-yellow-400 text-white border-yellow-400"
                                                : "bg-red-400 text-white border-red-400"
                              : "border-slate-200 text-slate-500 hover:border-slate-400 bg-white"
                          }`}>
                          {opt==="si"?"Implementado":opt==="parcial"?"Parcial":"No implementado"}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
