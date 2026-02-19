"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf, BarChart3, Wind, ClipboardList, ShieldCheck, Eye, EyeOff } from "lucide-react";

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
      router.push("/dashboard");
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

          {/* Footer */}
          <p className="text-center text-xs text-slate-400 mt-8">
            Plataforma de consultoría ESG · Versión 1.0
          </p>
        </div>
      </div>
    </div>
  );
}
