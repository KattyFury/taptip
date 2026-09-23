import { type NextRequest, NextResponse } from "next/server";
import { verifyAuthenticationResponse, type AuthenticationResponseJSON } from "@simplewebauthn/server";
import { getSession } from "@/lib/auth/session";
import { consumeApplockChallenge, getRpIdAndOrigin } from "@/lib/auth/applock";
import {
  getApplockCredentialByCredentialId,
  updateApplockCredentialCounter,
} from "@/lib/db/applock";

export async function POST(req: NextRequest) {
  const userId = await getSession();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as {
    response?: AuthenticationResponseJSON;
  } | null;

  if (!body?.response) {
    return NextResponse.json({ error: "Missing authentication response" }, { status: 400 });
  }

  const expectedChallenge = await consumeApplockChallenge(userId, "auth");
  if (!expectedChallenge) {
    return NextResponse.json(
      { error: "This unlock attempt expired, try again" },
      { status: 400 },
    );
  }

  const stored = await getApplockCredentialByCredentialId(body.response.id);
  // Phai la credential CUA DUNG USER dang dang nhap - khong thi ai co
  // credential id (khong bi mat, la id cong khai) cung xac thuc duoc thay.
  if (!stored || stored.user_id !== userId) {
    return NextResponse.json({ error: "Unknown passkey" }, { status: 400 });
  }

  const { rpID, origin } = getRpIdAndOrigin(req);

  try {
    const verification = await verifyAuthenticationResponse({
      response: body.response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: stored.credential_id,
        publicKey: new Uint8Array(Buffer.from(stored.public_key, "base64")),
        counter: stored.counter,
        transports: stored.transports ? JSON.parse(stored.transports) : undefined,
      },
    });

    if (!verification.verified) {
      return NextResponse.json({ error: "Could not verify passkey" }, { status: 400 });
    }

    await updateApplockCredentialCounter(
      stored.credential_id,
      verification.authenticationInfo.newCounter,
    );

    return NextResponse.json({ verified: true });
  } catch (error) {
    console.error("App-lock auth verify failed:", error);
    return NextResponse.json({ error: "Could not verify passkey" }, { status: 400 });
  }
}
