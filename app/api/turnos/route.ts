import { NextResponse } from "next/server";
import { db, ensureDB } from "@/db";
import { turnos, servicios, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { randomUUID } from "crypto";

export async function GET(req: Request) {
  await ensureDB();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  if (session.user.role === "admin") {
    const data = await db
      .select({
        id: turnos.id,
        fecha: turnos.fecha,
        hora: turnos.hora,
        estado: turnos.estado,
        notas: turnos.notas,
        createdAt: turnos.createdAt,
        servicio: servicios.nombre,
        precio: servicios.precio,
        duracion: servicios.duracion,
        cliente: users.name,
        clienteEmail: users.email,
      })
      .from(turnos)
      .innerJoin(servicios, eq(turnos.servicioId, servicios.id))
      .innerJoin(users, eq(turnos.usuarioId, users.id))
      .orderBy(turnos.fecha, turnos.hora);
    return NextResponse.json(data);
  }

  const data = await db
    .select({
      id: turnos.id,
      fecha: turnos.fecha,
      hora: turnos.hora,
      estado: turnos.estado,
      notas: turnos.notas,
      createdAt: turnos.createdAt,
      servicio: servicios.nombre,
      precio: servicios.precio,
      duracion: servicios.duracion,
    })
    .from(turnos)
    .innerJoin(servicios, eq(turnos.servicioId, servicios.id))
    .where(eq(turnos.usuarioId, session.user.id))
    .orderBy(turnos.fecha, turnos.hora);

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  await ensureDB();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { servicioId, fecha, hora, notas } = await req.json();
  if (!servicioId || !fecha || !hora) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  // Check slot availability
  const [conflicto] = await db
    .select()
    .from(turnos)
    .where(
      and(
        eq(turnos.fecha, fecha),
        eq(turnos.hora, hora),
        eq(turnos.estado, "confirmado")
      )
    );
  if (conflicto) {
    return NextResponse.json({ error: "Ese horario ya está ocupado" }, { status: 409 });
  }

  const nuevo = await db
    .insert(turnos)
    .values({
      id: randomUUID(),
      usuarioId: session.user.id,
      servicioId,
      fecha,
      hora,
      notas,
      estado: "pendiente",
      createdAt: new Date(),
    })
    .returning();

  return NextResponse.json(nuevo[0], { status: 201 });
}
