-- AlterTable
ALTER TABLE "Signal" ADD COLUMN "summaryZh" TEXT;
ALTER TABLE "Signal" ADD COLUMN "summaryEn" TEXT;

-- CreateIndex
CREATE INDEX "Signal_assetId_window_createdAt_idx" ON "Signal"("assetId", "window", "createdAt");

