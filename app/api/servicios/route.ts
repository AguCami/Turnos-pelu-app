import { NextResponse } from "next/server";
import { db, ensureDB } from "@/db";
import { servicios } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { randomUUID } from "crypto";

export async function GET() {
  await ensureDB();
  const data = await db.select().from(servicios).where(eq(servicios.activo, true));
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const { nombre, descripcion, duracion, precio } = await req.json();
  const nuevo = await db
    .insert(servicios)
    .values({ id: randomUUID(), nombre, descripcion, duracion, precio, activo: true })
    .returning();
  return NextResponse.json(nuevo[0]);
}
