import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const configSchema = z.object({
  label: z.string().min(1),
  host: z.string().min(1),
  port: z.number().int().default(993),
  secure: z.boolean().default(true),
  username: z.string().min(1),
  password: z.string().min(1),
  folder: z.string().default("INBOX"),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { organizationId: true },
  });

  const configs = await prisma.emailConfig.findMany({
    where: { organizationId: user?.organizationId! },
    select: {
      id: true, label: true, host: true, port: true,
      secure: true, username: true, folder: true,
      isActive: true, lastSyncAt: true, createdAt: true,
    },
  });

  return NextResponse.json(configs);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: { organization: { include: { subscription: true } } },
  });

  if (!user?.organizationId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const sub = user.organization?.subscription;
  const existingCount = await prisma.emailConfig.count({
    where: { organizationId: user.organizationId },
  });

  const limits: Record<string, number> = {
    FREE: 1, STARTER: 3, BUSINESS: 10, PROFESSIONAL: 999, ENTERPRISE: 999,
  };
  const maxConfigs = limits[sub?.plan || "FREE"] || 1;
  if (existingCount >= maxConfigs) {
    return NextResponse.json(
      { error: `Ihr Plan erlaubt maximal ${maxConfigs} E-Mail-Postfach/Postfächer.` },
      { status: 402 }
    );
  }

  const body = await req.json();
  const data = configSchema.parse(body);

  const config = await prisma.emailConfig.create({
    data: { ...data, organizationId: user.organizationId },
    select: {
      id: true, label: true, host: true, port: true,
      secure: true, username: true, folder: true, isActive: true,
    },
  });

  return NextResponse.json(config, { status: 201 });
}
