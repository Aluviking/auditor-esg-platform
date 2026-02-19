"use client";
import Shell from "@/components/Shell";
import { ShieldCheck, ClipboardX } from "lucide-react";
import { useState } from "react";

type Hallazgo = {
  id: string;
  tipo: string;
  desc: string;
  norma: string;
  estado: string;
  responsable: string;
  fecha: string;
};

const TIPO_STYLE: Record<string, string> = {
  "No Conformidad": "bg-red-100 text-red-700",
  "Observación":    "bg-yellow-100 text-yellow-700",
  "Oportunidad":    "bg-blue-100 text-blue-700",
};

const ESTADO_COLOR: Record<string, string> = {
  Abierto:      "text-red-500",
  "En proceso": "text-yellow-500",
  Cerrado:      "text-green-500",
};

export default function AuditoriaPage() {
  const [hallazgos] = useState<Hallazgo[]>([]);

  const abiertos  = hallazgos.filter(h => h.estado === "Abierto").length;
  const enProceso = hallazgos.filter(h => h.estado === "En proceso").length;
  const cerrados  = hallazgos.filter(h => h.estado === "Cerrado").length;

  return (
    <Shell>
      <div className="p-8 space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="text-green-500" size={26} />
              Módulo de Auditoría
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Hallazgos, no conformidades y planes de acción · ISO 14001 §9.2
            </p>
          </div>
          <button
            disabled
            title="Próximamente disponible"
            className="bg-green-600 opacity-50 cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-xl"
          >
            + Nuevo hallazgo
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
            <p className="text-3xl font-bold text-red-400">{abiertos || "—"}</p>
            <p className="text-xs text-slate-500 mt-1">No conformidades abiertas</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-5">
            <p className="text-3xl font-bold text-yellow-400">{enProceso || "—"}</p>
            <p className="text-xs text-slate-500 mt-1">Hallazgos en proceso</p>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
            <p className="text-3xl font-bold text-green-400">{cerrados || "—"}</p>
            <p className="text-xs text-slate-500 mt-1">Hallazgos cerrados</p>
          </div>
        </div>

        {/* Empty state */}
        {hallazgos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 text-center">
            <ClipboardX className="text-slate-300 mx-auto mb-4" size={48} />
            <h3 className="text-slate-600 font-semibold mb-1">Sin hallazgos registrados</h3>
            <p className="text-slate-400 text-sm max-w-xs mx-auto">
              Aquí registrarás los hallazgos de tus auditorías internas: no conformidades,
              observaciones y oportunidades de mejora con sus planes de acción.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {["No Conformidades", "Observaciones", "Planes de acción", "Mejora continua"].map(t => (
                <span key={t} className="text-xs text-slate-400 border border-slate-200 rounded-full px-3 py-1">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {hallazgos.map((h) => (
              <div key={h.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-mono text-xs text-slate-400">{h.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${TIPO_STYLE[h.tipo] ?? ""}`}>
                    {h.tipo}
                  </span>
                  <span className="text-xs border border-slate-200 px-2 py-0.5 rounded-full text-slate-400">
                    {h.norma}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-800">{h.desc}</p>
                <div className="flex gap-4 mt-2 text-xs text-slate-400">
                  <span>Responsable: <span className="text-slate-600">{h.responsable}</span></span>
                  <span>Fecha: {h.fecha}</span>
                  <span className={`font-semibold ${ESTADO_COLOR[h.estado] ?? ""}`}>{h.estado}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
