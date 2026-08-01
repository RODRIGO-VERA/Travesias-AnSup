-- =========================================================
-- Travesías AnSup — Esquema de base de datos para Supabase
-- Ejecutar completo en: Supabase → SQL Editor → New query → Run
-- =========================================================

create extension if not exists "pgcrypto";

-- ---------- roles y usuarios administrativos ----------
create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  correo text unique not null,
  telefono text,
  password_hash text not null,
  rol text not null check (rol in ('Superadministrador','Administrador')),
  estado text not null default 'Activo' check (estado in ('Activo','Inactivo')),
  fecha_creacion timestamptz not null default now(),
  ultimo_acceso timestamptz
);

-- ---------- panoramas ----------
create table if not exists panoramas (
  id text primary key default ('pan_' || substr(gen_random_uuid()::text, 1, 8)),
  nombre text not null,
  slug text unique not null,
  descripcion text default '',
  historia jsonb not null default '{
    "historia":"", "caracteristicas":"", "cultural":"", "comunidad":"",
    "flora":"", "fauna":"", "datos_interesantes":"", "recomendaciones_ambientales":""
  }',
  ubicacion text default '',
  punto_encuentro text default '',
  duracion text default '',
  dificultad text not null default 'Familiar'
    check (dificultad in ('Principiante','Familiar','Intermedio','Avanzado')),
  edad_minima int not null default 0,
  capacidad_maxima int not null default 10,
  precio int not null default 0,
  precio_equipamiento int not null default 0,
  recomendaciones text[] default '{}',
  que_llevar text[] default '{}',
  incluye text[] default '{}',
  estado text not null default 'Disponible'
    check (estado in ('Disponible','Próximamente','Cupos limitados','Completo','Suspendido','No disponible','Actividad privada')),
  orden int not null default 99,
  fecha_creacion timestamptz not null default now()
);

create table if not exists panorama_images (
  id uuid primary key default gen_random_uuid(),
  panorama_id text references panoramas(id) on delete cascade,
  url text not null,
  titulo text,
  descripcion text,
  imagen_principal boolean not null default false,
  orden int not null default 1
);

create table if not exists panorama_videos (
  id uuid primary key default gen_random_uuid(),
  panorama_id text references panoramas(id) on delete cascade,
  tipo text not null check (tipo in ('youtube','vimeo','archivo')),
  url text not null,
  portada text,
  activo boolean not null default true,
  orden int not null default 1
);

-- ---------- horarios ----------
create table if not exists schedules (
  id text primary key default ('sch_' || substr(gen_random_uuid()::text, 1, 8)),
  panorama_id text references panoramas(id) on delete cascade,
  fecha date not null,
  hora_inicio text not null,
  hora_termino text not null,
  cupos_totales int not null,
  cupos_reservados int not null default 0,
  precio int not null default 0,
  estado text not null default 'Disponible'
    check (estado in ('Disponible','Cupos limitados','Completo','Cerrado','Suspendido','Reprogramado','Finalizado')),
  observaciones text,
  punto_encuentro text,
  guia text,
  estado_climatico text
);

-- ---------- equipamiento ----------
create table if not exists equipment (
  id text primary key default ('eq_' || substr(gen_random_uuid()::text, 1, 8)),
  nombre text not null,
  categoria text default '',
  descripcion text,
  cantidad_total int not null default 0,
  cantidad_disponible int not null default 0,
  talla text,
  estado text not null default 'Disponible'
    check (estado in ('Disponible','Reservado','En uso','En mantención','Fuera de servicio','Dañado')),
  precio_arriendo int not null default 0,
  imagen text,
  codigo_interno text,
  fecha_mantencion date,
  observaciones text
);

-- ---------- códigos de reserva ----------
create table if not exists reservation_codes (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null,
  estado text not null default 'Disponible'
    check (estado in ('Disponible','Reservado','Asignado','Utilizado','Vencido','Anulado')),
  booking_id text,
  panorama_id text references panoramas(id),
  descripcion_interna text,
  fecha_creacion timestamptz not null default now(),
  fecha_vencimiento date,
  fecha_utilizacion timestamptz,
  creado_por text not null,
  anulado_por text,
  motivo_anulacion text
);

-- ---------- reservas ----------
create table if not exists bookings (
  id text primary key default ('bkg_' || substr(gen_random_uuid()::text, 1, 10)),
  codigo_reserva text not null references reservation_codes(codigo),
  panorama_id text references panoramas(id),
  schedule_id text references schedules(id),
  nombre_cliente text not null,
  telefono text not null,
  correo text not null,
  adultos int not null default 1,
  ninos int not null default 0,
  edad_ninos text,
  total_personas int not null default 1,
  experiencia_previa boolean not null default false,
  equipamiento jsonb not null default '[]',
  observaciones text,
  acepta_terminos boolean not null default false,
  autoriza_contacto boolean not null default false,
  valor_total int not null default 0,
  estado text not null default 'Pendiente de aprobación',
  estado_pago text not null default 'Pendiente'
    check (estado_pago in ('Pendiente','Abonado','Pagado','Devuelto','Rechazado')),
  motivo_rechazo text,
  fecha_creacion timestamptz not null default now()
);

alter table reservation_codes
  add constraint reservation_codes_booking_fk
  foreign key (booking_id) references bookings(id) on delete set null;

-- ---------- historial de estados ----------
create table if not exists booking_status_history (
  id uuid primary key default gen_random_uuid(),
  booking_id text references bookings(id) on delete cascade,
  estado_anterior text,
  estado_nuevo text not null,
  mensaje_cliente text,
  observacion_interna text,
  administrador text,
  fecha_hora timestamptz not null default now()
);

