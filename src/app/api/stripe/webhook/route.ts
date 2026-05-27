import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe ist nicht konfiguriert." }, { status: 503 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Webhook-Signatur ungültig" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const { organizationId, plan } = session.metadata || {};
      if (organizationId && plan) {
        const planLimits: Record<string, number> = {
          STARTER: 100, BUSINESS: 500, PROFESSIONAL: 2000, ENTERPRISE: 999999,
        };
        await prisma.subscription.update({
          where: { organizationId },
          data: {
            plan: plan as any,
            status: "ACTIVE",
            stripeSubscriptionId: session.subscription as string,
            documentsLimit: planLimits[plan] || 10,
          },
        });
      }
      break;
    }
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: {
          status: sub.status.toUpperCase() as any,
          currentPeriodStart: new Date((sub as any).current_period_start * 1000),
          currentPeriodEnd: new Date((sub as any).current_period_end * 1000),
        },
      });
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: { plan: "FREE", status: "CANCELED", documentsLimit: 10, stripeSubscriptionId: null },
      });
      break;
    }
    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      const customer = await prisma.subscription.findUnique({
        where: { stripeCustomerId: invoice.customer as string },
      });
      if (customer) {
        await prisma.invoice.create({
          data: {
            organizationId: customer.organizationId,
            stripeInvoiceId: invoice.id,
            amount: invoice.amount_paid,
            currency: invoice.currency,
            status: "PAID",
            pdfUrl: invoice.invoice_pdf,
            period: new Date(invoice.period_start * 1000).toISOString().slice(0, 7),
          },
        });
        await prisma.subscription.update({
          where: { organizationId: customer.organizationId },
          data: { documentsUsed: 0 },
        });
      }
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      await prisma.subscription.updateMany({
        where: { stripeCustomerId: invoice.customer as string },
        data: { status: "PAST_DUE" },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
