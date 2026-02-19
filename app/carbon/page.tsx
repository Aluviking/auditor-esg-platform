"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import Shell from "@/components/Shell";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { Wind, Zap, Globe, FileDown, RotateCcw } from "lucide-react";

const FACTORS = {
  gasolina:    2.31,   // tCO₂e por litro
  diesel:      2.68,
  gas_natural: 2.02,   // por m³
  electricidad: 0.45,  // por kWh
  vuelos_corto: 0.255, // por km
  vuelos_largo: 0.195,
  residuos:    0.52,   // por tonelada
} as const;

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b"];

type Fields = {
  gasolina: string; diesel: string; gas_natural: string;
  electricidad: string; vuelos_corto: string; vuelos_largo: string; residuos: string;
};

const DEFAULT_FIELDS: Fields = {
  gasolina: "", diesel: "", gas_natural: "",
  electricidad: "", vuelos_corto: "", vuelos_largo: "", residuos: "",
};

const STORAGE_KEY = "auditor_carbon";

function loadSaved(): { fields: Fields; calculated: boolean } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { fields: DEFAULT_FIELDS, calculated: false };
}

const n = (v: string) => parseFloat(v) || 0;

export default function CarbonPage() {
  const [fields,     setFields]     = useState<Fields>(DEFAULT_FIELDS);
  const [calculated, setCalculated] = useState(false);
  const [hydrated,   setHydrated]   = useState(false);

  // ── Load persisted data ───────────────────────────────────────────────────
  useEffect(() => {
    const saved = loadSaved();
    setFields(saved.fields);
    setCalculated(saved.calculated);
    setHydrated(true);
  }, []);

  // ── Persist on change ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ fields, calculated }));
  }, [fields, calculated, hydrated]);

  // ── Field setter — stable per key ─────────────────────────────────────────
  const setField = useCallback(
    (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setFields(prev => ({ ...prev, [k]: e.target.value })),
    []
  );

  // ── Calculations — only when fields change ────────────────────────────────
  const { scope1, scope2, scope3, total } = useMemo(() => {
    const s1 = n(fields.gasolina)    * FACTORS.gasolina
             + n(fields.diesel)      * FACTORS.diesel
             + n(fields.gas_natural) * FACTORS.gas_natural;
    const s2 = n(fields.electricidad) * FACTORS.electricidad;
    const s3 = n(fields.vuelos_corto) * FACTORS.vuelos_corto
             + n(fields.vuelos_largo) * FACTORS.vuelos_largo
             + n(fields.residuos)     * FACTORS.residuos;
    return { scope1: s1, scope2: s2, scope3: s3, total: s1 + s2 + s3 };
  }, [fields]);

  const pieData = useMemo(() => [
    { name: "Scope 1 — Directas",   value: parseFloat(scope1.toFixed(2)) },
    { name: "Scope 2 — Indirectas", value: parseFloat(scope2.toFixed(2)) },
    { name: "Scope 3 — Cadena",     value: parseFloat(scope3.toFixed(2)) },
  ].filter(d => d.value > 0), [scope1, scope2, scope3]);

  const barData = useMemo(() => [
    { name: "Scope 1", tCO2e: parseFloat(scope1.toFixed(2)), fill: "#22c55e" },
    { name: "Scope 2", tCO2e: parseFloat(scope2.toFixed(2)), fill: "#3b82f6" },
    { name: "Scope 3", tCO2e: parseFloat(scope3.toFixed(2)), fill: "#f59e0b" },
  ], [scope1, scope2, scope3]);

  function handleReset() {
    if (!window.confirm("¿Seguro que deseas borrar todos los datos de Carbon Box?")) return;
    localStorage.removeItem(STORAGE_KEY);
    setFields(DEFAULT_FIELDS);
    setCalculated(false);
  }

  if (!hydrated) return null;

  return (
    <Shell>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Wind className="text-green-500" size={26} /> Carbon Box
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Calculadora de Huella de Carbono · GHG Protocol · ISO 14064
            </p>
          </div>
          <div className="flex items-center gap-2">
            {calculated && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
              >
                <RotateCcw size={14} /> Reiniciar
              </button>
            )}
            {calculated && (
              <button className="flex items-center gap-2 bg-green-600 hover:bg-green-500 active:scale-95 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all">
                <FileDown size={16} /> Exportar reporte ISO
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ── Formulario ── */}
          <div className="space-y-5">
            <Section icon={<Wind className="text-green-500" size={18} />} label="Scope 1 — Emisiones Directas" color="border-green-200 bg-green-50">
              <Row label="Gasolina (litros/año)"   value={fields.gasolina}    onChange={setField("gasolina")} />
              <Row label="Diésel (litros/año)"     value={fields.diesel}      onChange={setField("diesel")} />
              <Row label="Gas natural (m³/año)"    value={fields.gas_natural} onChange={setField("gas_natural")} />
              <ScopeTotal label="Subtotal Scope 1" value={scope1} color="text-green-700" />
            </Section>

            <Section icon={<Zap className="text-blue-500" size={18} />} label="Scope 2 — Energía Indirecta" color="border-blue-200 bg-blue-50">
              <Row label="Electricidad (kWh/año)"  value={fields.electricidad} onChange={setField("electricidad")} />
              <ScopeTotal label="Subtotal Scope 2" value={scope2} color="text-blue-700" />
            </Section>

            <Section icon={<Globe className="text-amber-500" size={18} />} label="Scope 3 — Cadena de Valor" color="border-amber-200 bg-amber-50">
              <Row label="Vuelos corto alcance (km/año)" value={fields.vuelos_corto} onChange={setField("vuelos_corto")} />
              <Row label="Vuelos largo alcance (km/año)" value={fields.vuelos_largo} onChange={setField("vuelos_largo")} />
              <Row label="Residuos generados (ton/año)"  value={fields.residuos}     onChange={setField("residuos")} />
              <ScopeTotal label="Subtotal Scope 3" value={scope3} color="text-amber-700" />
            </Section>

            <button
              onClick={() => setCalculated(true)}
              className="w-full bg-green-600 hover:bg-green-500 active:scale-[0.98] text-white font-bold py-3 rounded-xl transition-all text-sm"
            >
              Calcular huella de carbono
            </button>
          </div>

          {/* ── Resultados ── */}
          <div className="space-y-5">
            {/* Total card */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 text-center">
              <p className="text-slate-400 text-xs uppercase tracking-widest mb-2">Huella total anual</p>
              {calculated && total > 0 ? (
                <p className="text-5xl font-extrabold text-green-400">{total.toFixed(1)}</p>
              ) : (
                <p className="text-5xl font-extrabold text-slate-600">—</p>
              )}
              <p className="text-slate-400 text-base mt-1">tCO₂e</p>
              <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                {[
                  { label: "Scope 1", value: scope1, color: "text-green-400" },
                  { label: "Scope 2", value: scope2, color: "text-blue-400"  },
                  { label: "Scope 3", value: scope3, color: "text-amber-400" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-white/10 rounded-lg p-2">
                    <p className={`font-bold ${color}`}>
                      {calculated ? value.toFixed(1) : "—"}
                    </p>
                    <p className="text-slate-400">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Charts — only show after calculation */}
            {calculated && total > 0 && (
              <>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                  <h3 className="font-semibold text-slate-700 mb-3 text-sm">Distribución por Scope</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        cx="50%" cy="50%"
                        outerRadius={72}
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend iconType="circle" iconSize={10} />
                      <Tooltip formatter={(v) => [`${v} tCO₂e`]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                  <h3 className="font-semibold text-slate-700 mb-3 text-sm">Comparativa Scopes</h3>
                  <ResponsiveContainer width="100%" height={130}>
                    <BarChart data={barData} barSize={44}>
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(v) => [`${v} tCO₂e`]} />
                      <Bar dataKey="tCO2e" radius={[6, 6, 0, 0]}>
                        {barData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-xs text-green-800">
                  <p className="font-semibold mb-1">Alineado a estándar</p>
                  <p className="text-green-700 leading-relaxed">
                    GHG Protocol Corporate Standard · ISO 14064-1 · IPCC Guidelines ·
                    Factor de emisión CFE México 2024
                  </p>
                </div>
              </>
            )}

            {!calculated && (
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
                <p className="text-slate-400 text-sm">
                  Ingresa tus datos y presiona<br />
                  <span className="font-semibold text-slate-600">"Calcular huella de carbono"</span><br />
                  para ver tus resultados aquí.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}

// ── Sub-components (no re-renders en el padre) ───────────────────────────────
function Section({ icon, label, color, children }: {
  icon: React.ReactNode; label: string; color: string; children: React.ReactNode;
}) {
  return (
    <div className={`border ${color} rounded-2xl p-5 space-y-3`}>
      <h3 className="flex items-center gap-2 font-semibold text-slate-700 text-sm">{icon}{label}</h3>
      {children}
    </div>
  );
}

function Row({ label, value, onChange }: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="text-slate-600 text-xs flex-1 leading-tight">{label}</label>
      <input
        type="number"
        min="0"
        value={value}
        onChange={onChange}
        placeholder="0"
        className="w-28 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-green-400 bg-white transition-shadow"
      />
    </div>
  );
}

function ScopeTotal({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex justify-between items-center border-t border-black/5 pt-2.5 mt-1">
      <span className="text-xs font-semibold text-slate-500">{label}</span>
      <span className={`text-sm font-bold ${color}`}>{value.toFixed(2)} tCO₂e</span>
    </div>
  );
}