-- ---------- plantillas de aprobación ----------
create table if not exists approval_templates (
  id text primary key default ('tpl_' || substr(gen_random_uuid()::text, 1, 8)),
  nombre text not null,
  titulo text not null default '¡Tu travesía ha sido aprobada!',
  mensaje_inspirador text default '',
  texto_cierre text default '',
  mostrar_imagen boolean not null default false,
  imagen_url text,
  color_principal text not null default '#0E3A4C',
  color_secundario text not null default '#189AA6',
  panorama_id text references panoramas(id),
  activa boolean not null default true,
  predeterminada boolean not null default false,
  fecha_creacion timestamptz not null default now(),
  fecha_actualizacion timestamptz not null default now()
);

-- ---------- notificaciones enviadas ----------
create table if not exists notification_history (
  id uuid primary key default gen_random_uuid(),
  booking_id text references bookings(id) on delete cascade,
  tipo text,
  canal text check (canal in ('plataforma','correo','whatsapp','push')),
  destinatario text,
  plantilla_id text references approval_templates(id),
  imagen_url text,
  estado_envio text,
  fecha_hora timestamptz not null default now(),
  administrador text
);

-- ---------- conversaciones / chat / whatsapp ----------
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  nombre_cliente text,
  telefono text,
  panorama_id text references panoramas(id),
  estado text not null default 'Nueva'
    check (estado in ('Nueva','En revisión','Respondida','Pendiente del cliente','Cerrada')),
  administrador_id uuid references admin_users(id),
  fecha_creacion timestamptz not null default now(),
  ultima_actividad timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  remitente text check (remitente in ('cliente','administrador')),
  mensaje text not null,
  fecha_hora timestamptz not null default now(),
  leido boolean not null default false,
  canal text
);

-- consultas rápidas del widget flotante (previas a convertirse en conversación)
create table if not exists consultas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  telefono text not null,
  panorama_id text,
  mensaje text not null,
  estado text not null default 'Nueva'
    check (estado in ('Nueva','En revisión','Respondida','Cerrada')),
  fecha_creacion timestamptz not null default now()
);

-- ---------- avisos ----------
create table if not exists notices (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  mensaje text not null,
  tipo text not null default 'info' check (tipo in ('info','alerta','promocion','clima')),
  fecha_inicio date not null default current_date,
  fecha_termino date,
  activo boolean not null default true
);

-- ---------- preguntas frecuentes ----------
create table if not exists faq (
  id uuid primary key default gen_random_uuid(),
  pregunta text not null,
  respuesta text not null,
  orden int not null default 1,
  activo boolean not null default true
);

-- ---------- auditoría ----------
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  administrador_id uuid references admin_users(id),
  accion text not null,
  modulo text,
  detalle text,
  fecha_hora timestamptz not null default now()
);

-- ---------- instalaciones de la PWA (estadística) ----------
create table if not exists app_installations (
  id uuid primary key default gen_random_uuid(),
  dispositivo text,
  navegador text,
  sistema_operativo text,
  fecha timestamptz not null default now(),
  instalacion_completada boolean not null default false
);

-- =========================================================
-- Índices útiles
-- =========================================================
create index if not exists idx_schedules_panorama on schedules(panorama_id, fecha);
create index if not exists idx_bookings_codigo on bookings(codigo_reserva);
create index if not exists idx_bookings_panorama on bookings(panorama_id);
create index if not exists idx_codes_codigo on reservation_codes(lower(codigo));
create index if not exists idx_history_booking on booking_status_history(booking_id);

-- =========================================================
-- Row Level Security
-- El sitio público solo necesita LEER panoramas/horarios/equipos/faq/avisos
-- y CREAR reservas, códigos, consultas. Todo lo demás pasa por el backend
-- (rutas API de Next.js) usando la Service Role Key, que ignora RLS.
-- =========================================================
alter table panoramas enable row level security;
alter table panorama_images enable row level security;
alter table panorama_videos enable row level security;
alter table schedules enable row level security;
alter table equipment enable row level security;
alter table faq enable row level security;
alter table notices enable row level security;
alter table bookings enable row level security;
alter table reservation_codes enable row level security;
alter table consultas enable row level security;

create policy "lectura pública panoramas" on panoramas for select using (true);
create policy "lectura pública imágenes" on panorama_images for select using (true);
create policy "lectura pública videos" on panorama_videos for select using (true);
create policy "lectura pública horarios" on schedules for select using (true);
create policy "lectura pública equipos" on equipment for select using (true);
create policy "lectura pública faq" on faq for select using (true);
create policy "lectura pública avisos" on notices for select using (true);

-- Los clientes pueden crear su propia reserva y consulta desde el sitio público.
-- (Con anon key es más seguro hacerlo vía una función RPC o vía las rutas API
-- de Next.js con la service role key — que es el enfoque que usa este proyecto.)
create policy "crear consultas" on consultas for insert with check (true);

-- Nota: las tablas administrativas (bookings, reservation_codes, admin_users,
-- conversations, messages, audit_logs, approval_templates, notification_history)
-- NO tienen policy de lectura/escritura pública: solo se acceden desde el
-- backend (rutas /api/* de Next.js) usando SUPABASE_SERVICE_ROLE_KEY, que
-- pasa por encima de RLS. Esto es intencional y es el patrón recomendado
-- por Supabase para lógica administrativa sensible.
