import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      organization: {
        include: {
          subscription: true,
          invoices: { orderBy: { createdAt: "desc" }, take: 10 },
        },
      },
    },
  });

  return NextResponse.json({
    subscription: user?.organization?.subscription,
    invoices: user?.organization?.invoices || [],
  });
}
