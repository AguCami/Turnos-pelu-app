"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Turno = {
  id: string;
  fecha: string;
  hora: string;
  estado: string;
  servicio: string;
  precio: number;
  notas?: string;
};

const estadoColor: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-700",
  confirmado: "bg-green-100 text-green-700",
  cancelado: "bg-red-100 text-red-700",
};

const estadoLabel: Record<string, string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  cancelado: "Cancelado",
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
      fetch("/api/turnos")
        .then((r) => r.json())
        .then(setTurnosList)
        .finally(() => setLoading(false));
    }
  }, [session]);

  async function cancelar(id: string) {
    if (!confirm("¿Cancelar este turno?")) return;
    await fetch(`/api/turnos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: "cancelado" }),
    });
    setTurnosList((prev) =>
      prev.map((t) => (t.id === id ? { ...t, estado: "cancelado" } : t))
    );
  }

  if (status === "loading" || loading) {
    return <div className="flex justify-center py-20 text-gray-400">Cargando...</div>;
  }

  const activos = turnosList.filter((t) => t.estado !== "cancelado");
  const cancelados = turnosList.filter((t) => t.estado === "cancelado");

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Mis turnos</h1>
        <Link
          href="/turnos/nuevo"
          className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-xl"
        >
          + Nuevo turno
        </Link>
      </div>

      {activos.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📅</div>
          <p className="text-lg">No tenés turnos activos</p>
          <Link href="/turnos/nuevo" className="text-purple-600 font-medium hover:underline mt-2 inline-block">
            Reservar ahora
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {activos.map((t) => (
          <TurnoCard key={t.id} turno={t} onCancelar={cancelar} />
        ))}
      </div>

      {cancelados.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-gray-400 mt-8 mb-3">Turnos anteriores</h2>
          <div className="space-y-3">
            {cancelados.map((t) => (
              <TurnoCard key={t.id} turno={t} />
            ))}
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

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold text-gray-800 text-lg">{turno.servicio}</p>
          <p className="text-gray-500 text-sm mt-0.5 capitalize">{fecha} · {turno.hora} hs</p>
          {turno.notas && <p className="text-gray-400 text-xs mt-1">{turno.notas}</p>}
        </div>
        <div className="text-right">
          <p className="font-bold text-purple-700">${turno.precio.toLocaleString()}</p>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${estadoColor[turno.estado]}`}>
            {estadoLabel[turno.estado]}
          </span>
        </div>
      </div>
      {onCancelar && turno.estado !== "cancelado" && (
        <button
          onClick={() => onCancelar(turno.id)}
          className="mt-3 text-sm text-red-500 hover:text-red-700 font-medium"
        >
          Cancelar turno
        </button>
      )}
    </div>
  );
}
