import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ErpType } from "@prisma/client";
import { z } from "zod";

const erpSchema = z.object({
  label: z.string().min(1),
  type: z.string(),
  baseUrl: z.string().url(),
  apiKey: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  customHeaders: z.record(z.string(), z.string()).optional().transform((v) => v as any),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { organizationId: true },
  });

  const configs = await prisma.erpConfig.findMany({
    where: { organizationId: user?.organizationId! },
    select: {
      id: true, label: true, type: true, baseUrl: true,
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
  const existingCount = await prisma.erpConfig.count({
    where: { organizationId: user.organizationId },
  });

  const limits: Record<string, number> = {
    FREE: 1, STARTER: 2, BUSINESS: 5, PROFESSIONAL: 999, ENTERPRISE: 999,
  };
  const maxConfigs = limits[sub?.plan || "FREE"] || 1;
  if (existingCount >= maxConfigs) {
    return NextResponse.json(
      { error: `Ihr Plan erlaubt maximal ${maxConfigs} ERP-Verbindung(en).` },
      { status: 402 }
    );
  }

  const body = await req.json();
  const data = erpSchema.parse(body);

  const config = await prisma.erpConfig.create({
    data: { ...data, type: data.type as ErpType, organizationId: user.organizationId },
    select: { id: true, label: true, type: true, baseUrl: true, isActive: true },
  });

  return NextResponse.json(config, { status: 201 });
}
