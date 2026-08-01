/**
 * Uso: node scripts/hash-password.js "tu-contraseña-segura"
 * Copia el resultado en ADMIN_PASSWORD_HASH dentro de .env.local
 */
const bcrypt = require("bcryptjs");

const password = process.argv[2];
if (!password) {
  console.error("Uso: node scripts/hash-password.js \"tu-contraseña\"");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log("\nAgrega esta línea a tu archivo .env.local:\n");
console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
