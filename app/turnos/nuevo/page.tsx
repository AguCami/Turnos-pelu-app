"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Servicio = { id: string; nombre: string; duracion: number; precio: number };

function getMinDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1); // At least tomorrow
  return d.toISOString().split("T")[0];
}

export default function NuevoTurno() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [servicioId, setServicioId] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [notas, setNotas] = useState("");
  const [horarios, setHorarios] = useState<string[]>([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login?callbackUrl=/turnos/nuevo");
  }, [status, router]);

  useEffect(() => {
    fetch("/api/servicios").then((r) => r.json()).then(setServicios);
  }, []);

  useEffect(() => {
    if (!fecha) return;
    setLoadingHorarios(true);
    setHora("");
    fetch(`/api/horarios?fecha=${fecha}`)
      .then((r) => r.json())
      .then((data) => setHorarios(data.disponibles ?? []))
      .finally(() => setLoadingHorarios(false));
  }, [fecha]);

  const servicio = servicios.find((s) => s.id === servicioId);

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/turnos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ servicioId, fecha, hora, notas }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Error al reservar");
      return;
    }
    router.push("/turnos?success=1");
  }

  if (status === "loading") return <div className="flex justify-center py-20 text-gray-400">Cargando...</div>;

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Reservar turno</h1>

      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`flex-1 h-1.5 rounded-full ${step >= s ? "bg-purple-600" : "bg-gray-200"}`}
          />
        ))}
      </div>

      {/* Step 1: Servicio */}
      {step === 1 && (
        <div>
          <h2 className="font-semibold text-gray-700 mb-4">¿Qué servicio querés?</h2>
          <div className="space-y-3">
            {servicios.map((s) => (
              <button
                key={s.id}
                onClick={() => { setServicioId(s.id); setStep(2); }}
                className={`w-full text-left p-4 rounded-xl border-2 transition ${
                  servicioId === s.id
                    ? "border-purple-600 bg-purple-50"
                    : "border-gray-200 hover:border-purple-300 bg-white"
                }`}
              >
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-800">{s.nombre}</span>
                  <span className="font-bold text-purple-700">${s.precio.toLocaleString()}</span>
                </div>
                <span className="text-xs text-gray-400">{s.duracion} minutos</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Fecha y hora */}
      {step === 2 && (
        <div>
          <h2 className="font-semibold text-gray-700 mb-4">¿Cuándo querés el turno?</h2>

          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
          <input
            type="date"
            min={getMinDate()}
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 mb-5 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          {fecha && (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-2">Horario disponible</label>
              {loadingHorarios ? (
                <p className="text-gray-400 text-sm">Cargando horarios...</p>
              ) : horarios.length === 0 ? (
                <p className="text-red-500 text-sm">No hay horarios disponibles para ese día</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {horarios.map((h) => (
                    <button
                      key={h}
                      onClick={() => setHora(h)}
                      className={`py-2 rounded-xl text-sm font-medium transition ${
                        hora === h
                          ? "bg-purple-600 text-white"
                          : "bg-white border border-gray-200 hover:border-purple-400 text-gray-700"
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep(1)} className="flex-1 border border-gray-300 rounded-xl py-3 text-sm font-medium hover:bg-gray-50">
              Atrás
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!fecha || !hora}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirmar */}
      {step === 3 && servicio && (
        <div>
          <h2 className="font-semibold text-gray-700 mb-4">Confirmar reserva</h2>

          <div className="bg-purple-50 rounded-xl p-5 mb-5 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Servicio</span>
              <span className="font-semibold text-gray-800">{servicio.nombre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Fecha</span>
              <span className="font-semibold text-gray-800">
                {new Date(fecha + "T00:00:00").toLocaleDateString("es-AR", {
                  weekday: "long", day: "numeric", month: "long",
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Hora</span>
              <span className="font-semibold text-gray-800">{hora} hs</span>
            </div>
            <div className="flex justify-between border-t border-purple-200 pt-2 mt-2">
              <span className="text-gray-500 text-sm">Total</span>
              <span className="font-bold text-purple-700 text-lg">${servicio.precio.toLocaleString()}</span>
            </div>
          </div>

          <label className="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
            placeholder="¿Algo especial que quieras aclarar?"
          />

          {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-2 mb-4">{error}</div>}

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex-1 border border-gray-300 rounded-xl py-3 text-sm font-medium hover:bg-gray-50">
              Atrás
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl"
            >
              {submitting ? "Reservando..." : "Confirmar turno"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
