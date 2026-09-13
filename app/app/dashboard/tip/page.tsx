import { requireWallet } from "@/lib/auth/require-wallet";
import { TipScreen } from "@/components/tip-screen";

export default async function TipPage() {
  await requireWallet();
  return <TipScreen />;
}
