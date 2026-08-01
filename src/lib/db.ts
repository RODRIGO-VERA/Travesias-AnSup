/**
 * Capa de acceso a datos de Travesías AnSup — versión Supabase.
 *
 * Mismo contrato de funciones que la versión JSON original (mismos nombres,
 * mismos parámetros), pero ahora todas son `async` porque consultan
 * Postgres a través de Supabase. Por eso cada página/ruta que las usa debe
 * hacer `await`. Ver supabase/schema.sql para el modelo de tablas.
 */
import { supabaseAdmin as db } from "./supabase";
import bcrypt from "bcryptjs";
import type {
  Panorama,
  PanoramaImage,
  PanoramaVideo,
  Schedule,
  Booking,
  Equipment,
  ReservationCode,
  ApprovalTemplate,
  BookingStatusHistory,
  Notice,
  FaqItem,
  Consulta,
  AdminUser,
  SiteSettings,
} from "@/types";

function must<T>(data: T | null, error: unknown, msg: string): T {
  if (error) throw new Error(`${msg}: ${(error as { message?: string })?.message ?? error}`);
  if (data === null) throw new Error(msg);
  return data;
}

// ---------- Panoramas ----------
async function hydratePanorama(row: any): Promise<Panorama> {
  const [{ data: images }, { data: videos }] = await Promise.all([
    db.from("panorama_images").select("*").eq("panorama_id", row.id).order("orden"),
    db.from("panorama_videos").select("*").eq("panorama_id", row.id).order("orden"),
  ]);
  return {
    id: row.id,
    nombre: row.nombre,
    slug: row.slug,
    descripcion: row.descripcion ?? "",
    historia_entorno: row.historia,
    ubicacion: row.ubicacion ?? "",
    punto_encuentro: row.punto_encuentro ?? "",
    duracion: row.duracion ?? "",
    dificultad: row.dificultad,
    edad_minima: row.edad_minima,
    capacidad_maxima: row.capacidad_maxima,
    precio: row.precio,
    precio_equipamiento: row.precio_equipamiento,
    recomendaciones: row.recomendaciones ?? [],
    que_llevar: row.que_llevar ?? [],
    incluye: row.incluye ?? [],
    estado: row.estado,
    orden: row.orden,
    images: (images ?? []) as PanoramaImage[],
    videos: (videos ?? []) as PanoramaVideo[],
    fecha_creacion: row.fecha_creacion,
  };
}

export async function getPanoramas(): Promise<Panorama[]> {
  const { data, error } = await db.from("panoramas").select("*").order("orden");
  const rows = must(data, error, "No se pudieron obtener los panoramas");
  return Promise.all(rows.map(hydratePanorama));
}

export async function getPanoramaBySlug(slug: string): Promise<Panorama | undefined> {
  const { data, error } = await db.from("panoramas").select("*").eq("slug", slug).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? hydratePanorama(data) : undefined;
}

export async function getPanoramaById(id: string): Promise<Panorama | undefined> {
  const { data, error } = await db.from("panoramas").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? hydratePanorama(data) : undefined;
}

export async function upsertPanorama(p: Panorama): Promise<Panorama> {
  const { images, videos, historia_entorno, ...rest } = p;
  const { data, error } = await db
    .from("panoramas")
    .upsert({ ...rest, historia: historia_entorno }, { onConflict: "id" })
    .select()
    .single();
  const row = must(data, error, "No se pudo guardar el panorama");

  await db.from("panorama_images").delete().eq("panorama_id", row.id);
  if (images?.length) {
    await db.from("panorama_images").insert(images.map((i) => ({ ...i, panorama_id: row.id })));
  }
  await db.from("panorama_videos").delete().eq("panorama_id", row.id);
  if (videos?.length) {
    await db.from("panorama_videos").insert(videos.map((v) => ({ ...v, panorama_id: row.id })));
  }
  return hydratePanorama(row);
}

