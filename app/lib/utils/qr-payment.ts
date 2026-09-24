import { arcTestnet } from "@/lib/chain";

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

/**
 * QR nhan tip o Home - QR RIENG CUA TAPTIP, chi nhan USDC tren Arc:
 *   taptip:0x<dia chi>?chain=5042002&currency=USDC
 *
 * User chot 09-24b (DOI NGUOC quyet dinh 09-23 "dia chi vi tran"): "QR sua
 * lai thanh chi nhan USDC tren Arc, tranh nguoi ta dung vi MetaMask gui vao,
 * day la app tip khong phai vi da nang". Scheme `taptip:` co chu dich de vi
 * ngoai / camera thuong KHONG doc ra dia chi - gui/nhan trong app la rieng,
 * nap/rut voi ben ngoai di qua Deposit / Withdraw.
 */
export function encodeTapTipQr(address: string): string {
  return `taptip:${address}?chain=${arcTestnet.id}&currency=USDC`;
}

export type DecodedTapTipQr =
  | { ok: true; address: string }
  | { ok: false; reason: "wrong-network" | "not-a-taptip-qr" };

/**
 * Doc QR o tab Send Tip - CHI nhan QR TapTip (`taptip:0x...`). QR cua vi
 * khac (dia chi tran, EIP-681 `ethereum:...`) bi tu choi: tip chi di giua
 * nguoi dung TapTip voi nhau.
 */
export function decodeTapTipQr(text: string): DecodedTapTipQr {
  const match = text.trim().match(/^taptip:(0x[a-fA-F0-9]{40})(?:\?(.*))?$/i);
  if (!match || !ADDRESS_REGEX.test(match[1])) {
    return { ok: false, reason: "not-a-taptip-qr" };
  }

  const params = new URLSearchParams(match[2] ?? "");
  const chain = params.get("chain");
  if (chain && Number(chain) !== arcTestnet.id) {
    return { ok: false, reason: "wrong-network" };
  }
  const currency = params.get("currency");
  if (currency && currency.toUpperCase() !== "USDC") {
    return { ok: false, reason: "wrong-network" };
  }

  return { ok: true, address: match[1] };
}
