"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Turno = {
  id: string; fecha: string; hora: string; estado: string;
  servicio: string; precio: number; notas?: string;
};

const estadoBadge: Record<string, { label: string; style: React.CSSProperties }> = {
  pendiente: {
    label: "Pendiente",
    style: { background: "rgba(234,179,8,0.2)", border: "1px solid rgba(234,179,8,0.35)", color: "rgba(253,224,71,0.9)" },
  },
  confirmado: {
    label: "Confirmado",
    style: { background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.35)", color: "rgba(134,239,172,0.95)" },
  },
  cancelado: {
    label: "Cancelado",
    style: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.35)" },
  },
};

export default function MisTurnos() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [turnosList, setTurnosList] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/turnos").then((r) => r.json()).then(setTurnosList).finally(() => setLoading(false));
    }
  }, [session]);

  async function cancelar(id: string) {
    if (!confirm("¿Cancelar este turno?")) return;
    await fetch(`/api/turnos/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: "cancelado" }),
    });
    setTurnosList((prev) => prev.map((t) => (t.id === id ? { ...t, estado: "cancelado" } : t)));
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center py-32 text-white/30">
        <div className="w-8 h-8 border-2 border-purple-500/40 border-t-purple-400 rounded-full animate-spin" />
      </div>
    );
  }

  const activos = turnosList.filter((t) => t.estado !== "cancelado");
  const cancelados = turnosList.filter((t) => t.estado === "cancelado");

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
          Mis turnos
        </h1>
        <Link href="/turnos/nuevo" className="btn-primary px-5 py-2 rounded-2xl text-white text-sm font-semibold">
          + Nuevo
        </Link>
      </div>

      {activos.length === 0 && (
        <div
          className="text-center py-16 rounded-3xl"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="text-5xl mb-4">📅</div>
          <p className="text-white/40 text-base">No tenés turnos activos</p>
          <Link href="/turnos/nuevo" className="text-purple-400 text-sm font-medium hover:text-purple-300 mt-3 inline-block transition">
            Reservar ahora →
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {activos.map((t) => <TurnoCard key={t.id} turno={t} onCancelar={cancelar} />)}
      </div>

      {cancelados.length > 0 && (
        <>
          <p className="text-white/25 text-xs uppercase tracking-widest font-medium mt-10 mb-3 px-1">Anteriores</p>
          <div className="space-y-2">
            {cancelados.map((t) => <TurnoCard key={t.id} turno={t} />)}
          </div>
        </>
      )}
    </div>
  );
}

function TurnoCard({ turno, onCancelar }: { turno: Turno; onCancelar?: (id: string) => void }) {
  const fecha = new Date(turno.fecha + "T00:00:00").toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long",
  });
  const badge = estadoBadge[turno.estado];

  return (
    <div
      className="rounded-2xl p-5 transition-all duration-200 hover:scale-[1.01]"
      style={{
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 20px rgba(0,0,0,0.25)",
      }}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold text-white">{turno.servicio}</p>
          <p className="text-white/40 text-sm mt-0.5 capitalize">{fecha} · {turno.hora} hs</p>
          {turno.notas && <p className="text-white/30 text-xs mt-1">{turno.notas}</p>}
        </div>
        <div className="text-right">
          <p className="font-bold text-purple-300 text-lg">${turno.precio.toLocaleString()}</p>
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full mt-1.5 inline-block" style={badge.style}>
            {badge.label}
          </span>
        </div>
      </div>
      {onCancelar && turno.estado !== "cancelado" && (
        <button
          onClick={() => onCancelar(turno.id)}
          className="mt-3 text-xs text-red-400/70 hover:text-red-300 transition font-medium"
        >
          Cancelar turno
        </button>
      )}
    </div>
  );
}
