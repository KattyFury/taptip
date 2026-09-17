/**
 * Rut gon dia chi vi theo dung kieu Figma viet: "0xAbCd...EfGh"
 * = 6 ky tu dau (0x + 4) + "..." + 4 ky tu cuoi.
 *
 * Truoc 09-17 co HAI kieu khac nhau trong app: Home dung "0x...{4 cuoi}",
 * History dung "0x_{5 cuoi}". Gio dung chung mot ham nay.
 */
export function shortenAddress(address: string): string {
  if (!address || address.length < 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
