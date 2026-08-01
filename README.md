# Travesías AnSup

Plataforma web y PWA para gestionar los recorridos guiados en SUP de **Travesías AnSup** en Ancud, Chiloé.

Este proyecto ya está conectado a **Supabase** (Postgres real) y listo para desplegarse en **Netlify**.

---

## 1. Crear el proyecto en Supabase

1. Entra a [supabase.com](https://supabase.com) → **New project**.
2. Cuando esté listo, ve a **SQL Editor → New query**, pega **todo** el contenido de `supabase/schema.sql` y presiona **Run**. Esto crea todas las tablas, índices y políticas de seguridad (RLS).
3. Ve a **Project Settings → API** y copia:
   - `Project URL` → será tu `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → será tu `NEXT_PUBLIC_SUPABASE_ANON_KEY` (no se usa aún, pero déjala lista para etapa 2)
   - `service_role key` → será tu `SUPABASE_SERVICE_ROLE_KEY` (⚠️ secreta, nunca la subas a un repo público)

## 2. Instalar y configurar en tu computador

\`\`\`bash
npm install
cp .env.example .env.local
\`\`\`

Completa en `.env.local`:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ADMIN_EMAIL=admin@travesiasansup.cl
JWT_SECRET=una-cadena-larga-y-aleatoria
NEXT_PUBLIC_WHATSAPP_NUMBER=56912345678
\`\`\`

Genera el hash de tu contraseña de administrador:

\`\`\`bash
npm run hash-password "tu-contraseña-segura"
\`\`\`

Copia el resultado en `ADMIN_PASSWORD_HASH` dentro de `.env.local`.

## 3. Cargar los datos iniciales (los 4 panoramas, horarios, equipos, FAQ, plantillas)

\`\`\`bash
npm run seed-supabase
\`\`\`

Esto lee `src/data/*.json` (tus datos de ejemplo) y los sube a las tablas de Supabase. Es seguro correrlo más de una vez. Después de esto puedes revisar **Supabase → Table Editor** y ver los 4 panoramas cargados.

## 4. Probar localmente

\`\`\`bash
npm run dev
\`\`\`

Abre `http://localhost:3000`. El panel administrativo está en `/admin/login`.

---

## 5. Desplegar en Netlify

1. Sube el proyecto a un repositorio de GitHub (crea uno nuevo y sube la carpeta completa).
2. Entra a [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**.
3. Conecta tu cuenta de GitHub y selecciona el repositorio.
4. Netlify detecta automáticamente el archivo `netlify.toml` incluido (usa `@netlify/plugin-nextjs`, que traduce las rutas API, el middleware y las páginas dinámicas a Netlify Functions sin configuración extra). No cambies el comando de build ni el directorio de publicación.
5. Antes del primer deploy, ve a **Site configuration → Environment variables** y agrega las mismas variables que en tu `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD_HASH`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_WHATSAPP_NUMBER`
   - `NEXT_PUBLIC_SITE_URL` → pon la URL que te asigna Netlify, ej. `https://travesias-ansup.netlify.app`
   - `NEXT_PUBLIC_INSTAGRAM`
6. Presiona **Deploy site**. En 1-2 minutos tendrás el link real.
7. Abre ese link desde tu celular: verás la ventana **"Instala Travesías AnSup"** — ya es una app instalable.

### Dominio propio (opcional)
En **Site configuration → Domain management** puedes conectar `travesiasansup.cl` o el dominio que tengas, siguiendo las instrucciones de Netlify (agregar registros DNS).

---

## 6. Cómo cambiar fotos, textos, colores y videos

- **Fotos/videos/textos de cada panorama:** panel admin → *Panoramas* → seleccionas el panorama → agregas o quitas imágenes y editas los campos.
- **Colores de marca:** `tailwind.config.ts` → objeto `colors` (`deep`, `teal`, `forest`, `sand`).
- **Mensaje de aprobación / imagen del martín pescador:** panel admin → *Plantillas de aprobación* (la imagen es opcional, se puede desactivar).
- **Preguntas frecuentes, avisos, equipamiento, códigos:** cada uno tiene su sección en el panel admin.
- Cualquier cambio hecho en el panel se guarda directamente en Supabase — no requiere volver a desplegar.

---

## 7. Configurar WhatsApp

**Modo actual:** todos los botones de WhatsApp usan un enlace `wa.me` con mensaje prellenado, tomando el número desde `NEXT_PUBLIC_WHATSAPP_NUMBER`.

**Etapa 2 — WhatsApp Business Cloud API** (respuestas dentro del panel, bandeja de conversaciones): crear una app en Meta for Developers, obtener `WHATSAPP_CLOUD_API_TOKEN` y `WHATSAPP_CLOUD_API_PHONE_ID`, y un endpoint `src/app/api/whatsapp/webhook/route.ts` que guarde los mensajes en las tablas `conversations`/`messages` (ya están creadas en `supabase/schema.sql`).

---

## 8. Estructura del proyecto

\`\`\`
src/
├── app/                     → páginas (App Router) y rutas API
│   ├── admin/(protected)/   → panel administrativo (requiere sesión)
│   ├── admin/login/
│   ├── api/                 → endpoints backend (usan Supabase)
│   ├── panoramas/[slug]/
│   ├── reserva/[slug]/
│   ├── confirmacion/[codigo]/
│   └── mi-reserva/
├── components/               → UI reutilizable (+ components/admin)
├── lib/
│   ├── supabase.ts           → cliente de Supabase (service role, solo servidor)
│   ├── db.ts                 → toda la lógica de negocio y consultas a Supabase
│   ├── db.json-backup.ts     → versión anterior sobre JSON, de referencia
│   ├── auth.ts                → sesión de administrador (JWT + bcrypt)
│   └── utils.ts
├── types/index.ts             → modelo de datos completo
└── data/*.json                → datos de ejemplo, usados solo por scripts/seed-supabase.js
supabase/
└── schema.sql                 → esquema completo de la base de datos
scripts/
├── hash-password.js           → genera el hash para ADMIN_PASSWORD_HASH
└── seed-supabase.js            → carga los datos de ejemplo en Supabase
netlify.toml                   → configuración de despliegue en Netlify
public/
├── images/                     → fotografías reales de Travesías AnSup
├── manifest.webmanifest        → configuración PWA
└── sw.js                       → service worker (caché + página offline)
\`\`\`

---

## 9. Qué incluye hoy vs. etapa 2

**Incluido y funcional:** PWA instalable, 4 panoramas con fotos reales conectados a Supabase, calendario de disponibilidad con cupos en tiempo real, formulario de reserva completo, generación automática y manual de códigos, consulta de estado por código + contacto con línea de tiempo, panel admin con aprobación/rechazo, plantillas de aprobación con imagen opcional, gestión de panoramas/horarios/equipamiento/códigos/avisos, estadísticas, chat flotante conectado a WhatsApp — todo persistido en Postgres real.

**Etapa 2:** pagos en línea (Webpay/Mercado Pago), WhatsApp Cloud API completa, notificaciones push, recordatorios automáticos, mapas interactivos, pronóstico meteorológico, códigos QR, reseñas de clientes.
