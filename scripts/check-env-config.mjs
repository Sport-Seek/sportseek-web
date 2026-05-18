import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const appDir = join(root, "app");

const read = (path) => readFileSync(path, "utf8");

const walk = (dir) => {
  const entries = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      entries.push(...walk(path));
      continue;
    }
    if (/\.(ts|tsx|js|jsx)$/.test(name)) {
      entries.push(path);
    }
  }
  return entries;
};

const failures = [];
const sourceFiles = walk(appDir);

for (const file of sourceFiles) {
  const content = read(file);
  const display = relative(root, file);

  if (/NEXT_PUBLIC_API_URL\s*\|\|/.test(content)) {
    failures.push(`${display}: NEXT_PUBLIC_API_URL must not use a silent fallback.`);
  }

  if (/api\.sportseek\.fr/.test(content) && display.replaceAll("\\", "/") !== "app/lib/config/publicEnv.ts") {
    failures.push(`${display}: production API URL must only live in publicEnv.ts.`);
  }

  for (const serviceName of [
    "auth-service",
    "profile-service",
    "spot-service",
    "catalog-service",
    "version-service",
  ]) {
    if (content.includes(serviceName)) {
      failures.push(`${display}: direct service reference ${serviceName} is forbidden in apps/web.`);
    }
  }
}

const envExample = read(join(root, ".env.local.example"));
for (const requiredName of ["NEXT_PUBLIC_API_URL", "PUBLIC_TOKEN_MAPBOX"]) {
  if (!envExample.includes(requiredName)) {
    failures.push(`.env.local.example: missing ${requiredName}.`);
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Web environment configuration check passed.");
