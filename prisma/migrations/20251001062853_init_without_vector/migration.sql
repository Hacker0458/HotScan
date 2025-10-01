-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

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
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "chain" TEXT NOT NULL,
    "logo" TEXT,
    "decimals" INTEGER NOT NULL DEFAULT 18,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pair" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "dex" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "liquidityUSD" DOUBLE PRECISION NOT NULL,
    "baseToken" TEXT,
    "fee" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pair_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Signal" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "window" TEXT NOT NULL,
    "priceChangePct" DOUBLE PRECISION NOT NULL,
    "currentPrice" DOUBLE PRECISION,
    "volZScore" DOUBLE PRECISION NOT NULL,
    "volumeUSD" DOUBLE PRECISION,
    "liqDeltaPct" DOUBLE PRECISION NOT NULL,
    "totalLiquidityUSD" DOUBLE PRECISION,
    "top5HoldPct" DOUBLE PRECISION NOT NULL,
    "holderCount" INTEGER,
    "newWalletNetBuy" DOUBLE PRECISION NOT NULL,
    "newWalletCount" INTEGER,
    "riskScore" DOUBLE PRECISION NOT NULL,
    "contractAgeDays" INTEGER NOT NULL,
    "sentiment" TEXT,
    "aiSummary" TEXT,
    "alertLevel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Signal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Term" (
    "id" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "example" TEXT,
    "searchCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Term_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Share" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "shareType" TEXT NOT NULL DEFAULT 'signal',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Share_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "channels" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobRun" (
    "id" TEXT NOT NULL,
    "jobName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "processed" INTEGER NOT NULL DEFAULT 0,
    "succeeded" INTEGER NOT NULL DEFAULT 0,
    "failed" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "metadata" JSONB,

    CONSTRAINT "JobRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analytics" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pageViews" INTEGER NOT NULL DEFAULT 0,
    "users" INTEGER NOT NULL DEFAULT 0,
    "signals" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "topAssets" JSONB,
    "topPairs" JSONB,

    CONSTRAINT "Analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawMetric" (
    "id" TEXT NOT NULL,
    "assetId" TEXT,
    "pairId" TEXT,
    "metricType" TEXT NOT NULL,
    "window" TEXT,
    "data" JSONB NOT NULL,
    "source" TEXT NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "RawMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_symbol_key" ON "Asset"("symbol");

-- CreateIndex
CREATE INDEX "Asset_symbol_idx" ON "Asset"("symbol");

-- CreateIndex
CREATE INDEX "Asset_chain_idx" ON "Asset"("chain");

-- CreateIndex
CREATE INDEX "Asset_createdAt_idx" ON "Asset"("createdAt");

-- CreateIndex
CREATE INDEX "Pair_assetId_idx" ON "Pair"("assetId");

-- CreateIndex
CREATE INDEX "Pair_dex_idx" ON "Pair"("dex");

-- CreateIndex
CREATE INDEX "Pair_liquidityUSD_idx" ON "Pair"("liquidityUSD" DESC);

-- CreateIndex
CREATE INDEX "Pair_createdAt_idx" ON "Pair"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Pair_assetId_dex_address_key" ON "Pair"("assetId", "dex", "address");

-- CreateIndex
CREATE INDEX "Signal_assetId_idx" ON "Signal"("assetId");

-- CreateIndex
CREATE INDEX "Signal_window_idx" ON "Signal"("window");

-- CreateIndex
CREATE INDEX "Signal_riskScore_idx" ON "Signal"("riskScore" DESC);

-- CreateIndex
CREATE INDEX "Signal_volZScore_idx" ON "Signal"("volZScore" DESC);

-- CreateIndex
CREATE INDEX "Signal_createdAt_riskScore_idx" ON "Signal"("createdAt" DESC, "riskScore" DESC);

-- CreateIndex
CREATE INDEX "Signal_createdAt_idx" ON "Signal"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Term_term_key" ON "Term"("term");

-- CreateIndex
CREATE INDEX "Term_term_idx" ON "Term"("term");

-- CreateIndex
CREATE INDEX "Term_category_idx" ON "Term"("category");

-- CreateIndex
CREATE INDEX "Term_searchCount_idx" ON "Term"("searchCount" DESC);

-- CreateIndex
CREATE INDEX "Share_assetId_idx" ON "Share"("assetId");

-- CreateIndex
CREATE INDEX "Share_viewCount_idx" ON "Share"("viewCount" DESC);

-- CreateIndex
CREATE INDEX "Share_createdAt_idx" ON "Share"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_tag_idx" ON "Subscription"("tag");

-- CreateIndex
CREATE INDEX "Subscription_enabled_idx" ON "Subscription"("enabled");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_tag_key" ON "Subscription"("userId", "tag");

-- CreateIndex
CREATE INDEX "JobRun_jobName_idx" ON "JobRun"("jobName");

-- CreateIndex
CREATE INDEX "JobRun_status_idx" ON "JobRun"("status");

-- CreateIndex
CREATE INDEX "JobRun_startedAt_idx" ON "JobRun"("startedAt" DESC);

-- CreateIndex
CREATE INDEX "Analytics_date_idx" ON "Analytics"("date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Analytics_date_key" ON "Analytics"("date");

-- CreateIndex
CREATE INDEX "RawMetric_assetId_metricType_idx" ON "RawMetric"("assetId", "metricType");

-- CreateIndex
CREATE INDEX "RawMetric_pairId_metricType_idx" ON "RawMetric"("pairId", "metricType");

-- CreateIndex
CREATE INDEX "RawMetric_metricType_window_idx" ON "RawMetric"("metricType", "window");

-- CreateIndex
CREATE INDEX "RawMetric_fetchedAt_idx" ON "RawMetric"("fetchedAt" DESC);

-- CreateIndex
CREATE INDEX "RawMetric_expiresAt_idx" ON "RawMetric"("expiresAt");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pair" ADD CONSTRAINT "Pair_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Signal" ADD CONSTRAINT "Signal_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Share" ADD CONSTRAINT "Share_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
