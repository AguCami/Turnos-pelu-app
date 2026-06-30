"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Turno = {
  id: string;
  fecha: string;
  hora: string;
  estado: string;
  servicio: string;
  precio: number;
  cliente: string;
  clienteEmail: string;
  notas?: string;
};

const estadoColor: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-700",
  confirmado: "bg-green-100 text-green-700",
  cancelado: "bg-gray-100 text-gray-500",
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("hoy");

  useEffect(() => {
    if (status === "authenticated" && session.user.role !== "admin") {
      router.push("/");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user.role === "admin") {
      fetch("/api/turnos")
        .then((r) => r.json())
        .then(setTurnos)
        .finally(() => setLoading(false));
    }
  }, [session]);

  async function cambiarEstado(id: string, estado: string) {
    await fetch(`/api/turnos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    setTurnos((prev) => prev.map((t) => (t.id === id ? { ...t, estado } : t)));
  }

  const hoy = new Date().toISOString().split("T")[0];
  const manana = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const turnosFiltrados = turnos.filter((t) => {
    if (filtro === "hoy") return t.fecha === hoy;
    if (filtro === "manana") return t.fecha === manana;
    if (filtro === "pendientes") return t.estado === "pendiente";
    return true;
  });

  const stats = {
    pendientes: turnos.filter((t) => t.estado === "pendiente").length,
    confirmados: turnos.filter((t) => t.estado === "confirmado" && t.fecha >= hoy).length,
    hoy: turnos.filter((t) => t.fecha === hoy && t.estado !== "cancelado").length,
  };

  if (status === "loading" || loading) {
    return <div className="flex justify-center py-20 text-gray-400">Cargando...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Panel Admin</h1>
        <Link href="/admin/servicios" className="text-sm text-purple-600 font-medium hover:underline">
          Gestionar servicios →
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-yellow-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-700">{stats.pendientes}</p>
          <p className="text-xs text-yellow-600 font-medium mt-0.5">Pendientes</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{stats.confirmados}</p>
          <p className="text-xs text-green-600 font-medium mt-0.5">Confirmados</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-purple-700">{stats.hoy}</p>
          <p className="text-xs text-purple-600 font-medium mt-0.5">Hoy</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {[
          { key: "hoy", label: "Hoy" },
          { key: "manana", label: "Mañana" },
          { key: "pendientes", label: "Pendientes" },
          { key: "todos", label: "Todos" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
              filtro === f.key
                ? "bg-purple-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-purple-400"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Turnos */}
      {turnosFiltrados.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>No hay turnos para mostrar</p>
        </div>
      ) : (
        <div className="space-y-4">
          {turnosFiltrados.map((t) => (
            <div key={t.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-800">{t.cliente}</p>
                  <p className="text-gray-500 text-sm">{t.clienteEmail}</p>
                  <p className="text-gray-700 text-sm mt-1">
                    <span className="font-medium">{t.servicio}</span> · {t.hora} hs ·{" "}
                    {new Date(t.fecha + "T00:00:00").toLocaleDateString("es-AR", {
                      weekday: "short", day: "numeric", month: "short",
                    })}
                  </p>
                  {t.notas && <p className="text-gray-400 text-xs mt-1">📝 {t.notas}</p>}
                </div>
                <div className="text-right">
                  <p className="font-bold text-purple-700">${t.precio.toLocaleString()}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${estadoColor[t.estado]}`}>
                    {t.estado}
                  </span>
                </div>
              </div>

              {t.estado === "pendiente" && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => cambiarEstado(t.id, "confirmado")}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2 rounded-lg"
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => cambiarEstado(t.id, "cancelado")}
                    className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 text-sm font-medium py-2 rounded-lg"
                  >
                    Cancelar
                  </button>
                </div>
              )}
              {t.estado === "confirmado" && (
                <button
                  onClick={() => cambiarEstado(t.id, "cancelado")}
                  className="mt-3 text-sm text-red-500 hover:text-red-700 font-medium"
                >
                  Cancelar turno
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
