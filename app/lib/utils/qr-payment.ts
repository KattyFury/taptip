import { arcTestnet } from "@/lib/chain";

const SCHEME = "taptip";
const CURRENCY = "USDC";
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export function encodeTapTipQr(address: string): string {
  return `${SCHEME}:${address}?chain=${arcTestnet.id}&currency=${CURRENCY}`;
}

export interface DecodedTapTipQr {
  address: string;
}

export function decodeTapTipQr(text: string): DecodedTapTipQr | null {
  // Backward-compat: QR cu chi chua dia chi tho, khong co scheme/chain/currency
  if (ADDRESS_REGEX.test(text)) {
    return { address: text };
  }

  if (!text.startsWith(`${SCHEME}:`)) return null;

  const withoutScheme = text.slice(SCHEME.length + 1);
  const [address, query] = withoutScheme.split("?");

  if (!ADDRESS_REGEX.test(address)) return null;

  const params = new URLSearchParams(query || "");
  const chain = params.get("chain");
  const currency = params.get("currency");

  if (chain !== String(arcTestnet.id)) return null;
  if (currency !== CURRENCY) return null;

  return { address };
}
