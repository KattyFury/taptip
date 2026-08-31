import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function getDb() {
  const { env } = await getCloudflareContext({ async: true });
  return env.taptip_db;
}

export async function getKv() {
  const { env } = await getCloudflareContext({ async: true });
  return env.taptip_kv;
}
