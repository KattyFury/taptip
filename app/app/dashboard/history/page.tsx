import { requireWallet } from "@/lib/auth/require-wallet";
import { HistoryScreen } from "@/components/history-screen";

export default async function HistoryPage() {
  await requireWallet();
  return <HistoryScreen />;
}