export async function deletePanorama(id: string): Promise<void> {
  const { error } = await db.from("panoramas").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ---------- Schedules ----------
export async function getSchedules(): Promise<Schedule[]> {
  const { data, error } = await db.from("schedules").select("*");
  return must(data, error, "No se pudieron obtener los horarios") as Schedule[];
}

export async function getSchedulesByPanorama(panoramaId: string): Promise<Schedule[]> {
  const { data, error } = await db
    .from("schedules")
    .select("*")
    .eq("panorama_id", panoramaId)
    .order("fecha")
    .order("hora_inicio");
  return must(data, error, "No se pudieron obtener los horarios del panorama") as Schedule[];
}

export async function getScheduleById(id: string): Promise<Schedule | undefined> {
  const { data, error } = await db.from("schedules").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Schedule) ?? undefined;
}

export async function upsertSchedule(s: Schedule): Promise<Schedule> {
  const { data, error } = await db.from("schedules").upsert(s, { onConflict: "id" }).select().single();
  return must(data, error, "No se pudo guardar el horario") as Schedule;
}

export async function deleteSchedule(id: string): Promise<void> {
  const { error } = await db.from("schedules").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

function computeScheduleEstado(s: Schedule): Schedule["estado"] {
  if (["Suspendido", "Cerrado", "Reprogramado", "Finalizado"].includes(s.estado)) return s.estado;
  if (s.cupos_reservados >= s.cupos_totales) return "Completo";
  if (s.cupos_totales - s.cupos_reservados <= 3) return "Cupos limitados";
  return "Disponible";
}

// ---------- Equipment ----------
export async function getEquipment(): Promise<Equipment[]> {
  const { data, error } = await db.from("equipment").select("*");
  return must(data, error, "No se pudo obtener el equipamiento") as Equipment[];
}

export async function upsertEquipment(e: Equipment): Promise<Equipment> {
  const { data, error } = await db.from("equipment").upsert(e, { onConflict: "id" }).select().single();
  return must(data, error, "No se pudo guardar el equipo") as Equipment;
}

export async function deleteEquipment(id: string): Promise<void> {
  const { error } = await db.from("equipment").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ---------- Reservation Codes ----------
export async function getCodes(): Promise<ReservationCode[]> {
  const { data, error } = await db.from("reservation_codes").select("*").order("fecha_creacion", { ascending: false });
  return must(data, error, "No se pudieron obtener los códigos") as ReservationCode[];
}

export async function getCodeByValue(codigo: string): Promise<ReservationCode | undefined> {
  const { data, error } = await db.from("reservation_codes").select("*").ilike("codigo", codigo).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as ReservationCode) ?? undefined;
}

export async function codeExists(codigo: string): Promise<boolean> {
  return !!(await getCodeByValue(codigo));
}

export async function createCode(
  input: Partial<ReservationCode> & { codigo: string; creado_por: string }
): Promise<ReservationCode> {
  if (await codeExists(input.codigo)) {
    throw new Error("Ya existe un código con ese valor.");
  }
  const { data, error } = await db
    .from("reservation_codes")
    .insert({
      codigo: input.codigo,
      estado: input.estado ?? "Disponible",
      booking_id: input.booking_id ?? null,
      panorama_id: input.panorama_id ?? null,
      descripcion_interna: input.descripcion_interna ?? "",
      fecha_vencimiento: input.fecha_vencimiento ?? null,
      creado_por: input.creado_por,
    })
    .select()
    .single();
  return must(data, error, "No se pudo crear el código") as ReservationCode;
}

export async function anularCode(id: string, motivo: string, admin: string): Promise<void> {
  const { error } = await db
    .from("reservation_codes")
    .update({ estado: "Anulado", motivo_anulacion: motivo, anulado_por: admin })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

async function generateAutoCode(): Promise<string> {
  const year = new Date().getFullYear();
  const { data } = await db.from("reservation_codes").select("codigo").ilike("codigo", `ANSUP-${year}-%`);
  const nums = (data ?? [])
    .map((c) => parseInt(c.codigo.split("-").pop() || "0", 10))
    .filter((n) => !isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `ANSUP-${year}-${String(next).padStart(4, "0")}`;
}

// ---------- Bookings ----------
export async function getBookings(): Promise<Booking[]> {
  const { data, error } = await db.from("bookings").select("*").order("fecha_creacion", { ascending: false });
  return must(data, error, "No se pudieron obtener las reservas") as Booking[];
}

export async function getBookingByCodigo(codigo: string): Promise<Booking | undefined> {
  const { data, error } = await db.from("bookings").select("*").ilike("codigo_reserva", codigo).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Booking) ?? undefined;
}

export async function getBookingById(id: string): Promise<Booking | undefined> {
  const { data, error } = await db.from("bookings").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Booking) ?? undefined;
}

export async function getHistoryForBooking(bookingId: string): Promise<BookingStatusHistory[]> {
  const { data, error } = await db
    .from("booking_status_history")
    .select("*")
    .eq("booking_id", bookingId)
    .order("fecha_hora");
  return must(data, error, "No se pudo obtener el historial") as BookingStatusHistory[];
}

async function addHistory(entry: Omit<BookingStatusHistory, "id" | "fecha_hora">): Promise<void> {
  const { error } = await db.from("booking_status_history").insert(entry);
  if (error) throw new Error(error.message);
}

export interface CrearReservaInput {
  panorama_id: string;
  schedule_id: string;
  nombre_cliente: string;
  telefono: string;
  correo: string;
  adultos: number;
  ninos: number;
  edad_ninos?: string;
  experiencia_previa: boolean;
  equipamiento: { equipment_id: string; cantidad: number; talla?: string }[];
  observaciones?: string;
  acepta_terminos: boolean;
  autoriza_contacto: boolean;
  codigo_manual?: string;
}

export async function crearReserva(input: CrearReservaInput): Promise<Booking> {
  const [panorama, schedule, equipmentList] = await Promise.all([
    getPanoramaById(input.panorama_id),
    getScheduleById(input.schedule_id),
    getEquipment(),
  ]);
  if (!panorama || !schedule) throw new Error("Panorama u horario no encontrado.");

  const totalPersonas = input.adultos + input.ninos;
  const cuposDisponibles = schedule.cupos_totales - schedule.cupos_reservados;
  if (totalPersonas > cuposDisponibles) {
    throw new Error("No hay cupos suficientes para la cantidad de personas solicitada.");
  }

  let valorTotal = totalPersonas * schedule.precio;
  for (const item of input.equipamiento) {
    const eq = equipmentList.find((e) => e.id === item.equipment_id);
    if (eq) valorTotal += eq.precio_arriendo * item.cantidad;
  }

  let codigoReserva: string;
  if (input.codigo_manual) {
    const existing = await getCodeByValue(input.codigo_manual);
    if (!existing || existing.estado !== "Disponible") {
      throw new Error("El código ingresado no es válido o ya fue utilizado.");
    }
    codigoReserva = existing.codigo;
  } else {
    codigoReserva = await generateAutoCode();
    await createCode({
      codigo: codigoReserva,
      creado_por: "Sistema (automático)",
      panorama_id: panorama.id,
      estado: "Asignado",
    });
  }

  const { data: bookingRow, error: bookingError } = await db
    .from("bookings")
    .insert({
      codigo_reserva: codigoReserva,
      panorama_id: panorama.id,
      schedule_id: schedule.id,
      nombre_cliente: input.nombre_cliente,
      telefono: input.telefono,
      correo: input.correo,
      adultos: input.adultos,
      ninos: input.ninos,
      edad_ninos: input.edad_ninos,
      total_personas: totalPersonas,
      experiencia_previa: input.experiencia_previa,
      equipamiento: input.equipamiento,
      observaciones: input.observaciones,
      acepta_terminos: input.acepta_terminos,
      autoriza_contacto: input.autoriza_contacto,
      valor_total: valorTotal,
      estado: "Pendiente de aprobación",
      estado_pago: "Pendiente",
    })
    .select()
    .single();
  const booking = must(bookingRow, bookingError, "No se pudo crear la reserva") as Booking;

  await db.from("reservation_codes").update({ estado: "Asignado", booking_id: booking.id }).eq("codigo", codigoReserva);

  await db
    .from("schedules")
    .update({
      cupos_reservados: schedule.cupos_reservados + totalPersonas,
      estado: computeScheduleEstado({ ...schedule, cupos_reservados: schedule.cupos_reservados + totalPersonas }),
    })
    .eq("id", schedule.id);

  await addHistory({
    booking_id: booking.id,
    estado_anterior: "-",
    estado_nuevo: "Solicitud recibida",
    mensaje_cliente: "Tu solicitud fue recibida y está pendiente de aprobación.",
    administrador: "Sistema",
  });

  return booking;
}

export async function cambiarEstadoReserva(
  bookingId: string,
  nuevoEstado: Booking["estado"],
  opts: { mensajeCliente?: string; observacionInterna?: string; administrador: string; motivoRechazo?: string }
): Promise<Booking> {
  const booking = await getBookingById(bookingId);
  if (!booking) throw new Error("Reserva no encontrada.");
  const estadoAnterior = booking.estado;

  const { data, error } = await db
    .from("bookings")
    .update({ estado: nuevoEstado, motivo_rechazo: opts.motivoRechazo ?? booking.motivo_rechazo })
    .eq("id", bookingId)
    .select()
    .single();
  const updated = must(data, error, "No se pudo actualizar la reserva") as Booking;

  if (["Rechazada", "Cancelada por el cliente", "Cancelada por el administrador"].includes(nuevoEstado)) {
    const schedule = await getScheduleById(booking.schedule_id);
    if (schedule) {
      const nuevosCupos = Math.max(0, schedule.cupos_reservados - booking.total_personas);
      await db
        .from("schedules")
        .update({ cupos_reservados: nuevosCupos, estado: computeScheduleEstado({ ...schedule, cupos_reservados: nuevosCupos }) })
        .eq("id", schedule.id);
    }
  }

  if (nuevoEstado === "Aprobada") {
    await db
      .from("reservation_codes")
      .update({ estado: "Utilizado", fecha_utilizacion: new Date().toISOString() })
      .eq("booking_id", bookingId);
  }

  await addHistory({
    booking_id: bookingId,
    estado_anterior: estadoAnterior,
    estado_nuevo: nuevoEstado,
    mensaje_cliente: opts.mensajeCliente,
    observacion_interna: opts.observacionInterna,
    administrador: opts.administrador,
  });

  return updated;
}

// ---------- Approval Templates ----------
export async function getTemplates(): Promise<ApprovalTemplate[]> {
  const { data, error } = await db.from("approval_templates").select("*");
  return must(data, error, "No se pudieron obtener las plantillas") as ApprovalTemplate[];
}

export async function upsertTemplate(t: ApprovalTemplate): Promise<ApprovalTemplate> {
  const { data, error } = await db
    .from("approval_templates")
    .upsert({ ...t, fecha_actualizacion: new Date().toISOString() }, { onConflict: "id" })
    .select()
    .single();
  return must(data, error, "No se pudo guardar la plantilla") as ApprovalTemplate;
}

export async function deleteTemplate(id: string): Promise<void> {
  const { error } = await db.from("approval_templates").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function getDefaultTemplate(): Promise<ApprovalTemplate | undefined> {
  const templates = await getTemplates();
  return templates.find((t) => t.predeterminada) ?? templates[0];
}

// ---------- Notices ----------
export async function getNotices(): Promise<Notice[]> {
  const { data, error } = await db.from("notices").select("*");
  return must(data, error, "No se pudieron obtener los avisos") as Notice[];
}

export async function upsertNotice(n: Partial<Notice> & { titulo: string }): Promise<Notice> {
  const { data, error } = await db.from("notices").upsert(n, { onConflict: "id" }).select().single();
  return must(data, error, "No se pudo guardar el aviso") as Notice;
}

export async function deleteNotice(id: string): Promise<void> {
  const { error } = await db.from("notices").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function getActiveNotices(): Promise<Notice[]> {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await db
    .from("notices")
    .select("*")
    .eq("activo", true)
    .lte("fecha_inicio", today)
    .or(`fecha_termino.is.null,fecha_termino.gte.${today}`);
  return must(data, error, "No se pudieron obtener los avisos activos") as Notice[];
}

// ---------- FAQ ----------
export async function getFaq(): Promise<FaqItem[]> {
  const { data, error } = await db.from("faq").select("*").order("orden");
  return must(data, error, "No se pudieron obtener las preguntas frecuentes") as FaqItem[];
}

export async function upsertFaqItem(f: Partial<FaqItem> & { pregunta: string }): Promise<FaqItem> {
  const { data, error } = await db.from("faq").upsert(f, { onConflict: "id" }).select().single();
  return must(data, error, "No se pudo guardar la pregunta") as FaqItem;
}

export async function deleteFaqItem(id: string): Promise<void> {
  const { error } = await db.from("faq").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ---------- Consultas ----------
export async function getConsultas(): Promise<Consulta[]> {
  const { data, error } = await db.from("consultas").select("*").order("fecha_creacion", { ascending: false });
  return must(data, error, "No se pudieron obtener las consultas") as Consulta[];
}

export async function crearConsulta(input: Omit<Consulta, "id" | "estado" | "fecha_creacion">): Promise<Consulta> {
  const { data, error } = await db.from("consultas").insert({ ...input, estado: "Nueva" }).select().single();
  return must(data, error, "No se pudo registrar la consulta") as Consulta;
}

export async function actualizarConsulta(id: string, estado: Consulta["estado"]): Promise<Consulta> {
  const { data, error } = await db.from("consultas").update({ estado }).eq("id", id).select().single();
  return must(data, error, "No se pudo actualizar la consulta") as Consulta;
}

// ---------- Estadísticas ----------
export async function getEstadisticas() {
  const [bookings, panoramas, codes] = await Promise.all([getBookings(), getPanoramas(), getCodes()]);

  const porPanorama: Record<string, number> = {};
  for (const b of bookings) porPanorama[b.panorama_id] = (porPanorama[b.panorama_id] || 0) + 1;
  const panoramaMasSolicitado = Object.entries(porPanorama).sort((a, b) => b[1] - a[1])[0];

  return {
    total_reservas: bookings.length,
    aprobadas: bookings.filter((b) => b.estado === "Aprobada" || b.estado === "Confirmada").length,
    pendientes: bookings.filter((b) => b.estado === "Pendiente de aprobación" || b.estado === "En revisión").length,
    rechazadas: bookings.filter((b) => b.estado === "Rechazada").length,
    canceladas: bookings.filter((b) => b.estado.startsWith("Cancelada")).length,
    participantes: bookings.reduce((sum, b) => sum + b.total_personas, 0),
    panorama_mas_solicitado: panoramaMasSolicitado
      ? panoramas.find((p) => p.id === panoramaMasSolicitado[0])?.nombre ?? "-"
      : "-",
    codigos_disponibles: codes.filter((c) => c.estado === "Disponible").length,
    codigos_utilizados: codes.filter((c) => c.estado === "Utilizado").length,
    ingresos_estimados: bookings
      .filter((b) => ["Aprobada", "Confirmada", "Pagada", "Actividad completada"].includes(b.estado))
      .reduce((sum, b) => sum + b.valor_total, 0),
  };
}

// ---------- Administradores ----------
function stripHash(row: any): AdminUser {
  return {
    id: row.id,
    nombre: row.nombre,
    correo: row.correo,
    telefono: row.telefono ?? undefined,
    rol: row.rol,
    estado: row.estado,
    fecha_creacion: row.fecha_creacion,
    ultimo_acceso: row.ultimo_acceso ?? undefined,
  };
}

export async function getAdmins(): Promise<AdminUser[]> {
  const { data, error } = await db.from("admin_users").select("*").order("fecha_creacion");
  const rows = must(data, error, "No se pudieron obtener los administradores") as any[];
  return rows.map(stripHash);
}

// Devuelve el registro completo (incluye password_hash) — solo para uso interno de auth.
export async function getAdminByEmailRaw(correo: string) {
  const { data, error } = await db
    .from("admin_users")
    .select("*")
    .ilike("correo", correo)
    .eq("estado", "Activo")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as
    | {
        id: string;
        nombre: string;
        correo: string;
        password_hash: string;
        rol: "Superadministrador" | "Administrador";
        estado: string;
      }
    | null;
}

export async function getAdminById(id: string): Promise<AdminUser | null> {
  const { data, error } = await db.from("admin_users").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? stripHash(data) : null;
}

export async function crearAdmin(input: {
  nombre: string;
  correo: string;
  password: string;
  rol: "Superadministrador" | "Administrador";
  telefono?: string;
}): Promise<AdminUser> {
  const existing = await db.from("admin_users").select("id").ilike("correo", input.correo).maybeSingle();
  if (existing.data) throw new Error("Ya existe un administrador con ese correo.");
  const password_hash = bcrypt.hashSync(input.password, 10);
  const { data, error } = await db
    .from("admin_users")
    .insert({
      nombre: input.nombre,
      correo: input.correo,
      telefono: input.telefono,
      password_hash,
      rol: input.rol,
      estado: "Activo",
    })
    .select()
    .single();
  return stripHash(must(data, error, "No se pudo crear el administrador"));
}

export async function actualizarCuentaAdmin(
  id: string,
  input: { nombre?: string; correo?: string; telefono?: string; password?: string }
): Promise<AdminUser> {
  const patch: Record<string, unknown> = {};
  if (input.nombre) patch.nombre = input.nombre;
  if (input.correo) patch.correo = input.correo;
  if (input.telefono !== undefined) patch.telefono = input.telefono;
  if (input.password) patch.password_hash = bcrypt.hashSync(input.password, 10);

  const { data, error } = await db.from("admin_users").update(patch).eq("id", id).select().single();
  return stripHash(must(data, error, "No se pudo actualizar la cuenta"));
}

export async function cambiarEstadoAdmin(id: string, estado: "Activo" | "Inactivo"): Promise<void> {
  const { error } = await db.from("admin_users").update({ estado }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function registrarUltimoAcceso(id: string): Promise<void> {
  await db.from("admin_users").update({ ultimo_acceso: new Date().toISOString() }).eq("id", id);
}

// ---------- Configuración general del sitio ----------
const SETTINGS_DEFAULTS: SiteSettings = {
  whatsapp_number: "56900000000",
  instagram_url: "https://instagram.com/travesiasansup",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await db.from("site_settings").select("*");
  if (error || !data) return SETTINGS_DEFAULTS;
  const map: Record<string, string> = {};
  for (const row of data as { key: string; value: string }[]) map[row.key] = row.value;
  return {
    whatsapp_number: map.whatsapp_number || SETTINGS_DEFAULTS.whatsapp_number,
    instagram_url: map.instagram_url || SETTINGS_DEFAULTS.instagram_url,
  };
}

export async function updateSiteSetting(key: keyof SiteSettings, value: string): Promise<void> {
  const { error } = await db
    .from("site_settings")
    .upsert({ key, value, fecha_actualizacion: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw new Error(error.message);
}
