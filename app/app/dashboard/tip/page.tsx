import { requireWallet } from "@/lib/auth/require-wallet";
import { TipScreen } from "@/components/tip-screen";
import { BalanceProvider } from "@/contexts/balanceContext";

/**
 * BUG NGHIEM TRONG da fix (09-23): trang nay truoc day render <TipScreen />
 * KHONG boc BalanceProvider rieng dia chi vi, nen useBalance() trong
 * TipScreen chi thay duoc BalanceProvider GOC o app/layout.tsx - cai do
 * KHONG co walletAddress nen khong bao gio fetch gi ca, balance.token
 * DUNG YEN o 0 mai mai. Hau qua: moi lan quet QR, check `amount > balanceNum`
 * (vd $2 > $0) LUON LUON dung -> bao "Not enough balance" du vi thuc te co
 * tien - quet QR khong bao gio tip duoc. HomeScreen khong dinh loi nay vi no
 * tu boc BalanceProvider rieng voi walletAddress (xem components/home-screen.tsx).
 * Sua bang cach boc giong y het HomeScreen.
 */
export default async function TipPage() {
  const { walletAddress } = await requireWallet();
  return (
    <BalanceProvider walletAddress={walletAddress}>
      <TipScreen />
    </BalanceProvider>
  );
}
