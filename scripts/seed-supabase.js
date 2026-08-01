/**
 * Carga los datos iniciales de Travesías AnSup en Supabase.
 *
 * Uso:
 *   1. Ejecuta primero supabase/schema.sql en el SQL Editor de Supabase.
 *   2. Configura NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local
 *   3. node scripts/seed-supabase.js
 *
 * Es seguro ejecutarlo más de una vez (usa upsert).
 */
require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

const supabase = createClient(url, key);

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "..", "src", "data", file), "utf-8"));
}

async function seedPanoramas() {
  const panoramas = readJson("panoramas.json");
  for (const p of panoramas) {
    const { images, videos, historia_entorno, ...rest } = p;
    const { error } = await supabase.from("panoramas").upsert({ ...rest, historia: historia_entorno }, { onConflict: "id" });
    if (error) throw error;

    await supabase.from("panorama_images").delete().eq("panorama_id", p.id);
    if (images?.length) {
      const { error: imgErr } = await supabase
        .from("panorama_images")
        .insert(images.map((i) => ({ panorama_id: p.id, url: i.url, titulo: i.titulo, descripcion: i.descripcion, imagen_principal: i.imagen_principal, orden: i.orden })));
      if (imgErr) throw imgErr;
    }
  }
  console.log(`✓ ${panoramas.length} panoramas cargados`);
}

async function seedSchedules() {
  const schedules = readJson("schedules.json");
  const { error } = await supabase.from("schedules").upsert(schedules, { onConflict: "id" });
  if (error) throw error;
  console.log(`✓ ${schedules.length} horarios cargados`);
}

async function seedEquipment() {
  const equipment = readJson("equipment.json");
  const { error } = await supabase.from("equipment").upsert(equipment, { onConflict: "id" });
  if (error) throw error;
  console.log(`✓ ${equipment.length} equipos cargados`);
}

async function seedFaq() {
  const faq = readJson("faq.json");
  const { error } = await supabase.from("faq").upsert(faq, { onConflict: "id" });
  if (error) throw error;
  console.log(`✓ ${faq.length} preguntas frecuentes cargadas`);
}

async function seedTemplates() {
  const templates = readJson("templates.json");
  const { error } = await supabase.from("approval_templates").upsert(templates, { onConflict: "id" });
  if (error) throw error;
  console.log(`✓ ${templates.length} plantillas de aprobación cargadas`);
}

async function seedCodes() {
  const codes = readJson("codes.json");
  const { error } = await supabase.from("reservation_codes").upsert(codes, { onConflict: "codigo" });
  if (error) throw error;
  console.log(`✓ ${codes.length} códigos cargados`);
}

(async () => {
  try {
    await seedPanoramas();
    await seedSchedules();
    await seedEquipment();
    await seedFaq();
    await seedTemplates();
    await seedCodes();
    console.log("\n✅ Listo. Revisa Supabase → Table Editor para confirmar los datos.");
  } catch (err) {
    console.error("❌ Error al cargar datos:", err.message || err);
    process.exit(1);
  }
})();
