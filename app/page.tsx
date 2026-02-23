"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf, BarChart3, Wind, ClipboardList, ShieldCheck, Eye, EyeOff, Sparkles } from "lucide-react";

/* ─── Demo data ──────────────────────────────────────────────── */
const DEMO_DATASETS: Record<string, unknown> = {
  auditor_company:  "Grupo Industrial RUBIK S.A.",
  auditor_email:    "gerencia@grupørubik.com.mx",
  auditor_perfil:   { sector:"Manufactura", empleados:"51 – 250", pais:"México", isos:["ISO 9001","ISO 14001","ISO 45001"], frameworks:["GRI 2021","GHG Protocol"], normas_locales:["NOM-035"], objetivos:["certificacion","carbon","esg","mejora","bienestar","proveedores"] },
  auditor_diagnostico: { answers:{ a1:"si",a2:"si",a3:"parcial",a4:"si",a5:"parcial",a6:"si", s1:"si",s2:"parcial",s3:"si",s4:"no",s5:"si", g1:"si",g2:"parcial",g3:"si",g4:"si",g5:"parcial", q1:"si",q2:"si",q3:"si",q4:"parcial" }, step:1 },
  auditor_carbon:   { fields:{ gasolina:"12000",diesel:"4500",gas_natural:"8200",electricidad:"45000",vuelos_corto:"12",vuelos_largo:"4",residuos:"3200" }, calculated:true },
  auditor_plan:     [
    { id:"1", title:"Implementar política ambiental ISO 14001",    responsible:"Dir. Ambiental", dueDate:"2025-06-30", progress:75, category:"ambiental" },
    { id:"2", title:"Capacitar personal en gestión de residuos",   responsible:"RRHH",           dueDate:"2025-04-15", progress:40, category:"ambiental" },
    { id:"3", title:"Auditoría interna ISO 9001 primer semestre",  responsible:"Calidad",         dueDate:"2025-05-30", progress:100,category:"calidad"   },
    { id:"4", title:"Evaluación de riesgos psicosociales NOM-035", responsible:"Seguridad",       dueDate:"2025-03-28", progress:20, category:"social"    },
  ],
  auditor_kpis: [
    { id:"1", name:"Emisiones CO₂ totales",           unit:"tCO₂e", current:68,  target:60,  category:"ambiental" },
    { id:"2", name:"Consumo energético",               unit:"MWh",   current:420, target:400, category:"ambiental" },
    { id:"3", name:"Satisfacción del cliente",         unit:"%",     current:87,  target:90,  category:"calidad"   },
    { id:"4", name:"Horas capacitación / empleado",    unit:"hrs",   current:12,  target:20,  category:"social"    },
    { id:"5", name:"Accidentes registrables",          unit:"casos", current:2,   target:0,   category:"social"    },
  ],
  auditor_riesgos_lista: [
    { id:"1", descripcion:"Incumplimiento de regulación ambiental", area:"Operaciones", norma:"ISO 14001", probabilidad:2,impacto:5, control:"Revisión mensual de normativa",    responsable:"Dir. Ambiental" },
    { id:"2", descripcion:"Fuga de información confidencial",       area:"TI",          norma:"ISO 27001", probabilidad:3,impacto:4, control:"Política de seguridad de datos",   responsable:"Dir. TI"        },
    { id:"3", descripcion:"Accidente laboral en producción",        area:"Producción",  norma:"ISO 45001", probabilidad:3,impacto:5, control:"EPP obligatorio, capacitación",    responsable:"Seguridad"      },
    { id:"4", descripcion:"Proveedor crítico sin capacidad",        area:"Compras",     norma:"ISO 9001",  probabilidad:2,impacto:3, control:"Evaluación semestral proveedores", responsable:"Compras"        },
  ],
  auditor_legal_lista: [
    { id:"1", requisito:"Política ambiental documentada",           norma:"ISO 14001", aplica:"si",      evidencia:"Política AM-001 v2.1",     responsable:"Dir. Ambiental", vencimiento:"2025-12-31" },
    { id:"2", requisito:"Plan de emergencias actualizado",          norma:"ISO 45001", aplica:"si",      evidencia:"PE-2024 aprobado",          responsable:"Seguridad",      vencimiento:"2025-06-30" },
    { id:"3", requisito:"Evaluación de riesgo psicosocial NOM-035", norma:"NOM-035",   aplica:"parcial", evidencia:"En proceso Q1 2025",        responsable:"RRHH",           vencimiento:"2025-03-31" },
    { id:"4", requisito:"Manual de calidad ISO 9001 revisado",      norma:"ISO 9001",  aplica:"si",      evidencia:"MC-2024-v3",                responsable:"Calidad",        vencimiento:"2025-12-31" },
  ],
  auditor_indicadores: [
    { id:"1", nombre:"Tasa de accidentabilidad", actual:1.8, meta:1.0, tendencia:"baja", norma:"ISO 45001",    unidad:"%"         },
    { id:"2", nombre:"Intensidad de carbono",    actual:42,  meta:35,  tendencia:"baja", norma:"GHG Protocol", unidad:"tCO₂e/M$"  },
    { id:"3", nombre:"Satisfacción laboral",     actual:78,  meta:85,  tendencia:"alta", norma:"GRI 401",      unidad:"%"         },
    { id:"4", nombre:"Agua reciclada",           actual:30,  meta:50,  tendencia:"alta", norma:"GRI 303",      unidad:"%"         },
  ],
  auditor_mejora: [
    { id:"1", tipo:"No conformidad",        descripcion:"Registros de capacitación desactualizados",      origen:"Auditoría interna", norma:"ISO 9001",  responsable:"RRHH",           fechaLimite:"2025-04-30", accionCorrectiva:"Actualizar registros en sistema digital", estado:"En proceso",  fechaCreacion:"2025-01-10" },
    { id:"2", tipo:"Observación",           descripcion:"Señalización de salidas de emergencia deteriorada", origen:"Inspección",        norma:"ISO 45001", responsable:"Mantenimiento",  fechaLimite:"2025-02-28", accionCorrectiva:"Reemplazar señalización sector B",        estado:"Cerrada",     fechaCreacion:"2025-01-15" },
    { id:"3", tipo:"Oportunidad de mejora", descripcion:"Implementar medición de agua por área productiva",  origen:"Revisión gerencial",norma:"ISO 14001", responsable:"Dir. Ambiental", fechaLimite:"2025-06-30", accionCorrectiva:"Instalar medidores por línea de producción",estado:"Abierta",  fechaCreacion:"2025-01-20" },
  ],
  auditor_ods: { seleccionados:["ODS7","ODS8","ODS12","ODS13","ODS16"], iniciativas:[
    { id:"1", ods:"ODS13", descripcion:"Reducir emisiones CO₂ 15% vs 2024", responsable:"Dir. Ambiental", progreso:40 },
    { id:"2", ods:"ODS8",  descripcion:"Programa de bienestar laboral integral",responsable:"RRHH",          progreso:60 },
    { id:"3", ods:"ODS12", descripcion:"Certificar proceso de reciclaje interno", responsable:"Operaciones", progreso:25 },
  ]},
};

