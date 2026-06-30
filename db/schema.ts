import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"),
  image: text("image"),
  role: text("role", { enum: ["cliente", "admin"] }).notNull().default("cliente"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const servicios = sqliteTable("servicios", {
  id: text("id").primaryKey(),
  nombre: text("nombre").notNull(),
  descripcion: text("descripcion"),
  duracion: integer("duracion").notNull(), // minutes
  precio: real("precio").notNull(),
  activo: integer("activo", { mode: "boolean" }).notNull().default(true),
});

export const turnos = sqliteTable("turnos", {
  id: text("id").primaryKey(),
  usuarioId: text("usuario_id").notNull().references(() => users.id),
  servicioId: text("servicio_id").notNull().references(() => servicios.id),
  fecha: text("fecha").notNull(), // YYYY-MM-DD
  hora: text("hora").notNull(),   // HH:MM
  estado: text("estado", { enum: ["pendiente", "confirmado", "cancelado"] }).notNull().default("pendiente"),
  notas: text("notas"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const horariosBloqueados = sqliteTable("horarios_bloqueados", {
  id: text("id").primaryKey(),
  fecha: text("fecha").notNull(),
  horaInicio: text("hora_inicio"),
  horaFin: text("hora_fin"),
  motivo: text("motivo"),
});

export type User = typeof users.$inferSelect;
export type Servicio = typeof servicios.$inferSelect;
export type Turno = typeof turnos.$inferSelect;
