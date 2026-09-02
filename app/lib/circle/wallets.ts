import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";
import { USDC_ADDRESS } from "@/lib/chain";

/**
 * Circle Developer-Controlled Wallets.
 *
 * Circle giu khoa ky phia server (API key + entity secret), nen gui tip
 * KHONG can user ky bang Face ID moi lan - dung yeu cau so 1 cua san pham
 * la toc do (docs/01-ideation.md gat Privy chinh vi bat user tu ky).
 *
 * Entity secret la BI MAT SONG CON: mat no la brick toan bo vi cua moi user.
 * Chi doc tu env phia server, khong bao gio gui ra client.
 */

const BLOCKCHAIN = "ARC-TESTNET" as const;

function getClient() {
  const apiKey = process.env.CIRCLE_API_KEY;
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET;

  if (!apiKey || !entitySecret) {
    throw new Error("Missing CIRCLE_API_KEY or CIRCLE_ENTITY_SECRET");
  }

  return initiateDeveloperControlledWalletsClient({ apiKey, entitySecret });
}

export interface CreatedWallet {
  walletId: string;
  address: string;
}

/** Tao vi Arc cho mot user. SCA de dung duoc Gas Station sau nay. */
export async function createWalletForUser(userId: string): Promise<CreatedWallet> {
  const walletSetId = process.env.CIRCLE_WALLET_SET_ID;
  if (!walletSetId) {
    throw new Error("Missing CIRCLE_WALLET_SET_ID");
  }

  const response = await getClient().createWallets({
    walletSetId,
    blockchains: [BLOCKCHAIN],
    accountType: "SCA",
    count: 1,
    metadata: [{ name: `taptip-${userId}` }],
  });

  const wallet = response.data?.wallets?.[0];
  if (!wallet?.id || !wallet?.address) {
    throw new Error("Circle did not return a wallet");
  }

  return { walletId: wallet.id, address: wallet.address };
}

/**
 * Gui USDC tu vi cua user toi dia chi nguoi nhan.
 *
 * Tra ve id giao dich cua Circle. Giao dich duoc dua len chain bat dong bo -
 * `state` ban dau thuong la INITIATED/QUEUED, chua phai da xong.
 */
export async function sendUsdc(
  walletAddress: string,
  destinationAddress: string,
  amount: string,
): Promise<{ transactionId: string; state: string }> {
  // PHAI dung cap (walletAddress + blockchain), KHONG dung walletId: kieu cua
  // SDK la union - nhanh `walletId` chi nhan `tokenId`, dua `tokenAddress` vao
  // se bi tra "API parameter invalid". Day la shape trong tai lieu chinh thuc
  // cua Circle cho Arc Testnet (wallets/dev-controlled/transfer-tokens-across-wallets).
  const response = await getClient().createTransaction({
    blockchain: BLOCKCHAIN,
    walletAddress,
    tokenAddress: USDC_ADDRESS,
    destinationAddress,
    amount: [amount],
    fee: { type: "level", config: { feeLevel: "MEDIUM" } },
  });

  const transactionId = response.data?.id;
  if (!transactionId) {
    throw new Error("Circle did not return a transaction id");
  }

  return { transactionId, state: response.data?.state ?? "UNKNOWN" };
}
