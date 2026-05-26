export const PLANS = {
  FREE: {
    name: "Free",
    description: "Zum Kennenlernen",
    price: 0,
    priceId: null,
    documentsLimit: 10,
    features: [
      "Bis zu 10 Belege/Monat",
      "1 E-Mail-Postfach",
      "1 ERP-Verbindung",
      "Basis-Dashboard",
    ],
  },
  STARTER: {
    name: "Starter",
    description: "Für kleine Unternehmen",
    price: 2900,
    priceId: process.env.STRIPE_PRICE_STARTER,
    documentsLimit: 100,
    features: [
      "Bis zu 100 Belege/Monat",
      "3 E-Mail-Postfächer",
      "2 ERP-Verbindungen",
      "E-Mail-Support",
      "Exportfunktion (CSV/PDF)",
    ],
  },
  BUSINESS: {
    name: "Business",
    description: "Für wachsende Teams",
    price: 7900,
    priceId: process.env.STRIPE_PRICE_BUSINESS,
    documentsLimit: 500,
    features: [
      "Bis zu 500 Belege/Monat",
      "10 E-Mail-Postfächer",
      "5 ERP-Verbindungen",
      "Prioritäts-Support",
      "Automatische ERP-Synchronisation",
      "Webhook-Integration",
    ],
  },
  PROFESSIONAL: {
    name: "Professional",
    description: "Für etablierte Unternehmen",
    price: 14900,
    priceId: process.env.STRIPE_PRICE_PROFESSIONAL,
    documentsLimit: 2000,
    features: [
      "Bis zu 2.000 Belege/Monat",
      "Unbegrenzte E-Mail-Postfächer",
      "Unbegrenzte ERP-Verbindungen",
      "24/7 Support",
      "API-Zugang",
      "Custom Felder",
      "Audit-Log",
    ],
  },
  ENTERPRISE: {
    name: "Enterprise",
    description: "Für große Unternehmen",
    price: 29900,
    priceId: process.env.STRIPE_PRICE_ENTERPRISE,
    documentsLimit: 999999,
    features: [
      "Unbegrenzte Belege/Monat",
      "Unbegrenzte Postfächer & ERP",
      "Dedizierter Account Manager",
      "SLA-Garantie",
      "On-Premise Option",
      "DATEV-Direktanbindung",
      "Custom Entwicklung",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}
