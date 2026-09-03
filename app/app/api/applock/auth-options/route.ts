import { type NextRequest, NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { getSession } from "@/lib/auth/session";
import { getApplockCredentialsByUserId } from "@/lib/db/applock";
import { getRpIdAndOrigin, saveApplockChallenge } from "@/lib/auth/applock";

export async function POST(req: NextRequest) {
  const userId = await getSession();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const credentials = await getApplockCredentialsByUserId(userId);
  if (credentials.length === 0) {
    return NextResponse.json({ error: "No passkey set up yet" }, { status: 409 });
  }

  const { rpID } = getRpIdAndOrigin(req);

  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: "required",
    allowCredentials: credentials.map((c) => ({
      id: c.credential_id,
      transports: c.transports ? JSON.parse(c.transports) : undefined,
    })),
  });

  await saveApplockChallenge(userId, "auth", options.challenge);

  return NextResponse.json(options);
}
