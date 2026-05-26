import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: { organization: { include: { subscription: true } } },
  });

  const customerId = user?.organization?.subscription?.stripeCustomerId;
  if (!customerId) {
    return NextResponse.json({ error: "Kein Stripe-Kunde gefunden" }, { status: 404 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl}/billing`,
  });

  return NextResponse.json({ url: portalSession.url });
}
