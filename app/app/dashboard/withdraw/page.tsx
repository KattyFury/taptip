import { requireWallet } from "@/lib/auth/require-wallet";
import { WithdrawScreen } from "@/components/withdraw-screen";

export default async function WithdrawPage() {
  const { walletAddress } = await requireWallet();
  return <WithdrawScreen walletAddress={walletAddress} />;
}
