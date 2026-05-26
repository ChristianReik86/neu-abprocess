import Link from "next/link";
import { FileCheck2, Mail, Database, BarChart3, Shield, Zap, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLANS, formatPrice } from "@/lib/stripe";

export default function LandingPage() {
  const plans = Object.entries(PLANS).filter(([key]) => key !== "FREE");

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <FileCheck2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">AB-Process</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">
              Preise
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">Anmelden</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Kostenlos starten</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 text-center">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
            <Zap className="h-4 w-4" />
            Auftragsbestätigungen automatisch verarbeiten
          </div>
          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-gray-900">
            Schluss mit manuellem<br />
            <span className="text-blue-600">Abtippen von Auftragsbestätigungen</span>
          </h1>
          <p className="mb-10 text-xl leading-relaxed text-gray-500">
            AB-Process liest Ihre Auftragsbestätigungen automatisch aus dem E-Mail-Postfach,
            verarbeitet sie intelligent und synchronisiert sie direkt in Ihr ERP-System.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Jetzt kostenlos testen <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg">Preise ansehen</Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-400">Keine Kreditkarte erforderlich · 10 Belege kostenlos</p>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-4 text-center text-3xl font-bold text-gray-900">
            Alles was Sie brauchen
          </h2>
          <p className="mb-16 text-center text-gray-500">
            Von der E-Mail bis zum ERP – vollständig automatisiert
          </p>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                icon: Mail,
                title: "E-Mail-Integration",
                desc: "Verbinden Sie beliebig viele IMAP-Postfächer. AB-Process prüft automatisch auf neue Auftragsbestätigungen.",
                color: "bg-blue-50 text-blue-600",
              },
              {
                icon: FileCheck2,
                title: "Intelligente Verarbeitung",
                desc: "Bestellnummern, Lieferanten, Beträge – werden automatisch aus den E-Mails extrahiert und strukturiert.",
                color: "bg-green-50 text-green-600",
              },
              {
                icon: Database,
                title: "ERP-Synchronisation",
                desc: "Direkte Anbindung an SAP, DATEV, Lexoffice, sevDesk, Dynamics 365 und alle weiteren REST-APIs.",
                color: "bg-purple-50 text-purple-600",
              },
              {
                icon: BarChart3,
                title: "Übersichtliches Dashboard",
                desc: "Alle Auftragsbestätigungen im Blick – mit Status-Tracking, Filterung und Exportfunktion.",
                color: "bg-orange-50 text-orange-600",
              },
              {
                icon: Shield,
                title: "DSGVO-konform",
                desc: "Server in Deutschland, Ende-zu-Ende-Verschlüsselung, vollständiges Audit-Log.",
                color: "bg-red-50 text-red-600",
              },
              {
                icon: Zap,
                title: "API-Zugang",
                desc: "Nutzen Sie unsere REST-API für eigene Integrationen und Automatisierungen.",
                color: "bg-yellow-50 text-yellow-600",
              },
            ].map((f) => (
              <div key={f.title} className="rounded-xl bg-white p-6 shadow-sm">
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg ${f.color}`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{f.title}</h3>
                <p className="text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-4 text-center text-3xl font-bold text-gray-900">Einfache Preise</h2>
          <p className="mb-16 text-center text-gray-500">
            Wählen Sie den Plan, der zu Ihrem Belegvolumen passt
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {plans.map(([key, plan]) => (
              <div
                key={key}
                className={`rounded-xl border p-6 ${key === "BUSINESS" ? "border-blue-500 ring-2 ring-blue-500" : "border-gray-200"}`}
              >
                {key === "BUSINESS" && (
                  <div className="mb-3 text-center">
                    <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                      Beliebtester Plan
                    </span>
                  </div>
                )}
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-500">{plan.description}</p>
                <div className="my-4">
                  <span className="text-3xl font-bold text-gray-900">{formatPrice(plan.price)}</span>
                  <span className="text-gray-500">/Monat</span>
                </div>
                <p className="mb-4 text-sm font-medium text-blue-600">
                  {plan.documentsLimit === 999999 ? "Unbegrenzte" : `${plan.documentsLimit}`} Belege/Monat
                </p>
                <ul className="mb-6 space-y-2">
                  {plan.features.slice(0, 4).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button variant={key === "BUSINESS" ? "default" : "outline"} className="w-full">
                    Jetzt starten
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 px-6 py-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
              <FileCheck2 className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">AB-Process</span>
          </div>
          <p className="text-sm text-gray-500">© 2025 AB-Process. Alle Rechte vorbehalten.</p>
          <div className="flex gap-4 text-sm text-gray-500">
            <Link href="#" className="hover:text-gray-900">Datenschutz</Link>
            <Link href="#" className="hover:text-gray-900">Impressum</Link>
            <Link href="#" className="hover:text-gray-900">AGB</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
