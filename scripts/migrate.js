const Database = require("better-sqlite3");
const path = require("path");
const { randomUUID } = require("crypto");

const DB_PATH = path.join(process.cwd(), "peluqueria.db");
const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");

// Create tables
sqlite.exec(`
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
    usuario_id TEXT NOT NULL REFERENCES users(id),
    servicio_id TEXT NOT NULL REFERENCES servicios(id),
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
const count = sqlite.prepare("SELECT COUNT(*) as c FROM servicios").get();
if (count.c === 0) {
  const insertServicio = sqlite.prepare(
    "INSERT INTO servicios (id, nombre, descripcion, duracion, precio, activo) VALUES (?, ?, ?, ?, ?, 1)"
  );
  insertServicio.run(randomUUID(), "Corte de pelo", "Corte clásico a tijera o máquina", 30, 2500);
  insertServicio.run(randomUUID(), "Barba", "Perfilado y arreglo de barba", 20, 1500);
  insertServicio.run(randomUUID(), "Corte + Barba", "Combo completo corte y barba", 50, 3500);
  insertServicio.run(randomUUID(), "Degradé", "Fade o degradé moderno", 40, 3000);
  console.log("Servicios de ejemplo creados.");
}

// Create admin user if not exists
const adminEmail = process.env.ADMIN_EMAIL || "admin@peluqueria.com";
const existing = sqlite.prepare("SELECT id FROM users WHERE email = ?").get(adminEmail);
if (!existing) {
  const bcrypt = require("bcryptjs");
  const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || "admin123", 12);
  sqlite.prepare(
    "INSERT INTO users (id, name, email, password, role, created_at) VALUES (?, ?, ?, ?, 'admin', ?)"
  ).run(randomUUID(), "Admin", adminEmail, hash, Date.now());
  console.log(`Admin creado: ${adminEmail}`);
}

console.log("Base de datos lista.");
sqlite.close();
