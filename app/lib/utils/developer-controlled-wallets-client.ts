import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";

export const circleDeveloperSdk = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY!,
  entitySecret: process.env.CIRCLE_ENTITY_SECRET!,
});
