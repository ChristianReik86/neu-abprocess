"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Loader2, ExternalLink, CreditCard } from "lucide-react";
import { PLANS, formatPrice } from "@/lib/stripe";

interface SubscriptionData {
  plan: string;
  status: string;
  documentsUsed: number;
  documentsLimit: number;
  currentPeriodEnd: string | null;
  stripeCustomerId: string | null;
}

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  period: string | null;
  pdfUrl: string | null;
  createdAt: string;
}

export default function BillingPage() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    fetch("/api/billing")
      .then((r) => r.json())
      .then((data) => {
        setSubscription(data.subscription);
        setInvoices(data.invoices || []);
        setLoading(false);
      });
  }, []);

  async function handleCheckout(plan: string) {
    setCheckoutLoading(plan);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setCheckoutLoading(null);
  }

  async function handlePortal() {
    setPortalLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setPortalLoading(false);
  }

  if (loading) {
    return (
      <div>
        <Header title="Abrechnung" />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
        </div>
      </div>
    );
  }

  const usagePercent = subscription
    ? Math.min(100, (subscription.documentsUsed / subscription.documentsLimit) * 100)
    : 0;
  const currentPlan = PLANS[subscription?.plan as keyof typeof PLANS] || PLANS.FREE;

  const statusMap: Record<string, { label: string; variant: any }> = {
    ACTIVE: { label: "Aktiv", variant: "success" },
    TRIALING: { label: "Testphase", variant: "default" },
    PAST_DUE: { label: "Überfällig", variant: "destructive" },
    CANCELED: { label: "Gekündigt", variant: "secondary" },
    UNPAID: { label: "Unbezahlt", variant: "destructive" },
  };

  const plans = Object.entries(PLANS).filter(([k]) => k !== "FREE");

  return (
    <div>
      <Header title="Abrechnung" description="Plan und Zahlungen verwalten" />

      <div className="p-6 space-y-6">
        {/* Current subscription */}
        <Card>
          <CardHeader>
            <CardTitle>Aktuelles Abonnement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl font-bold text-gray-900">{currentPlan.name}</span>
                    <Badge variant={statusMap[subscription?.status || "ACTIVE"]?.variant}>
                      {statusMap[subscription?.status || "ACTIVE"]?.label}
                    </Badge>
                  </div>
                  <p className="text-gray-500">{currentPlan.description}</p>
                </div>
              </div>
              {subscription?.stripeCustomerId && (
                <Button variant="outline" onClick={handlePortal} disabled={portalLoading} className="gap-2">
                  {portalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                  Zahlungsmethode verwalten
                </Button>
              )}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  Belege diesen Monat: {subscription?.documentsUsed || 0} /{" "}
                  {subscription?.documentsLimit === 999999 ? "∞" : subscription?.documentsLimit || 10}
                </span>
                <span className="font-medium text-gray-700">{Math.round(usagePercent)}%</span>
              </div>
              <Progress
                value={usagePercent}
                className={usagePercent > 80 ? "[&>div]:bg-red-500" : usagePercent > 60 ? "[&>div]:bg-yellow-500" : ""}
              />
            </div>

            {subscription?.currentPeriodEnd && (
              <p className="text-sm text-gray-400">
                Verlängerung am:{" "}
                {new Intl.DateTimeFormat("de-DE").format(new Date(subscription.currentPeriodEnd))}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Plan selection */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Plan wechseln</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {plans.map(([key, plan]) => {
              const isCurrent = subscription?.plan === key;
              return (
                <Card
                  key={key}
                  className={`relative ${isCurrent ? "border-blue-500 ring-2 ring-blue-500" : ""} ${key === "BUSINESS" ? "border-blue-300" : ""}`}
                >
                  {key === "BUSINESS" && !isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                        Empfohlen
                      </span>
                    </div>
                  )}
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white">
                        Aktuell
                      </span>
                    </div>
                  )}
                  <CardContent className="p-5">
                    <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                    <div className="my-2">
                      <span className="text-2xl font-bold">{formatPrice(plan.price)}</span>
                      <span className="text-gray-500 text-sm">/Monat</span>
                    </div>
                    <p className="mb-3 text-sm font-medium text-blue-600">
                      {plan.documentsLimit === 999999 ? "Unbegrenzte" : plan.documentsLimit} Belege/Monat
                    </p>
                    <ul className="mb-4 space-y-1.5">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-1.5 text-xs text-gray-600">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-500" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={isCurrent ? "outline" : key === "BUSINESS" ? "default" : "outline"}
                      disabled={isCurrent || checkoutLoading === key}
                      onClick={() => !isCurrent && handleCheckout(key)}
                    >
                      {checkoutLoading === key ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {isCurrent ? "Aktueller Plan" : "Auswählen"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Invoices */}
        {invoices.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Rechnungen</CardTitle>
              <CardDescription>Ihre vergangenen Zahlungen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {invoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        {inv.period ? `Rechnung ${inv.period}` : "Rechnung"}
                      </p>
                      <p className="text-sm text-gray-400">
                        {new Intl.DateTimeFormat("de-DE").format(new Date(inv.createdAt))}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">
                        {new Intl.NumberFormat("de-DE", {
                          style: "currency",
                          currency: inv.currency.toUpperCase(),
                        }).format(inv.amount / 100)}
                      </span>
                      <Badge variant={inv.status === "PAID" ? "success" : "warning"}>
                        {inv.status === "PAID" ? "Bezahlt" : inv.status}
                      </Badge>
                      {inv.pdfUrl && (
                        <a href={inv.pdfUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="icon">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
