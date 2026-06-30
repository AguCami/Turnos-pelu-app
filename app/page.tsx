import Link from "next/link";
import { db } from "@/db";
import { servicios } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function Home() {
  const serviciosActivos = await db
    .select()
    .from(servicios)
    .where(eq(servicios.activo, true));

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center py-12 relative">
        {/* Glow blob */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-72 h-72 rounded-full blur-3xl opacity-30"
            style={{ background: "radial-gradient(circle, rgba(147,51,234,0.8) 0%, transparent 70%)" }}
          />
        </div>

        <div className="relative">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl text-4xl mb-6 glass"
            style={{ borderRadius: "1.5rem" }}
          >
            ✂️
          </div>
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-br from-white via-white to-purple-300 bg-clip-text text-transparent">
            Peluquería
          </h1>
          <p className="text-white/50 text-lg mb-8">Reservá tu turno online, fácil y rápido</p>
          <Link
            href="/turnos/nuevo"
            className="btn-primary inline-block font-semibold px-8 py-3.5 rounded-2xl text-white text-base"
          >
            Reservar turno
          </Link>
        </div>
      </div>

      {/* Servicios */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-white/80 mb-4 px-1">Nuestros servicios</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {serviciosActivos.map((s) => (
            <div key={s.id} className="glass-card p-5 group hover:border-purple-500/30 transition-all duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-white text-base">{s.nombre}</h3>
                  {s.descripcion && <p className="text-white/45 text-sm mt-1">{s.descripcion}</p>}
                  <p className="text-white/30 text-xs mt-2">{s.duracion} min</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-purple-300 text-xl">${s.precio.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: "📱", title: "Desde tu celular", desc: "Reservá en segundos desde cualquier dispositivo" },
          { icon: "✅", title: "Confirmación inmediata", desc: "Tu turno queda registrado al instante" },
          { icon: "🕐", title: "Sin esperas", desc: "Sabés exactamente cuándo es tu turno" },
        ].map((f) => (
          <div key={f.title} className="glass-card p-5 text-center">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="font-semibold text-white text-sm">{f.title}</h3>
            <p className="text-white/40 text-xs mt-1.5 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
