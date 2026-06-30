"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Servicio = { id: string; nombre: string; descripcion?: string; duracion: number; precio: number };

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
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, descripcion, duracion: parseInt(duracion), precio: parseFloat(precio) }),
    });
    const nuevo = await res.json();
    setServicios((prev) => [...prev, nuevo]);
    setShowForm(false);
    setNombre(""); setDescripcion(""); setDuracion("30"); setPrecio("");
    setSaving(false);
  }

  if (status === "loading") return (
    <div className="flex justify-center items-center py-32">
      <div className="w-8 h-8 border-2 border-yellow-600/40 border-t-yellow-400 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
          Servicios
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className={showForm ? "btn-glass px-5 py-2 rounded-2xl text-white/70 text-sm font-medium" : "btn-primary px-5 py-2 rounded-2xl text-white text-sm font-semibold"}
        >
          {showForm ? "Cancelar" : "+ Agregar"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="rounded-2xl p-5 mb-6 space-y-4" style={{
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.15)",
          boxShadow: "inset 0 1.5px 0 rgba(255,255,255,0.18), 0 8px 32px rgba(0,0,0,0.3)",
        }}>
          <p className="font-semibold text-white/70 text-sm">Nuevo servicio</p>
          <div>
            <label className="block text-xs font-medium text-white/45 mb-1.5 uppercase tracking-wide">Nombre</label>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} required
              className="input-glass w-full rounded-xl px-4 py-2.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/45 mb-1.5 uppercase tracking-wide">Descripción (opcional)</label>
            <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
              className="input-glass w-full rounded-xl px-4 py-2.5 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/45 mb-1.5 uppercase tracking-wide">Duración (min)</label>
              <input type="number" value={duracion} onChange={(e) => setDuracion(e.target.value)} required min="10"
                className="input-glass w-full rounded-xl px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/45 mb-1.5 uppercase tracking-wide">Precio ($)</label>
              <input type="number" value={precio} onChange={(e) => setPrecio(e.target.value)} required min="0"
                className="input-glass w-full rounded-xl px-4 py-2.5 text-sm" />
            </div>
          </div>
          <button type="submit" disabled={saving}
            className="btn-primary w-full py-3 rounded-2xl text-white font-semibold">
            {saving ? "Guardando..." : "Guardar servicio"}
          </button>
        </form>
      )}

      <div className="space-y-2">
        {servicios.map((s) => (
          <div key={s.id} className="rounded-2xl p-4 flex justify-between items-center" style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.09)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
          }}>
            <div>
              <p className="font-semibold text-white">{s.nombre}</p>
              {s.descripcion && <p className="text-white/35 text-xs mt-0.5">{s.descripcion}</p>}
              <p className="text-white/30 text-xs mt-0.5">{s.duracion} min</p>
            </div>
            <p className="font-bold text-gold-light text-lg">${s.precio.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
