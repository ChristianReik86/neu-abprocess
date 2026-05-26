-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'STARTER', 'BUSINESS', 'PROFESSIONAL', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'PAST_DUE', 'UNPAID', 'TRIALING');

-- CreateEnum
CREATE TYPE "ErpType" AS ENUM ('SAP', 'NAVISION', 'DYNAMICS365', 'SAGE', 'DATEV', 'LEXOFFICE', 'SEVDESK', 'CUSTOM_REST', 'CUSTOM_SOAP');

-- CreateEnum
CREATE TYPE "OrderConfirmationStatus" AS ENUM ('PENDING', 'REVIEWED', 'APPROVED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ErpSyncStatus" AS ENUM ('NOT_SYNCED', 'SYNCING', 'SYNCED', 'FAILED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'OPEN', 'PAID', 'VOID');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'MEMBER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "plan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "documentsUsed" INTEGER NOT NULL DEFAULT 0,
    "documentsLimit" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailConfig" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL DEFAULT 993,
    "secure" BOOLEAN NOT NULL DEFAULT true,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "folder" TEXT NOT NULL DEFAULT 'INBOX',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ErpConfig" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "ErpType" NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "apiKey" TEXT,
    "username" TEXT,
    "password" TEXT,
    "customHeaders" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ErpConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderConfirmation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "orderNumber" TEXT,
    "supplierName" TEXT,
    "supplierEmail" TEXT,
    "subject" TEXT,
    "emailReceivedAt" TIMESTAMP(3),
    "amount" DOUBLE PRECISION,
    "currency" TEXT DEFAULT 'EUR',
    "status" "OrderConfirmationStatus" NOT NULL DEFAULT 'PENDING',
    "rawEmailContent" TEXT,
    "parsedData" JSONB,
    "erpSyncStatus" "ErpSyncStatus" NOT NULL DEFAULT 'NOT_SYNCED',
    "erpSyncedAt" TIMESTAMP(3),
    "erpReference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderConfirmation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "orderConfirmationId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "stripeInvoiceId" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'eur',
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "period" TEXT,
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_organizationId_key" ON "Subscription"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeCustomerId_key" ON "Subscription"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_stripeInvoiceId_key" ON "Invoice"("stripeInvoiceId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailConfig" ADD CONSTRAINT "EmailConfig_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ErpConfig" ADD CONSTRAINT "ErpConfig_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderConfirmation" ADD CONSTRAINT "OrderConfirmation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_orderConfirmationId_fkey" FOREIGN KEY ("orderConfirmationId") REFERENCES "OrderConfirmation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
