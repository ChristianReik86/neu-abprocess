import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["PENDING", "REVIEWED", "APPROVED", "REJECTED", "ARCHIVED"]).optional(),
  notes: z.string().optional(),
  orderNumber: z.string().optional(),
  supplierName: z.string().optional(),
  amount: z.number().optional(),
});

async function getOrgId(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { organizationId: true },
  });
  return user?.organizationId;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const orgId = await getOrgId(session.user.email!);
  const order = await prisma.orderConfirmation.findFirst({
    where: { id, organizationId: orgId! },
    include: { attachments: true },
  });

  if (!order) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const orgId = await getOrgId(session.user.email!);
  const body = await req.json();
  const data = updateSchema.parse(body);

  const order = await prisma.orderConfirmation.updateMany({
    where: { id, organizationId: orgId! },
    data,
  });

  return NextResponse.json({ updated: order.count > 0 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const orgId = await getOrgId(session.user.email!);
  await prisma.orderConfirmation.deleteMany({
    where: { id, organizationId: orgId! },
  });

  return NextResponse.json({ deleted: true });
}
