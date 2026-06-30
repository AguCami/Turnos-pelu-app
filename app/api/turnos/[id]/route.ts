import { NextResponse } from "next/server";
import { db } from "@/db";
import { turnos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { estado } = await req.json();
  const [turno] = await db.select().from(turnos).where(eq(turnos.id, params.id));

  if (!turno) return NextResponse.json({ error: "Turno no encontrado" }, { status: 404 });

  // Clientes solo pueden cancelar sus propios turnos
  if (session.user.role !== "admin") {
    if (turno.usuarioId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    if (estado !== "cancelado") {
      return NextResponse.json({ error: "Solo podés cancelar tu turno" }, { status: 403 });
    }
  }

  const updated = await db
    .update(turnos)
    .set({ estado })
    .where(eq(turnos.id, params.id))
    .returning();

  return NextResponse.json(updated[0]);
}
