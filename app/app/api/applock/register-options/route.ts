import { type NextRequest, NextResponse } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { getSession } from "@/lib/auth/session";
import { getUserById } from "@/lib/db/users";
import { getApplockCredentialsByUserId } from "@/lib/db/applock";
import { APPLOCK_RP_NAME, getRpIdAndOrigin, saveApplockChallenge } from "@/lib/auth/applock";

export async function POST(req: NextRequest) {
  const userId = await getSession();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserById(userId);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rpID } = getRpIdAndOrigin(req);
  const existing = await getApplockCredentialsByUserId(userId);

  const options = await generateRegistrationOptions({
    rpName: APPLOCK_RP_NAME,
    rpID,
    userID: new TextEncoder().encode(userId),
    userName: user.email,
    // Bat buoc xac thuc sinh trac/PIN that su (khong chi "co mat thiet bi")
    // - dung tinh than "passkey xac thuc lai" cua docs/03-planning-v2.md.
    authenticatorSelection: {
      userVerification: "required",
      residentKey: "preferred",
    },
    // Khong cho dang ky trung 1 thiet bi 2 lan.
    excludeCredentials: existing.map((c) => ({
      id: c.credential_id,
      transports: c.transports ? JSON.parse(c.transports) : undefined,
    })),
  });

  await saveApplockChallenge(userId, "register", options.challenge);

  return NextResponse.json(options);
}
