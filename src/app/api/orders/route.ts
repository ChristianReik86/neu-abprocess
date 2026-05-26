import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  orderNumber: z.string().optional(),
  supplierName: z.string().optional(),
  supplierEmail: z.string().email().optional(),
  subject: z.string().optional(),
  amount: z.number().optional(),
  currency: z.string().default("EUR"),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { organizationId: true },
  });
  if (!user?.organizationId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const where: any = { organizationId: user.organizationId };
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: "insensitive" } },
      { supplierName: { contains: search, mode: "insensitive" } },
      { subject: { contains: search, mode: "insensitive" } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.orderConfirmation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.orderConfirmation.count({ where }),
  ]);

  return NextResponse.json({ orders, total, page, limit });
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
  if (sub && sub.documentsUsed >= sub.documentsLimit) {
    return NextResponse.json(
      { error: "Monatliches Beleglimit erreicht. Bitte upgraden Sie Ihren Plan." },
      { status: 402 }
    );
  }

  const body = await req.json();
  const data = createSchema.parse(body);

  const order = await prisma.orderConfirmation.create({
    data: { ...data, organizationId: user.organizationId },
  });

  if (sub) {
    await prisma.subscription.update({
      where: { organizationId: user.organizationId },
      data: { documentsUsed: { increment: 1 } },
    });
  }

  return NextResponse.json(order, { status: 201 });
}
