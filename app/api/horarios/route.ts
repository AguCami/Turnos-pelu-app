import { NextResponse } from "next/server";
import { db } from "@/db";
import { turnos, horariosBloqueados } from "@/db/schema";
import { and, eq } from "drizzle-orm";

const HORARIOS = [
  "09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","12:30","14:00","14:30","15:00","15:30",
  "16:00","16:30","17:00","17:30","18:00","18:30",
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fecha = searchParams.get("fecha");
  if (!fecha) return NextResponse.json({ error: "Fecha requerida" }, { status: 400 });

  // Get occupied slots
  const ocupados = await db
    .select({ hora: turnos.hora })
    .from(turnos)
    .where(and(eq(turnos.fecha, fecha), eq(turnos.estado, "confirmado")));

  // Get blocked slots
  const bloqueados = await db
    .select()
    .from(horariosBloqueados)
    .where(eq(horariosBloqueados.fecha, fecha));

  const horasOcupadas = new Set(ocupados.map((t) => t.hora));

  const disponibles = HORARIOS.filter((hora) => {
    if (horasOcupadas.has(hora)) return false;
    for (const b of bloqueados) {
      if (!b.horaInicio && !b.horaFin) return false; // full day block
      if (b.horaInicio && b.horaFin && hora >= b.horaInicio && hora < b.horaFin) return false;
    }
    return true;
  });

  return NextResponse.json({ disponibles, todos: HORARIOS });
}
