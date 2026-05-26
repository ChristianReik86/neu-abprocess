import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe, PLANS } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const checkoutSchema = z.object({
  plan: z.enum(["STARTER", "BUSINESS", "PROFESSIONAL", "ENTERPRISE"]),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  const body = await req.json();
  const { plan } = checkoutSchema.parse(body);

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: { organization: { include: { subscription: true } } },
  });

  if (!user?.organization) {
    return NextResponse.json({ error: "Organisation nicht gefunden" }, { status: 404 });
  }

  const planConfig = PLANS[plan];
  if (!planConfig.priceId) {
    return NextResponse.json({ error: "Preiskonfiguration fehlt" }, { status: 400 });
  }

  let customerId = user.organization.subscription?.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email!,
      name: user.organization.name,
      metadata: { organizationId: user.organization.id },
    });
    customerId = customer.id;
    await prisma.subscription.update({
      where: { organizationId: user.organization.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    success_url: `${appUrl}/billing?success=true`,
    cancel_url: `${appUrl}/pricing?canceled=true`,
    metadata: {
      organizationId: user.organization.id,
      plan,
    },
    subscription_data: {
      metadata: { organizationId: user.organization.id, plan },
    },
    locale: "de",
  });

  return NextResponse.json({ url: checkoutSession.url });
}
