"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Turno = {
  id: string; fecha: string; hora: string; estado: string;
  servicio: string; precio: number; cliente: string; clienteEmail: string; notas?: string;
};

const estadoBadge: Record<string, { label: string; style: React.CSSProperties }> = {
  pendiente: { label: "Pendiente", style: { background: "rgba(234,179,8,0.2)", border: "1px solid rgba(234,179,8,0.35)", color: "rgba(253,224,71,0.9)" } },
  confirmado: { label: "Confirmado", style: { background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.35)", color: "rgba(134,239,172,0.95)" } },
  cancelado:  { label: "Cancelado",  style: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.3)" } },
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("hoy");

  useEffect(() => {
    if (status === "authenticated" && session.user.role !== "admin") router.push("/");
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user.role === "admin") {
      fetch("/api/turnos").then((r) => r.json()).then(setTurnos).finally(() => setLoading(false));
    }
  }, [session]);

  async function cambiarEstado(id: string, estado: string) {
    await fetch(`/api/turnos/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    setTurnos((prev) => prev.map((t) => (t.id === id ? { ...t, estado } : t)));
  }

  const hoy = new Date().toISOString().split("T")[0];
  const manana = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const filtrados = turnos.filter((t) => {
    if (filtro === "hoy") return t.fecha === hoy;
    if (filtro === "manana") return t.fecha === manana;
    if (filtro === "pendientes") return t.estado === "pendiente";
    return true;
  });

  const stats = [
    { label: "Pendientes", value: turnos.filter((t) => t.estado === "pendiente").length, color: "rgba(234,179,8,0.8)" },
    { label: "Confirmados", value: turnos.filter((t) => t.estado === "confirmado" && t.fecha >= hoy).length, color: "rgba(34,197,94,0.8)" },
    { label: "Hoy", value: turnos.filter((t) => t.fecha === hoy && t.estado !== "cancelado").length, color: "rgba(167,99,255,0.9)" },
  ];

  if (status === "loading" || loading) return (
    <div className="flex justify-center items-center py-32">
      <div className="w-8 h-8 border-2 border-purple-500/40 border-t-purple-400 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
          Panel Admin
        </h1>
        <Link href="/admin/servicios" className="text-purple-400/80 text-sm hover:text-purple-300 transition">
          Servicios →
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl p-4 text-center" style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
          }}>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-white/35 text-xs mt-0.5 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {[
          { key: "hoy", label: "Hoy" },
          { key: "manana", label: "Mañana" },
          { key: "pendientes", label: "Pendientes" },
          { key: "todos", label: "Todos" },
        ].map((f) => (
          <button key={f.key} onClick={() => setFiltro(f.key)}
            className="px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all"
            style={
              filtro === f.key
                ? { background: "linear-gradient(135deg, rgba(147,51,234,0.7), rgba(109,40,217,0.8))", border: "1px solid rgba(167,99,255,0.4)", color: "white" }
                : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtrados.length === 0 ? (
        <div className="text-center py-12 rounded-3xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <p className="text-white/30">No hay turnos para mostrar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtrados.map((t) => {
            const badge = estadoBadge[t.estado];
            return (
              <div key={t.id} className="rounded-2xl p-5" style={{
                background: "rgba(255,255,255,0.06)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 20px rgba(0,0,0,0.25)",
              }}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-white">{t.cliente}</p>
                    <p className="text-white/35 text-xs">{t.clienteEmail}</p>
                    <p className="text-white/60 text-sm mt-1.5">
                      <span className="font-medium">{t.servicio}</span>
                      <span className="text-white/30"> · </span>
                      {t.hora} hs
                      <span className="text-white/30"> · </span>
                      {new Date(t.fecha + "T00:00:00").toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" })}
                    </p>
                    {t.notas && <p className="text-white/25 text-xs mt-1">📝 {t.notas}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-purple-300">${t.precio.toLocaleString()}</p>
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full mt-1.5 inline-block" style={badge.style}>
                      {badge.label}
                    </span>
                  </div>
                </div>

                {t.estado === "pendiente" && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => cambiarEstado(t.id, "confirmado")}
                      className="flex-1 py-2 rounded-xl text-sm font-semibold text-white transition"
                      style={{ background: "rgba(34,197,94,0.25)", border: "1px solid rgba(34,197,94,0.35)" }}
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => cambiarEstado(t.id, "cancelado")}
                      className="flex-1 py-2 rounded-xl text-sm font-medium transition"
                      style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.25)", color: "rgba(252,165,165,0.8)" }}
                    >
                      Cancelar
                    </button>
                  </div>
                )}
                {t.estado === "confirmado" && (
                  <button
                    onClick={() => cambiarEstado(t.id, "cancelado")}
                    className="mt-3 text-xs text-red-400/50 hover:text-red-300/80 transition"
                  >
                    Cancelar turno
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
