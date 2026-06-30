"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        background: "rgba(10, 0, 20, 0.55)",
        backdropFilter: "blur(28px) saturate(180%)",
        WebkitBackdropFilter: "blur(28px) saturate(180%)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 1px 0 rgba(255,255,255,0.07), 0 4px 24px rgba(0,0,0,0.3)",
      }}
    >
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-white">
          <span className="text-2xl">✂️</span>
          <span className="bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
            Peluquería
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden sm:flex items-center gap-2 text-sm font-medium">
          <Link href="/turnos" className="px-4 py-1.5 rounded-full text-white/75 hover:text-white hover:bg-white/10 transition">
            Mis turnos
          </Link>
          {session?.user.role === "admin" && (
            <Link href="/admin" className="px-4 py-1.5 rounded-full text-white/75 hover:text-white hover:bg-white/10 transition">
              Admin
            </Link>
          )}
          {session ? (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="btn-glass px-4 py-1.5 rounded-full text-white/80 text-sm font-medium"
            >
              Salir
            </button>
          ) : (
            <Link href="/login" className="btn-primary px-5 py-1.5 rounded-full text-white text-sm font-semibold">
              Ingresar
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden p-2 rounded-xl btn-glass"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <div className={`w-5 h-0.5 bg-white transition-all mb-1 ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
          <div className={`w-5 h-0.5 bg-white transition-all mb-1 ${menuOpen ? "opacity-0" : ""}`} />
          <div className={`w-5 h-0.5 bg-white transition-all ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="sm:hidden px-4 pb-4 pt-2 space-y-1"
          style={{
            background: "rgba(10,0,20,0.7)",
            backdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Link href="/turnos" className="block px-4 py-2.5 rounded-xl text-white/80 hover:bg-white/10 transition" onClick={() => setMenuOpen(false)}>
            Mis turnos
          </Link>
          {session?.user.role === "admin" && (
            <Link href="/admin" className="block px-4 py-2.5 rounded-xl text-white/80 hover:bg-white/10 transition" onClick={() => setMenuOpen(false)}>
              Panel admin
            </Link>
          )}
          {session ? (
            <button
              onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }}
              className="block w-full text-left px-4 py-2.5 rounded-xl text-white/50 hover:bg-white/10 transition text-sm"
            >
              Cerrar sesión · {session.user.name}
            </button>
          ) : (
            <Link href="/login" className="block px-4 py-2.5 rounded-xl text-purple-300 font-medium" onClick={() => setMenuOpen(false)}>
              Ingresar
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
