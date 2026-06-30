"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Servicio = { id: string; nombre: string; descripcion?: string; duracion: number; precio: number; activo: boolean };

export default function AdminServicios() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [duracion, setDuracion] = useState("30");
  const [precio, setPrecio] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session.user.role !== "admin") router.push("/");
  }, [status, session, router]);

  useEffect(() => {
    fetch("/api/servicios").then((r) => r.json()).then(setServicios);
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/servicios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, descripcion, duracion: parseInt(duracion), precio: parseFloat(precio) }),
    });
    const nuevo = await res.json();
    setServicios((prev) => [...prev, nuevo]);
    setShowForm(false);
    setNombre(""); setDescripcion(""); setDuracion("30"); setPrecio("");
    setSaving(false);
  }

  if (status === "loading") return <div className="flex justify-center py-20 text-gray-400">Cargando...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Servicios</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-xl"
        >
          {showForm ? "Cancelar" : "+ Agregar"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6 space-y-4">
          <h2 className="font-semibold text-gray-700">Nuevo servicio</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              value={nombre} onChange={(e) => setNombre(e.target.value)} required
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
            <input
              value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duración (min)</label>
              <input
                type="number" value={duracion} onChange={(e) => setDuracion(e.target.value)} required min="10"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio ($)</label>
              <input
                type="number" value={precio} onChange={(e) => setPrecio(e.target.value)} required min="0"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <button
            type="submit" disabled={saving}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl"
          >
            {saving ? "Guardando..." : "Guardar servicio"}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {servicios.map((s) => (
          <div key={s.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <p className="font-semibold text-gray-800">{s.nombre}</p>
              {s.descripcion && <p className="text-gray-400 text-xs mt-0.5">{s.descripcion}</p>}
              <p className="text-gray-500 text-sm mt-0.5">{s.duracion} min</p>
            </div>
            <p className="font-bold text-purple-700 text-lg">${s.precio.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
