// Tipos que reflejan 1:1 el modelo de base de datos definido para Supabase/Postgres.
// Cuando se migre de JSON a Supabase, estos tipos no cambian.

export type NivelDificultad = "Principiante" | "Familiar" | "Intermedio" | "Avanzado";

export type EstadoPanorama =
  | "Disponible"
  | "Próximamente"
  | "Cupos limitados"
  | "Completo"
  | "Suspendido"
  | "No disponible"
  | "Actividad privada";

export interface PanoramaImage {
  id: string;
  url: string;
  titulo?: string;
  descripcion?: string;
  imagen_principal: boolean;
  orden: number;
}

export interface PanoramaVideo {
  id: string;
  tipo: "youtube" | "vimeo" | "archivo";
  url: string;
  portada?: string;
  activo: boolean;
  orden: number;
}

export interface HistoriaEntorno {
  historia: string;
  caracteristicas: string;
  cultural: string;
  comunidad: string;
  flora: string;
  fauna: string;
  datos_interesantes: string;
  recomendaciones_ambientales: string;
}

export interface Panorama {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string;
  historia_entorno: HistoriaEntorno;
  ubicacion: string;
  punto_encuentro: string;
  duracion: string;
  dificultad: NivelDificultad;
  edad_minima: number;
  capacidad_maxima: number;
  precio: number;
  precio_equipamiento: number;
  recomendaciones: string[];
  que_llevar: string[];
  incluye: string[];
  estado: EstadoPanorama;
  orden: number;
  images: PanoramaImage[];
  videos: PanoramaVideo[];
  fecha_creacion: string;
}

export type EstadoHorario =
  | "Disponible"
  | "Cupos limitados"
  | "Completo"
  | "Cerrado"
  | "Suspendido"
  | "Reprogramado"
  | "Finalizado";

export interface Schedule {
  id: string;
  panorama_id: string;
  fecha: string; // YYYY-MM-DD
  hora_inicio: string;
  hora_termino: string;
  cupos_totales: number;
  cupos_reservados: number;
  precio: number;
  estado: EstadoHorario;
  observaciones?: string;
  punto_encuentro?: string;
  guia?: string;
  estado_climatico?: string;
}

export type EstadoReserva =
  | "Solicitud recibida"
  | "Pendiente de aprobación"
  | "En revisión"
  | "Pendiente de información"
  | "Aprobada"
  | "Confirmada"
  | "Pendiente de pago"
  | "Pagada"
  | "Cancelada por el cliente"
  | "Cancelada por el administrador"
  | "Suspendida por clima"
  | "Reprogramada"
  | "Rechazada"
  | "Actividad completada"
  | "No asistió";

export type EstadoPago = "Pendiente" | "Abonado" | "Pagado" | "Devuelto" | "Rechazado";

export interface BookingEquipmentItem {
  equipment_id: string;
  cantidad: number;
  talla?: string;
}

export interface Booking {
  id: string;
  codigo_reserva: string;
  panorama_id: string;
  schedule_id: string;
  nombre_cliente: string;
  telefono: string;
  correo: string;
  adultos: number;
  ninos: number;
  edad_ninos?: string;
  total_personas: number;
  experiencia_previa: boolean;
  equipamiento: BookingEquipmentItem[];
  observaciones?: string;
  acepta_terminos: boolean;
  autoriza_contacto: boolean;
  valor_total: number;
  estado: EstadoReserva;
  estado_pago: EstadoPago;
  motivo_rechazo?: string;
  fecha_creacion: string;
}

export type EstadoEquipo = "Disponible" | "Reservado" | "En uso" | "En mantención" | "Fuera de servicio" | "Dañado";

export interface Equipment {
  id: string;
  nombre: string;
  categoria: string;
  descripcion?: string;
  cantidad_total: number;
  cantidad_disponible: number;
  talla?: string;
  estado: EstadoEquipo;
  precio_arriendo: number;
  imagen?: string;
  codigo_interno: string;
  fecha_mantencion?: string;
  observaciones?: string;
}

export type EstadoCodigo = "Disponible" | "Reservado" | "Asignado" | "Utilizado" | "Vencido" | "Anulado";

export interface ReservationCode {
  id: string;
  codigo: string;
  estado: EstadoCodigo;
  booking_id?: string;
  panorama_id?: string;
  descripcion_interna?: string;
  fecha_creacion: string;
  fecha_vencimiento?: string;
  fecha_utilizacion?: string;
  creado_por: string;
  anulado_por?: string;
  motivo_anulacion?: string;
}

export interface ApprovalTemplate {
  id: string;
  nombre: string;
  titulo: string;
  mensaje_inspirador: string;
  texto_cierre: string;
  mostrar_imagen: boolean;
  imagen_url?: string;
  color_principal: string;
  color_secundario: string;
  panorama_id?: string;
  activa: boolean;
  predeterminada: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface BookingStatusHistory {
  id: string;
  booking_id: string;
  estado_anterior: string;
  estado_nuevo: string;
  mensaje_cliente?: string;
  observacion_interna?: string;
  administrador: string;
  fecha_hora: string;
}

export interface Notice {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: "info" | "alerta" | "promocion" | "clima";
  fecha_inicio: string;
  fecha_termino?: string;
  activo: boolean;
}

export interface FaqItem {
  id: string;
  pregunta: string;
  respuesta: string;
  orden: number;
  activo: boolean;
}

export interface Consulta {
  id: string;
  nombre: string;
  telefono: string;
  panorama_id?: string;
  mensaje: string;
  estado: "Nueva" | "En revisión" | "Respondida" | "Cerrada";
  fecha_creacion: string;
}
