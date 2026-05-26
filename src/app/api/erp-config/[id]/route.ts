import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { organizationId: true },
  });

  await prisma.erpConfig.deleteMany({
    where: { id, organizationId: user?.organizationId! },
  });

  return NextResponse.json({ deleted: true });
}
