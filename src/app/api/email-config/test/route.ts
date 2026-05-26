import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ImapFlow } from "imapflow";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { host, port, secure, username, password } = await req.json();

  const client = new ImapFlow({
    host,
    port: Number(port),
    secure: Boolean(secure),
    auth: { user: username, pass: password },
    logger: false,
  });

  try {
    await client.connect();
    await client.logout();
    return NextResponse.json({ success: true, message: "Verbindung erfolgreich" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Verbindungsfehler" },
      { status: 400 }
    );
  }
}
