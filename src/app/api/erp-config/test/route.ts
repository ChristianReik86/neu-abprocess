import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ErpClient } from "@/lib/erp-client";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type, baseUrl, apiKey, username, password, customHeaders } = await req.json();

  const client = new ErpClient({ type, baseUrl, apiKey, username, password, customHeaders });
  const result = await client.testConnection();

  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
