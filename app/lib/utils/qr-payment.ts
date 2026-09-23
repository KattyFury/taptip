import { arcTestnet } from "@/lib/chain";

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

/**
 * QR nhan tip o Home ma hoa theo chuan EIP-681 (`ethereum:0x...@<chainId>`),
 * KHONG con scheme rieng `taptip:` cua ban truoc (09-23, phan hoi that: lay
 * app khac quet QR nay - "khong thay kha dung"). Ly do: `taptip:` la scheme
 * tu bia, khong app nao ngoai TapTip nhan ra - Android/iOS khong co gi de
 * "mo" link do nen coi nhu khong lam gi ca. EIP-681 la chuan pho bien
 * MetaMask/Rainbow/Trust Wallet... deu doc duoc, cho phep ho gui tip cho
 * TapTip user ma khong can cai TapTip. USDC la native currency cua Arc
 * Testnet (xem lib/chain.ts) nen dia chi tran + chainId la du, khong can
 * ghi ro token. Scanner cua TapTip (decodeTapTipQr) da ho tro doc format
 * nay tu truoc (dung cho chieu nguoc lai: TapTip quet QR cua vi khac) nen
 * TapTip quet TapTip van chay binh thuong, khong mat tuong thich nguoc.
 */
export function encodeTapTipQr(address: string): string {
  return `ethereum:${address}@${arcTestnet.id}`;
}

export type DecodedTapTipQr =
  | { ok: true; address: string }
  | { ok: false; reason: "wrong-network" | "not-a-wallet-qr" };

function parseChainId(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const value = raw.startsWith("0x") ? parseInt(raw, 16) : parseInt(raw, 10);
  return Number.isFinite(value) ? value : null;
}

/**
 * Doc QR nhan tien. KHONG chi hieu QR do chinh TapTip sinh ra - hau het vi
 * khac (MetaMask, Rainbow...) xuat QR theo chuan EIP-681 `ethereum:0x...@<chainId>`,
 * ban cu tu choi thang nen quet QR Arc hop le van bao "Invalid QR code".
 *
 * Chap nhan:
 *   0x...                                          (dia chi tran)
 *   taptip:0x...?chain=<id>&currency=USDC           (QR cua TapTip BAN CU - encodeTapTipQr
 *                                                     doi sang EIP-681 tu 09-23, giu doc o day
 *                                                     chi de khong vo QR cu con luu/in ra)
 *   ethereum:0x...                                  (EIP-681, khong ghi chain)
 *   ethereum:0x...@5042002                          (EIP-681 co chain - dang encodeTapTipQr dung)
 *   ethereum:0xTOKEN@5042002/transfer?address=0xNGUOI_NHAN&uint256=...
 *
 * Quy tac mang: QR co ghi chain ma KHONG phai Arc -> tu choi ro rang. QR
 * khong ghi chain -> chap nhan (Home da co dong do canh bao chi dung Arc).
 */
export function decodeTapTipQr(text: string): DecodedTapTipQr {
  const trimmed = text.trim();

  if (ADDRESS_REGEX.test(trimmed)) {
    return { ok: true, address: trimmed };
  }

  const schemeMatch = trimmed.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):(.+)$/);
  if (!schemeMatch) {
    return { ok: false, reason: "not-a-wallet-qr" };
  }

  const [pathPart, query] = schemeMatch[2].split("?");
  const params = new URLSearchParams(query ?? "");

  // EIP-681: <target>@<chainId>/<functionName>
  const [targetWithChain, functionName] = pathPart.split("/");
  const [target, chainFromPath] = targetWithChain.split("@");

  const chainId = parseChainId(chainFromPath ?? params.get("chain"));
  if (chainId !== null && chainId !== arcTestnet.id) {
    return { ok: false, reason: "wrong-network" };
  }

  // Dang goi transfer: dia chi truoc @ la CONTRACT token, nguoi nhan that
  // nam trong tham so `address` - gui nham vao contract la mat tien.
  const recipient = functionName === "transfer" ? params.get("address") : target;

  if (!recipient || !ADDRESS_REGEX.test(recipient)) {
    return { ok: false, reason: "not-a-wallet-qr" };
  }

  return { ok: true, address: recipient };
}
