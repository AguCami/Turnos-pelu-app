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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center py-10">
        <div className="text-6xl mb-4">✂️</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-3">Peluquería</h1>
        <p className="text-gray-500 text-lg mb-8">Reservá tu turno online, fácil y rápido</p>
        <Link
          href="/turnos/nuevo"
          className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-3 rounded-xl text-lg shadow-md transition"
        >
          Reservar turno
        </Link>
      </div>

      {/* Servicios */}
      <section className="mt-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-5">Nuestros servicios</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {serviciosActivos.map((s) => (
            <div key={s.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">{s.nombre}</h3>
                  {s.descripcion && <p className="text-gray-500 text-sm mt-1">{s.descripcion}</p>}
                </div>
                <div className="text-right">
                  <p className="font-bold text-purple-700 text-lg">${s.precio.toLocaleString()}</p>
                  <p className="text-gray-400 text-xs">{s.duracion} min</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Info */}
      <section className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="bg-purple-50 rounded-xl p-5">
          <div className="text-3xl mb-2">📱</div>
          <h3 className="font-semibold">Desde tu celular</h3>
          <p className="text-sm text-gray-500 mt-1">Reservá en segundos desde cualquier dispositivo</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-5">
          <div className="text-3xl mb-2">✅</div>
          <h3 className="font-semibold">Confirmación inmediata</h3>
          <p className="text-sm text-gray-500 mt-1">Tu turno queda registrado al instante</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-5">
          <div className="text-3xl mb-2">🕐</div>
          <h3 className="font-semibold">Sin esperas</h3>
          <p className="text-sm text-gray-500 mt-1">Sabés exactamente cuándo es tu turno</p>
        </div>
      </section>
    </div>
  );
}
