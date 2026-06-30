import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL ?? "file:./peluqueria.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });

// Auto-migrate: create tables and seed on first boot
let initialized = false;
export async function ensureDB() {
  if (initialized) return;
  initialized = true;

  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT,
      image TEXT,
      role TEXT NOT NULL DEFAULT 'cliente',
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS servicios (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      duracion INTEGER NOT NULL,
      precio REAL NOT NULL,
      activo INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS turnos (
      id TEXT PRIMARY KEY,
      usuario_id TEXT NOT NULL,
      servicio_id TEXT NOT NULL,
      fecha TEXT NOT NULL,
      hora TEXT NOT NULL,
      estado TEXT NOT NULL DEFAULT 'pendiente',
      notas TEXT,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS horarios_bloqueados (
      id TEXT PRIMARY KEY,
      fecha TEXT NOT NULL,
      hora_inicio TEXT,
      hora_fin TEXT,
      motivo TEXT
    );
  `);

  // Seed servicios if empty
  const { rows } = await client.execute("SELECT COUNT(*) as c FROM servicios");
  if ((rows[0].c as number) === 0) {
    for (const [nombre, desc, dur, precio] of [
      ["Corte de pelo", "Corte clásico a tijera o máquina", 30, 2500],
      ["Barba", "Perfilado y arreglo de barba", 20, 1500],
      ["Corte + Barba", "Combo completo corte y barba", 50, 3500],
      ["Degradé", "Fade o degradé moderno", 40, 3000],
    ]) {
      await client.execute({
        sql: "INSERT INTO servicios (id, nombre, descripcion, duracion, precio, activo) VALUES (?, ?, ?, ?, ?, 1)",
        args: [randomUUID(), nombre, desc, dur, precio],
      });
    }
  }

  // Seed admin if env vars set
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const { rows: existing } = await client.execute({
      sql: "SELECT id FROM users WHERE email = ?",
      args: [adminEmail],
    });
    if (existing.length === 0) {
      const hash = await bcrypt.hash(adminPassword, 12);
      await client.execute({
        sql: "INSERT INTO users (id, name, email, password, role, created_at) VALUES (?, 'Admin', ?, ?, 'admin', ?)",
        args: [randomUUID(), adminEmail, hash, Date.now()],
      });
    }
  }
}
