import { requireWallet } from "@/lib/auth/require-wallet";
import { DepositScreen } from "@/components/deposit-screen";

export default async function DepositPage() {
  const { walletAddress } = await requireWallet();
  return <DepositScreen walletAddress={walletAddress} />;
}
