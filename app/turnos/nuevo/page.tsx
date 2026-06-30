"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Servicio = { id: string; nombre: string; duracion: number; precio: number };

function getMinDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

const glassPanel = {
  background: "rgba(255,255,255,0.06)",
  backdropFilter: "blur(24px) saturate(180%)",
  WebkitBackdropFilter: "blur(24px) saturate(180%)",
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), 0 8px 32px rgba(0,0,0,0.3)",
} as React.CSSProperties;

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
    setSubmitting(true); setError("");
    const res = await fetch("/api/turnos", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ servicioId, fecha, hora, notas }),
    });
    setSubmitting(false);
    if (!res.ok) { const d = await res.json(); setError(d.error ?? "Error al reservar"); return; }
    router.push("/turnos?success=1");
  }

  if (status === "loading") return (
    <div className="flex justify-center items-center py-32">
      <div className="w-8 h-8 border-2 border-purple-500/40 border-t-purple-400 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent mb-3">
        Reservar turno
      </h1>

      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
            {step >= s && (
              <div className="h-full rounded-full" style={{ background: "linear-gradient(90deg, #9333ea, #7c3aed)" }} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div>
          <p className="text-white/50 text-sm mb-4 font-medium">¿Qué servicio querés?</p>
          <div className="space-y-2">
            {servicios.map((s) => (
              <button
                key={s.id}
                onClick={() => { setServicioId(s.id); setStep(2); }}
                className="w-full text-left rounded-2xl p-4 transition-all duration-200"
                style={{
                  ...(servicioId === s.id
                    ? {
                        background: "rgba(147,51,234,0.2)",
                        border: "1px solid rgba(147,51,234,0.5)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), 0 0 20px rgba(147,51,234,0.2)",
                      }
                    : {
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }),
                }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-white">{s.nombre}</p>
                    <p className="text-white/35 text-xs mt-0.5">{s.duracion} min</p>
                  </div>
                  <p className="font-bold text-purple-300 text-lg">${s.precio.toLocaleString()}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div>
          <p className="text-white/50 text-sm mb-4 font-medium">¿Cuándo querés el turno?</p>

          <label className="block text-xs font-medium text-white/45 mb-1.5 uppercase tracking-wide">Fecha</label>
          <input
            type="date" min={getMinDate()} value={fecha} onChange={(e) => setFecha(e.target.value)}
            className="input-glass w-full rounded-xl px-4 py-2.5 mb-5 [color-scheme:dark]"
          />

          {fecha && (
            <>
              <label className="block text-xs font-medium text-white/45 mb-3 uppercase tracking-wide">
                Horario disponible
              </label>
              {loadingHorarios ? (
                <p className="text-white/30 text-sm">Cargando horarios...</p>
              ) : horarios.length === 0 ? (
                <p className="text-red-400/70 text-sm">No hay horarios disponibles para ese día</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {horarios.map((h) => (
                    <button
                      key={h}
                      onClick={() => setHora(h)}
                      className="py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
                      style={
                        hora === h
                          ? {
                              background: "linear-gradient(135deg, rgba(147,51,234,0.8), rgba(109,40,217,0.9))",
                              border: "1px solid rgba(167,99,255,0.5)",
                              color: "white",
                              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 12px rgba(147,51,234,0.35)",
                            }
                          : {
                              background: "rgba(255,255,255,0.06)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              color: "rgba(255,255,255,0.7)",
                            }
                      }
                    >
                      {h}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep(1)} className="btn-glass flex-1 py-3 rounded-2xl text-white/70 text-sm font-medium">
              Atrás
            </button>
            <button
              onClick={() => setStep(3)} disabled={!fecha || !hora}
              className="btn-primary flex-1 py-3 rounded-2xl text-white font-semibold"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && servicio && (
        <div>
          <p className="text-white/50 text-sm mb-4 font-medium">Confirmar reserva</p>

          <div className="rounded-2xl p-5 mb-5 space-y-3" style={glassPanel}>
            <div
              className="absolute top-0 left-6 right-6 h-px pointer-events-none"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)" }}
            />
            {[
              { label: "Servicio", value: servicio.nombre },
              {
                label: "Fecha",
                value: new Date(fecha + "T00:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" }),
              },
              { label: "Hora", value: `${hora} hs` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <span className="text-white/40 text-sm">{label}</span>
                <span className="font-medium text-white text-sm capitalize">{value}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-white/10 pt-3 mt-1">
              <span className="text-white/40 text-sm">Total</span>
              <span className="font-bold text-purple-300 text-xl">${servicio.precio.toLocaleString()}</span>
            </div>
          </div>

          <label className="block text-xs font-medium text-white/45 mb-1.5 uppercase tracking-wide">Notas (opcional)</label>
          <textarea
            value={notas} onChange={(e) => setNotas(e.target.value)} rows={3}
            className="input-glass w-full rounded-xl px-4 py-2.5 text-sm mb-5 resize-none"
            placeholder="¿Algo especial que quieras aclarar?"
          />

          {error && (
            <div className="text-sm rounded-xl px-4 py-2.5 text-white/90 mb-4"
              style={{ background: "rgba(239,68,68,0.25)", border: "1px solid rgba(239,68,68,0.3)" }}>
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn-glass flex-1 py-3 rounded-2xl text-white/70 text-sm font-medium">
              Atrás
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              className="btn-primary flex-1 py-3 rounded-2xl text-white font-semibold">
              {submitting ? "Reservando..." : "Confirmar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