const features = [
  { icon: BarChart3,    label: "Dashboard ESG",       desc: "KPIs ambientales, sociales y de gobernanza" },
  { icon: Wind,         label: "Carbon Box",           desc: "Huella de carbono Scope 1, 2 y 3" },
  { icon: ClipboardList,label: "Diagnóstico ESG",      desc: "Batería de indicadores con hoja de ruta" },
  { icon: ShieldCheck,  label: "Auditoría ISO",        desc: "Control documental y hallazgos" },
];

export default function LoginPage() {
  const router = useRouter();
  const [empresa, setEmpresa]     = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  function loadDemo() {
    Object.entries(DEMO_DATASETS).forEach(([key, value]) => {
      localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
    });
    router.push("/dashboard");
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!empresa.trim()) { setError("Ingresa el nombre de tu empresa."); return; }
    if (!email.trim())   { setError("Ingresa tu correo electrónico."); return; }
    if (!password)       { setError("Ingresa tu contraseña."); return; }

    setLoading(true);
    // Guardar sesión en localStorage (prototipo)
    localStorage.setItem("auditor_company", empresa.trim());
    localStorage.setItem("auditor_email", email.trim());

    setTimeout(() => {
      const perfil = localStorage.getItem("auditor_perfil");
      router.push(perfil ? "/dashboard" : "/onboarding");
    }, 600);
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel — Brand ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-green-950 flex-col justify-between p-12">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
            <Leaf className="text-white" size={22} />
          </div>
          <div>
            <span className="text-white font-bold text-xl tracking-wide">AUDITOR</span>
            <span className="text-green-400 text-xs font-semibold ml-2 border border-green-500/40 rounded px-1.5 py-0.5">ESG</span>
          </div>
        </div>

        {/* Hero text */}
        <div>
          <h1 className="text-white text-4xl font-extrabold leading-snug mb-4">
            Tu copiloto hacia la<br />
            <span className="text-green-400">certificación</span> ambiental
          </h1>
          <p className="text-slate-400 text-base leading-relaxed mb-10 max-w-sm">
            Gestiona tu proceso de certificación ISO 14001, mide tu huella de carbono
            y genera reportes alineados a GRI, CSRD y estándares ESG globales.
          </p>

          {/* Feature list */}
          <ul className="space-y-4">
            {features.map(({ icon: Icon, label, desc }) => (
              <li key={label} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="text-green-400" size={16} />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{label}</p>
                  <p className="text-slate-500 text-xs">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Standards footer */}
        <div className="text-slate-600 text-xs tracking-widest">
          ISO 14001 · ISO 9001 · GRI 2021 · CSRD · GHG Protocol
        </div>
      </div>

      {/* ── Right panel — Login form ── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-8">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-10 lg:hidden">
          <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center">
            <Leaf className="text-white" size={20} />
          </div>
          <span className="text-slate-800 font-bold text-xl">AUDITOR</span>
          <span className="text-green-500 text-xs font-semibold border border-green-400 rounded px-1.5">ESG</span>
        </div>

        <div className="w-full max-w-sm">
          <h2 className="text-slate-800 text-2xl font-bold mb-1">Iniciar sesión</h2>
          <p className="text-slate-400 text-sm mb-8">Accede a tu plataforma de gestión ESG</p>

          <form onSubmit={handleLogin} className="space-y-5" noValidate>
            {/* Empresa */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Nombre de la empresa
              </label>
              <input
                type="text"
                value={empresa}
                onChange={e => setEmpresa(e.target.value)}
                placeholder="Ej. Corporativo XYZ S.A. de C.V."
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nombre@empresa.com"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-500 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Ingresando…
                </>
              ) : (
                "Iniciar sesión"
              )}
            </button>
          </form>

          {/* Demo */}
          <div className="mt-6 border-t border-slate-100 pt-5 text-center">
            <p className="text-xs text-slate-400 mb-2">¿Solo quieres explorar?</p>
            <button
              type="button"
              onClick={loadDemo}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600 hover:text-green-500 border border-green-200 hover:border-green-400 rounded-xl px-4 py-2 transition-all"
            >
              <Sparkles size={13} />
              Ver demo con datos de ejemplo
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-slate-400 mt-5">
            Plataforma de consultoría ESG · Versión 1.0
          </p>
        </div>
      </div>
    </div>
  );
}
