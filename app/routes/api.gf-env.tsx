import { json } from "@remix-run/node";

export async function loader() {
  const envKeys = Object.keys(process.env).filter(k =>
    k.includes("KV") ||
    k.includes("REDIS") ||
    k.includes("UPSTASH") ||
    k.includes("STORAGE")
  ).sort();

  return json({
    storage_env_vars: envKeys,
    note: "Lista di tutte le variabili relative a storage/cache iniettate da Vercel"
  });
}
