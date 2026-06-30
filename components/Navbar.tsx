"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-purple-700 text-white shadow-lg">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          ✂️ <span>Peluquería</span>
        </Link>

        {/* Desktop */}
        <div className="hidden sm:flex items-center gap-4 text-sm font-medium">
          <Link href="/turnos" className="hover:text-purple-200">Mis turnos</Link>
          {session?.user.role === "admin" && (
            <Link href="/admin" className="hover:text-purple-200">Panel admin</Link>
          )}
          {session ? (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="bg-purple-900 hover:bg-purple-800 px-3 py-1 rounded-lg"
            >
              Salir
            </button>
          ) : (
            <Link href="/login" className="bg-white text-purple-700 hover:bg-purple-100 px-3 py-1 rounded-lg">
              Ingresar
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <div className="w-5 h-0.5 bg-white mb-1" />
          <div className="w-5 h-0.5 bg-white mb-1" />
          <div className="w-5 h-0.5 bg-white" />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden bg-purple-800 px-4 pb-4 space-y-2 text-sm font-medium">
          <Link href="/turnos" className="block py-2" onClick={() => setMenuOpen(false)}>Mis turnos</Link>
          {session?.user.role === "admin" && (
            <Link href="/admin" className="block py-2" onClick={() => setMenuOpen(false)}>Panel admin</Link>
          )}
          {session ? (
            <button
              onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }}
              className="block py-2 text-purple-200"
            >
              Cerrar sesión ({session.user.name})
            </button>
          ) : (
            <Link href="/login" className="block py-2" onClick={() => setMenuOpen(false)}>Ingresar</Link>
          )}
        </div>
      )}
    </nav>
  );
}
