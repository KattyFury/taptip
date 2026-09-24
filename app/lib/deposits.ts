import { USDC_ADDRESS } from "@/lib/chain";
import { getTapTipWalletsAmong } from "@/lib/db/users";

/**
 * Tien NAP tu ngoai vao vi (user chot 09-24b: History hien ca nap) - doc tu
 * API Blockscout cua trinh duyet khoi Arc Testnet, KHONG luu DB. Chi lay
 * chuyen USDC DEN dia chi nay ma nguoi gui KHONG phai vi TapTip (tip giua
 * nguoi dung TapTip da co trong bang transactions, tranh dem trung).
 */
const EXPLORER_API = "https://explorer.testnet.arc.io/api/v2";

export interface Deposit {
  from: string;
  amount: number;
  createdAt: string; // ISO
  txHash: string;
}

interface BlockscoutTransfer {
  from: { hash: string };
  to: { hash: string };
  total: { decimals: string; value: string };
  timestamp: string;
  transaction_hash?: string;
  tx_hash?: string;
}

export async function getDeposits(address: string): Promise<Deposit[]> {
  const url = `${EXPLORER_API}/addresses/${address}/token-transfers?filter=to&token=${USDC_ADDRESS}`;
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`Explorer returned ${res.status}`);
  const data = (await res.json()) as { items?: BlockscoutTransfer[] };
  const items = (data.items ?? []).filter((t) => t.to.hash.toLowerCase() === address.toLowerCase());

  const tapTipWallets = await getTapTipWalletsAmong(items.map((t) => t.from.hash));
  return items
    .filter((t) => !tapTipWallets.has(t.from.hash.toLowerCase()))
    .map((t) => ({
      from: t.from.hash,
      amount: Number(t.total.value) / 10 ** Number(t.total.decimals || 6),
      createdAt: t.timestamp,
      txHash: t.transaction_hash ?? t.tx_hash ?? "",
    }));
}
