import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getUserById } from "@/lib/db/users";

/** Dung chung cho moi man con cua dashboard can dia chi vi (Deposit/History/
 * Withdraw) - tranh lap lai 3 lan cung 1 doan redirect nhu dashboard/page.tsx. */
export async function requireWallet() {
  const userId = await getSession();
  if (!userId) redirect("/sign-in");

  const user = await getUserById(userId);
  if (!user) redirect("/sign-in");
  if (!user.wallet_address) redirect("/dashboard/setup-wallet");

  return { userId, walletAddress: user.wallet_address };
}
