import Link from "next/link";
import { FileCheck2, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLANS, formatPrice } from "@/lib/plans";

export default function PricingPage() {
  const allPlans = Object.entries(PLANS);

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <FileCheck2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">AB-Process</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline" size="sm">Anmelden</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Kostenlos starten</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h1 className="mb-4 text-4xl font-bold text-gray-900">Transparente Preise</h1>
            <p className="text-xl text-gray-500">
              Zahlen Sie nur für die Belege, die Sie tatsächlich verarbeiten
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
            {allPlans.map(([key, plan]) => (
              <div
                key={key}
                className={`relative rounded-xl border p-6 ${
                  key === "BUSINESS"
                    ? "border-blue-500 ring-2 ring-blue-500 lg:scale-105"
                    : "border-gray-200"
                }`}
              >
                {key === "BUSINESS" && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow">
                      Beliebtester Plan
                    </span>
                  </div>
                )}
                {key === "FREE" && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-gray-600 px-4 py-1.5 text-xs font-bold text-white shadow">
                      Gratis
                    </span>
                  </div>
                )}

                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{plan.description}</p>

                <div className="my-5">
                  {plan.price === 0 ? (
                    <div>
                      <span className="text-4xl font-bold text-gray-900">Kostenlos</span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-4xl font-bold text-gray-900">{formatPrice(plan.price)}</span>
                      <span className="text-gray-500">/Monat</span>
                    </div>
                  )}
                </div>

                <div className="mb-5 rounded-lg bg-blue-50 px-3 py-2 text-center text-sm font-semibold text-blue-700">
                  {plan.documentsLimit === 999999
                    ? "Unbegrenzte Belege"
                    : `${plan.documentsLimit} Belege/Monat`}
                </div>

                <ul className="mb-6 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link href="/register">
                  <Button
                    className="w-full gap-2"
                    variant={key === "BUSINESS" ? "default" : key === "FREE" ? "outline" : "outline"}
                  >
                    {key === "FREE" ? "Kostenlos starten" : "Jetzt auswählen"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="mt-20">
            <h2 className="mb-10 text-center text-2xl font-bold text-gray-900">
              Häufige Fragen
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {[
                {
                  q: "Was zählt als ein Beleg?",
                  a: "Jede automatisch verarbeitete oder manuell erfasste Auftragsbestätigung zählt als ein Beleg. Die Zählung beginnt am Monatsersten neu.",
                },
                {
                  q: "Kann ich jederzeit upgraden oder downgraden?",
                  a: "Ja, Sie können Ihren Plan jederzeit anpassen. Bei Upgrades wird anteilig abgerechnet. Bei Downgrades läuft der aktuelle Plan bis zum Ende des Abrechnungszeitraums.",
                },
                {
                  q: "Welche ERP-Systeme werden unterstützt?",
                  a: "Wir unterstützen SAP, DATEV, Lexoffice, sevDesk, Microsoft Dynamics 365, Navision, Sage und alle weiteren Systeme mit REST-API.",
                },
                {
                  q: "Wie werden meine Daten geschützt?",
                  a: "Alle Daten werden verschlüsselt übertragen und gespeichert. Unsere Server stehen in Deutschland und unterliegen der DSGVO.",
                },
                {
                  q: "Gibt es eine Mindestlaufzeit?",
                  a: "Nein. Alle Pläne sind monatlich kündbar. Sie zahlen nur für den aktuellen Monat.",
                },
                {
                  q: "Was passiert wenn ich das Limit erreiche?",
                  a: "Sie werden rechtzeitig benachrichtigt. Weitere Belege werden erst wieder im nächsten Monat verarbeitet, oder Sie upgraden sofort.",
                },
              ].map((item) => (
                <div key={item.q} className="rounded-xl border border-gray-100 p-5">
                  <h3 className="mb-2 font-semibold text-gray-900">{item.q}</h3>
                  <p className="text-sm text-gray-500">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-gray-50 px-6 py-8 text-center text-sm text-gray-400">
        © 2025 AB-Process · Alle Preise inkl. MwSt.
      </footer>
    </div>
  );
}
