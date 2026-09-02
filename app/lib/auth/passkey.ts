/**
 * Passkey credential luu trong D1.
 *
 * Chi giu {id, publicKey} - dung 2 truong nay `toWebAuthnAccount` cua viem
 * can de dung lai account (da doc source: node_modules/viem/_esm/account-
 * abstraction/accounts/toWebAuthnAccount.js chi destructure {id, publicKey}).
 * Truong `raw` la object PublicKeyCredential cua trinh duyet - JSON.stringify
 * ra `{}`, luu vao chi ton cho.
 *
 * Day KHONG phai bi mat: khoa ky nam trong secure enclave cua thiet bi, moi
 * lan ky deu phai qua Face ID/van tay tren dung may do.
 */
export interface StoredPasskeyCredential {
  id: string;
  publicKey: string;
}

export function normalizePasskeyCredential(input: unknown): StoredPasskeyCredential {
  const credential = input as Partial<StoredPasskeyCredential> | null;

  if (!credential?.id || !credential?.publicKey) {
    throw new Error("Passkey credential must have both `id` and `publicKey`");
  }

  return { id: credential.id, publicKey: credential.publicKey };
}
