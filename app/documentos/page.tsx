"use client";
import Shell from "@/components/Shell";
import { FileText, Upload, FolderOpen } from "lucide-react";
import { useState } from "react";

type Doc = {
  id: number;
  name: string;
  norm: string;
  status: string;
  date: string;
  owner: string;
};

const STATUS_STYLE: Record<string, string> = {
  Vigente:  "bg-green-100 text-green-700",
  Revisión: "bg-yellow-100 text-yellow-700",
  Vencido:  "bg-red-100 text-red-700",
};

export default function DocumentosPage() {
  const [docs] = useState<Doc[]>([]);

  return (
    <Shell>
      <div className="p-8 space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="text-green-500" size={26} />
              Control Documental
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              ISO 9001 Cláusula 7.5 · Versiones, aprobaciones y trazabilidad
            </p>
          </div>
          <button
            disabled
            title="Próximamente disponible"
            className="flex items-center gap-2 bg-green-600 opacity-50 cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-xl"
          >
            <Upload size={16} /> Subir documento
          </button>
        </div>

        {/* Stats vacíos */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total documentos",      value: "—" },
            { label: "Por vencer (30 días)",  value: "—" },
            { label: "Vigentes",              value: "—" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <p className="text-2xl font-bold text-slate-300">{value}</p>
              <p className="text-xs text-slate-400 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {docs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 text-center">
            <FolderOpen className="text-slate-300 mx-auto mb-4" size={48} />
            <h3 className="text-slate-600 font-semibold mb-1">Sin documentos registrados</h3>
            <p className="text-slate-400 text-sm max-w-xs mx-auto">
              Aquí aparecerán los documentos que subas: políticas, procedimientos,
              registros y evidencias requeridos por tus normas de referencia.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {["Política Ambiental", "Manual de Calidad", "Procedimientos", "Registros ISO"].map(t => (
                <span key={t} className="text-xs text-slate-400 border border-slate-200 rounded-full px-3 py-1">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                  <th className="px-5 py-3 text-left">Documento</th>
                  <th className="px-5 py-3 text-left">Norma</th>
                  <th className="px-5 py-3 text-left">Estado</th>
                  <th className="px-5 py-3 text-left">Revisión</th>
                  <th className="px-5 py-3 text-left">Responsable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {docs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-800">{doc.name}</td>
                    <td className="px-5 py-3 text-xs text-slate-500">{doc.norm}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[doc.status] ?? ""}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{doc.date}</td>
                    <td className="px-5 py-3 text-slate-500">{doc.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Shell>
  );
}
