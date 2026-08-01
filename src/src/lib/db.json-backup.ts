/**
 * Capa de acceso a datos de Travesías AnSup.
 *
 * IMPORTANTE PARA LA MIGRACIÓN A SUPABASE:
 * Todas las páginas y rutas API de este proyecto SOLO importan funciones
 * desde este archivo (nunca leen los .json directamente). Esto significa
 * que para migrar a Supabase basta con reescribir el cuerpo de estas
 * funciones usando `supabase.from('tabla')...` y el resto de la aplicación
 * sigue funcionando sin cambios. Ver README.md → "Migración a Supabase".
 */
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";
import type {
  Panorama,
  Schedule,
  Booking,
  Equipment,
  ReservationCode,
  ApprovalTemplate,
  BookingStatusHistory,
  Notice,
  FaqItem,
  Consulta,
} from "@/types";

const DATA_DIR = path.join(process.cwd(), "src", "data");

function readJson<T>(file: string): T {
  const filePath = path.join(DATA_DIR, file);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

function writeJson<T>(file: string, data: T) {
  const filePath = path.join(DATA_DIR, file);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// ---------- Panoramas ----------
export function getPanoramas(): Panorama[] {
  return readJson<Panorama[]>("panoramas.json").sort((a, b) => a.orden - b.orden);
}
export function getPanoramaBySlug(slug: string): Panorama | undefined {
  return getPanoramas().find((p) => p.slug === slug);
}
export function getPanoramaById(id: string): Panorama | undefined {
  return getPanoramas().find((p) => p.id === id);
}
export function savePanoramas(list: Panorama[]) {
  writeJson("panoramas.json", list);
}
export function upsertPanorama(p: Panorama) {
  const list = getPanoramas();
  const idx = list.findIndex((x) => x.id === p.id);
  if (idx >= 0) list[idx] = p;
  else list.push(p);
  savePanoramas(list);
  return p;
}
export function deletePanorama(id: string) {
  const list = getPanoramas().filter((p) => p.id !== id);
  savePanoramas(list);
}

// ---------- Schedules ----------
export function getSchedules(): Schedule[] {
  return readJson<Schedule[]>("schedules.json");
}
export function getSchedulesByPanorama(panoramaId: string): Schedule[] {
  return getSchedules()
    .filter((s) => s.panorama_id === panoramaId)
    .sort((a, b) => (a.fecha + a.hora_inicio).localeCompare(b.fecha + b.hora_inicio));
}
export function getScheduleById(id: string): Schedule | undefined {
  return getSchedules().find((s) => s.id === id);
}
export function saveSchedules(list: Schedule[]) {
  writeJson("schedules.json", list);
}
export function upsertSchedule(s: Schedule) {
  const list = getSchedules();
  const idx = list.findIndex((x) => x.id === s.id);
  if (idx >= 0) list[idx] = s;
  else list.push(s);
  saveSchedules(list);
  return s;
}

function computeScheduleEstado(s: Schedule): Schedule["estado"] {
  if (s.estado === "Suspendido" || s.estado === "Cerrado" || s.estado === "Reprogramado" || s.estado === "Finalizado") {
    return s.estado;
  }
  if (s.cupos_reservados >= s.cupos_totales) return "Completo";
  if (s.cupos_totales - s.cupos_reservados <= 3) return "Cupos limitados";
  return "Disponible";
}

// ---------- Equipment ----------
export function getEquipment(): Equipment[] {
  return readJson<Equipment[]>("equipment.json");
}
export function saveEquipment(list: Equipment[]) {
  writeJson("equipment.json", list);
}
export function upsertEquipment(e: Equipment) {
  const list = getEquipment();
  const idx = list.findIndex((x) => x.id === e.id);
  if (idx >= 0) list[idx] = e;
  else list.push(e);
  saveEquipment(list);
  return e;
}
export function deleteEquipment(id: string) {
  saveEquipment(getEquipment().filter((e) => e.id !== id));
}

// ---------- Reservation Codes ----------
export function getCodes(): ReservationCode[] {
  return readJson<ReservationCode[]>("codes.json");
}
export function saveCodes(list: ReservationCode[]) {
  writeJson("codes.json", list);
}
export function getCodeByValue(codigo: string): ReservationCode | undefined {
  return getCodes().find((c) => c.codigo.toLowerCase() === codigo.toLowerCase());
}
export function codeExists(codigo: string): boolean {
  return !!getCodeByValue(codigo);
}
export function createCode(input: Partial<ReservationCode> & { codigo: string; creado_por: string }): ReservationCode {
  if (codeExists(input.codigo)) {
    throw new Error("Ya existe un código con ese valor.");
  }
  const code: ReservationCode = {
    id: `cod_${nanoid(8)}`,
    codigo: input.codigo,
    estado: input.estado ?? "Disponible",
    booking_id: input.booking_id,
    panorama_id: input.panorama_id,
    descripcion_interna: input.descripcion_interna ?? "",
    fecha_creacion: new Date().toISOString(),
    fecha_vencimiento: input.fecha_vencimiento,
    fecha_utilizacion: input.fecha_utilizacion,
    creado_por: input.creado_por,
  };
  const list = getCodes();
  list.push(code);
  saveCodes(list);
  return code;
}
export function upsertCode(c: ReservationCode) {
  const list = getCodes();
  const idx = list.findIndex((x) => x.id === c.id);
  if (idx >= 0) list[idx] = c;
  else list.push(c);
  saveCodes(list);
  return c;
}
export function anularCode(id: string, motivo: string, admin: string) {
  const list = getCodes();
  const idx = list.findIndex((c) => c.id === id);
  if (idx < 0) return;
  list[idx].estado = "Anulado";
  list[idx].motivo_anulacion = motivo;
  list[idx].anulado_por = admin;
  saveCodes(list);
}

function generateAutoCode(): string {
  const year = new Date().getFullYear();
  const list = getCodes().filter((c) => c.codigo.startsWith(`ANSUP-${year}-`));
  const nums = list
    .map((c) => parseInt(c.codigo.split("-").pop() || "0", 10))
    .filter((n) => !isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `ANSUP-${year}-${String(next).padStart(4, "0")}`;
}

// ---------- Bookings ----------
export function getBookings(): Booking[] {
  return readJson<Booking[]>("bookings.json").sort((a, b) => b.fecha_creacion.localeCompare(a.fecha_creacion));
}
export function getBookingByCodigo(codigo: string): Booking | undefined {
  return getBookings().find((b) => b.codigo_reserva.toLowerCase() === codigo.toLowerCase());
}
export function getBookingById(id: string): Booking | undefined {
  return getBookings().find((b) => b.id === id);
}
export function saveBookings(list: Booking[]) {
  writeJson("bookings.json", list);
}

export function getHistory(): BookingStatusHistory[] {
  return readJson<BookingStatusHistory[]>("booking_status_history.json");
}
export function getHistoryForBooking(bookingId: string): BookingStatusHistory[] {
  return getHistory()
    .filter((h) => h.booking_id === bookingId)
    .sort((a, b) => a.fecha_hora.localeCompare(b.fecha_hora));
}
function addHistory(entry: Omit<BookingStatusHistory, "id" | "fecha_hora">) {
  const list = getHistory();
  list.push({ ...entry, id: `hist_${nanoid(8)}`, fecha_hora: new Date().toISOString() });
  writeJson("booking_status_history.json", list);
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
  codigo_manual?: string; // si el cliente ya tiene un código de grupo/empresa
}

export function crearReserva(input: CrearReservaInput): Booking {
  const panorama = getPanoramaById(input.panorama_id);
  const schedule = getScheduleById(input.schedule_id);
  if (!panorama || !schedule) throw new Error("Panorama u horario no encontrado.");

  const totalPersonas = input.adultos + input.ninos;
  const cuposDisponibles = schedule.cupos_totales - schedule.cupos_reservados;
  if (totalPersonas > cuposDisponibles) {
    throw new Error("No hay cupos suficientes para la cantidad de personas solicitada.");
  }

  // Precio: valor por persona + equipamiento solicitado
  let valorTotal = totalPersonas * schedule.precio;
  const equipmentList = getEquipment();
  for (const item of input.equipamiento) {
    const eq = equipmentList.find((e) => e.id === item.equipment_id);
    if (eq) valorTotal += eq.precio_arriendo * item.cantidad;
  }

  // Código: usa uno manual válido y disponible, o genera uno automático
  let codigoReserva: string;
  if (input.codigo_manual) {
    const existing = getCodeByValue(input.codigo_manual);
    if (!existing || existing.estado !== "Disponible") {
      throw new Error("El código ingresado no es válido o ya fue utilizado.");
    }
    codigoReserva = existing.codigo;
  } else {
    codigoReserva = generateAutoCode();
    createCode({ codigo: codigoReserva, creado_por: "Sistema (automático)", panorama_id: panorama.id, estado: "Asignado" });
  }

  const booking: Booking = {
    id: `bkg_${nanoid(10)}`,
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
    fecha_creacion: new Date().toISOString(),
  };

  const bookings = getBookings();
  bookings.push(booking);
  saveBookings(bookings);

  // Vincula el código (si fue manual) a esta reserva
  if (input.codigo_manual) {
    const codes = getCodes();
    const idx = codes.findIndex((c) => c.codigo === codigoReserva);
    if (idx >= 0) {
      codes[idx].estado = "Asignado";
      codes[idx].booking_id = booking.id;
      saveCodes(codes);
    }
  } else {
    const codes = getCodes();
    const idx = codes.findIndex((c) => c.codigo === codigoReserva);
    if (idx >= 0) {
      codes[idx].booking_id = booking.id;
      saveCodes(codes);
    }
  }

  // Descuenta cupos del horario (reserva provisoria, se confirma al aprobar)
  const schedules = getSchedules();
  const sIdx = schedules.findIndex((s) => s.id === schedule.id);
  schedules[sIdx].cupos_reservados += totalPersonas;
  schedules[sIdx].estado = computeScheduleEstado(schedules[sIdx]);
  saveSchedules(schedules);

  addHistory({
    booking_id: booking.id,
    estado_anterior: "-",
    estado_nuevo: "Solicitud recibida",
    mensaje_cliente: "Tu solicitud fue recibida y está pendiente de aprobación.",
    administrador: "Sistema",
  });

  return booking;
}

export function cambiarEstadoReserva(
  bookingId: string,
  nuevoEstado: Booking["estado"],
  opts: { mensajeCliente?: string; observacionInterna?: string; administrador: string; motivoRechazo?: string }
) {
  const bookings = getBookings();
  const idx = bookings.findIndex((b) => b.id === bookingId);
  if (idx < 0) throw new Error("Reserva no encontrada.");
  const estadoAnterior = bookings[idx].estado;
  bookings[idx].estado = nuevoEstado;
  if (opts.motivoRechazo) bookings[idx].motivo_rechazo = opts.motivoRechazo;
  saveBookings(bookings);

  // Si se rechaza o cancela, libera cupos y anula/devuelve el código a disponible
  if (["Rechazada", "Cancelada por el cliente", "Cancelada por el administrador"].includes(nuevoEstado)) {
    const b = bookings[idx];
    const schedules = getSchedules();
    const sIdx = schedules.findIndex((s) => s.id === b.schedule_id);
    if (sIdx >= 0) {
      schedules[sIdx].cupos_reservados = Math.max(0, schedules[sIdx].cupos_reservados - b.total_personas);
      schedules[sIdx].estado = computeScheduleEstado(schedules[sIdx]);
      saveSchedules(schedules);
    }
  }

  if (nuevoEstado === "Aprobada") {
    const codes = getCodes();
    const cIdx = codes.findIndex((c) => c.booking_id === bookingId);
    if (cIdx >= 0) {
      codes[cIdx].estado = "Utilizado";
      codes[cIdx].fecha_utilizacion = new Date().toISOString();
      saveCodes(codes);
    }
  }

  addHistory({
    booking_id: bookingId,
    estado_anterior: estadoAnterior,
    estado_nuevo: nuevoEstado,
    mensaje_cliente: opts.mensajeCliente,
    observacion_interna: opts.observacionInterna,
    administrador: opts.administrador,
  });

  return bookings[idx];
}

// ---------- Approval Templates ----------
export function getTemplates(): ApprovalTemplate[] {
  return readJson<ApprovalTemplate[]>("templates.json");
}
export function saveTemplates(list: ApprovalTemplate[]) {
  writeJson("templates.json", list);
}
export function upsertTemplate(t: ApprovalTemplate) {
  const list = getTemplates();
  const idx = list.findIndex((x) => x.id === t.id);
  if (idx >= 0) list[idx] = t;
  else list.push(t);
  saveTemplates(list);
  return t;
}
export function deleteTemplate(id: string) {
  saveTemplates(getTemplates().filter((t) => t.id !== id));
}
export function getDefaultTemplate(): ApprovalTemplate | undefined {
  const list = getTemplates();
  return list.find((t) => t.predeterminada) ?? list[0];
}

// ---------- Notices ----------
export function getNotices(): Notice[] {
  return readJson<Notice[]>("notices.json");
}
export function saveNotices(list: Notice[]) {
  writeJson("notices.json", list);
}
export function getActiveNotices(): Notice[] {
  const now = new Date().toISOString().slice(0, 10);
  return getNotices().filter((n) => n.activo && n.fecha_inicio <= now && (!n.fecha_termino || n.fecha_termino >= now));
}

// ---------- FAQ ----------
export function getFaq(): FaqItem[] {
  return readJson<FaqItem[]>("faq.json").sort((a, b) => a.orden - b.orden);
}
export function saveFaq(list: FaqItem[]) {
  writeJson("faq.json", list);
}

// ---------- Consultas ----------
export function getConsultas(): Consulta[] {
  return readJson<Consulta[]>("consultas.json");
}
export function crearConsulta(input: Omit<Consulta, "id" | "estado" | "fecha_creacion">): Consulta {
  const c: Consulta = { ...input, id: `cons_${nanoid(8)}`, estado: "Nueva", fecha_creacion: new Date().toISOString() };
  const list = getConsultas();
  list.push(c);
  writeJson("consultas.json", list);
  return c;
}
export function saveConsultas(list: Consulta[]) {
  writeJson("consultas.json", list);
}

// ---------- Estadísticas ----------
export function getEstadisticas() {
  const bookings = getBookings();
  const panoramas = getPanoramas();
  const codes = getCodes();
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
