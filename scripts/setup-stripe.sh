#!/bin/bash
# Stripe Produkte & Preise anlegen (einmalig ausführen nach stripe login)
# Voraussetzung: stripe CLI installiert und eingeloggt (stripe login)

set -e

echo "Erstelle Stripe-Produkt: AB-Process"
PRODUCT_ID=$(stripe products create \
  --name="AB-Process" \
  --description="Auftragsbestätigungs-Verarbeitungssoftware" \
  --format=json | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")

echo "Produkt-ID: $PRODUCT_ID"
echo ""
echo "Erstelle Preise..."

STARTER=$(stripe prices create \
  --product="$PRODUCT_ID" \
  --unit-amount=2900 \
  --currency=eur \
  --recurring[interval]=month \
  --nickname="Starter" \
  --format=json | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")

BUSINESS=$(stripe prices create \
  --product="$PRODUCT_ID" \
  --unit-amount=7900 \
  --currency=eur \
  --recurring[interval]=month \
  --nickname="Business" \
  --format=json | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")

PROFESSIONAL=$(stripe prices create \
  --product="$PRODUCT_ID" \
  --unit-amount=14900 \
  --currency=eur \
  --recurring[interval]=month \
  --nickname="Professional" \
  --format=json | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")

ENTERPRISE=$(stripe prices create \
  --product="$PRODUCT_ID" \
  --unit-amount=29900 \
  --currency=eur \
  --recurring[interval]=month \
  --nickname="Enterprise" \
  --format=json | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")

echo ""
echo "Fertig! Tragen Sie folgende Werte in Ihre .env ein:"
echo ""
echo "STRIPE_PRICE_STARTER=$STARTER"
echo "STRIPE_PRICE_BUSINESS=$BUSINESS"
echo "STRIPE_PRICE_PROFESSIONAL=$PROFESSIONAL"
echo "STRIPE_PRICE_ENTERPRISE=$ENTERPRISE"
echo ""
echo "Webhook für lokale Entwicklung:"
echo "  stripe listen --forward-to localhost:3000/api/stripe/webhook"
