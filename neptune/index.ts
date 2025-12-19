import { writeFileSync } from "fs";
import { randomBytes } from "crypto";
import path from "path";

// Generate random secret key
function generateSecret(length: number = 32): string {
  return randomBytes(length).toString("hex"); // 32 bytes → 64 chars hex
}

// Path file .env
const envPath = path.resolve(process.cwd(), ".env");

// Read existing .env file
let envFile = "";
try {
  envFile = require("fs").readFileSync(envPath, "utf-8");
} catch {
  console.log(".env not found, creating new one...");
  envFile = "";
}

// Replace APP_KEY, JWT_SECRET dan SESSION_SECRET
let newEnv = envFile
  .replace(/APP_KEY=.*\n?/, `APP_KEY=${generateSecret()}\n`)
  .replace(/JWT_SECRET=.*\n?/, `JWT_SECRET=${generateSecret()}\n`)
  .replace(/SESSION_SECRET=.*\n?/, `SESSION_SECRET=${generateSecret()}\n`);

// if there is no APP_KEY, JWT_SECRET, or SESSION_SECRET, add them
if (!/APP_KEY=/.test(newEnv)) {
  newEnv += `APP_KEY=${generateSecret()}\n`;
}

if (!/JWT_SECRET=/.test(newEnv)) {
  newEnv += `JWT_SECRET=${generateSecret()}\n`;
}
if (!/SESSION_SECRET=/.test(newEnv)) {
  newEnv += `SESSION_SECRET=${generateSecret()}\n`;
}

// Write back to .env file
writeFileSync(envPath, newEnv, "utf-8");

console.log("✅ JWT_SECRET & SESSION_SECRET have been set in .env file.");
