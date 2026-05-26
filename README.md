# AB-Process – Auftragsbestätigungen automatisch verarbeiten

Verarbeiten Sie Auftragsbestätigungen automatisch aus Ihrem E-Mail-Postfach und synchronisieren Sie diese direkt in Ihr ERP-System.

## 1-Klick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/christianreik86/neu-abprocess&env=NEXTAUTH_SECRET,NEXTAUTH_URL,NEXT_PUBLIC_APP_URL,DATABASE_URL,STRIPE_SECRET_KEY,NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY&envDescription=Alle%20ben%C3%B6tigten%20Umgebungsvariablen&envLink=https://github.com/christianreik86/neu-abprocess%23umgebungsvariablen&project-name=ab-process&repository-name=ab-process)

> **Datenbank:** Kostenlose PostgreSQL bei [Neon](https://neon.tech) anlegen und die Connection-URL als `DATABASE_URL` eintragen.

## Lokale Installation

```bash
git clone https://github.com/christianreik86/neu-abprocess
cd neu-abprocess
cp .env.example .env   # .env befüllen
npm install
npx prisma migrate dev
npm run dev
```

App läuft auf → [http://localhost:3000](http://localhost:3000)

## Umgebungsvariablen

| Variable | Beschreibung |
|---|---|
| `DATABASE_URL` | PostgreSQL Connection-String (z.B. von [Neon](https://neon.tech)) |
| `NEXTAUTH_SECRET` | Zufälliger Schlüssel: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL der App, z.B. `https://meine-app.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | Gleiche URL wie `NEXTAUTH_URL` |
| `STRIPE_SECRET_KEY` | Aus dem [Stripe Dashboard](https://dashboard.stripe.com) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Aus dem Stripe Dashboard |
| `STRIPE_WEBHOOK_SECRET` | Via `stripe listen` generiert |
| `STRIPE_PRICE_STARTER` | Stripe Price-ID für Starter-Plan |
| `STRIPE_PRICE_BUSINESS` | Stripe Price-ID für Business-Plan |
| `STRIPE_PRICE_PROFESSIONAL` | Stripe Price-ID für Professional-Plan |
| `STRIPE_PRICE_ENTERPRISE` | Stripe Price-ID für Enterprise-Plan |

## Features

- 📧 **E-Mail-Integration** – IMAP-Postfächer automatisch auslesen
- 📄 **Auftragsbestätigungen** – Erfassen, prüfen, genehmigen
- 🔗 **ERP-Synchronisation** – SAP, DATEV, Lexoffice, sevDesk, Dynamics 365 u.v.m.
- 💳 **Abonnement-Abrechnung** – via Stripe, basierend auf Belegen/Monat
- 🔐 **Authentifizierung** – NextAuth mit sicherer Session-Verwaltung

## Preispläne

| Plan | Preis | Belege/Monat |
|---|---|---|
| Free | Kostenlos | 10 |
| Starter | 29 €/Monat | 100 |
| Business | 79 €/Monat | 500 |
| Professional | 149 €/Monat | 2.000 |
| Enterprise | 299 €/Monat | Unbegrenzt |
