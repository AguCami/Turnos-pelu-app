"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres"); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Error al registrarse");
      setLoading(false); return;
    }
    await signIn("credentials", { email, password, callbackUrl: "/" });
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-8">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: "radial-gradient(circle, rgba(147,51,234,1), transparent 70%)" }}
        />
      </div>

      <div
        className="relative z-10 w-full max-w-sm rounded-3xl p-8"
        style={{
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(40px) saturate(200%)",
          WebkitBackdropFilter: "blur(40px) saturate(200%)",
          border: "1px solid rgba(255,255,255,0.15)",
          boxShadow:
            "inset 0 1.5px 0 rgba(255,255,255,0.2), 0 24px 64px rgba(0,0,0,0.5)",
        }}
      >
        <div
          className="absolute top-0 left-6 right-6 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)" }}
        />

        <div className="text-center mb-7">
          <div className="text-4xl mb-3">✂️</div>
          <h1 className="text-2xl font-bold text-white">Crear cuenta</h1>
          <p className="text-white/45 text-sm mt-1">Empezá a reservar turnos</p>
        </div>

        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="btn-glass w-full flex items-center justify-center gap-3 rounded-2xl py-3 text-sm font-medium text-white mb-4"
        >
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuar con Google
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-white/15" />
          <span className="text-xs text-white/35">o con email</span>
          <div className="flex-1 h-px bg-white/15" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm rounded-xl px-4 py-2.5 text-white/90" style={{ background: "rgba(239,68,68,0.25)", border: "1px solid rgba(239,68,68,0.3)" }}>
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-white/55 mb-1.5 uppercase tracking-wide">Nombre completo</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
              className="input-glass w-full rounded-xl px-4 py-2.5 text-sm" placeholder="Juan Pérez" />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/55 mb-1.5 uppercase tracking-wide">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="input-glass w-full rounded-xl px-4 py-2.5 text-sm" placeholder="tu@email.com" />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/55 mb-1.5 uppercase tracking-wide">Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="input-glass w-full rounded-xl px-4 py-2.5 text-sm" placeholder="Mínimo 6 caracteres" />
          </div>
          <button type="submit" disabled={loading}
            className="btn-primary w-full font-semibold py-3 rounded-2xl text-white">
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="text-center text-xs text-white/40 mt-5">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="text-purple-300 font-medium hover:text-white transition">
            Ingresar
          </Link>
        </p>
      </div>
    </div>
  );
}
