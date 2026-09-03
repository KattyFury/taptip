import { type NextRequest, NextResponse } from "next/server";
import { verifyRegistrationResponse, type RegistrationResponseJSON } from "@simplewebauthn/server";
import { getSession } from "@/lib/auth/session";
import { consumeApplockChallenge, getRpIdAndOrigin } from "@/lib/auth/applock";
import { createApplockCredential } from "@/lib/db/applock";

export async function POST(req: NextRequest) {
  const userId = await getSession();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as {
    response?: RegistrationResponseJSON;
  } | null;

  if (!body?.response) {
    return NextResponse.json({ error: "Missing registration response" }, { status: 400 });
  }

  const expectedChallenge = await consumeApplockChallenge(userId, "register");
  if (!expectedChallenge) {
    return NextResponse.json(
      { error: "This setup attempt expired, try again" },
      { status: 400 },
    );
  }

  const { rpID, origin } = getRpIdAndOrigin(req);

  try {
    const verification = await verifyRegistrationResponse({
      response: body.response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json({ error: "Could not verify passkey" }, { status: 400 });
    }

    const { credential } = verification.registrationInfo;

    await createApplockCredential({
      userId,
      credentialId: credential.id,
      publicKey: Buffer.from(credential.publicKey).toString("base64"),
      counter: credential.counter,
      transports: credential.transports ?? null,
    });

    return NextResponse.json({ verified: true });
  } catch (error) {
    console.error("App-lock registration verify failed:", error);
    return NextResponse.json({ error: "Could not verify passkey" }, { status: 400 });
  }
}
