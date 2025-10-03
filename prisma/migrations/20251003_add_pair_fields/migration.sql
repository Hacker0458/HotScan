-- Add new columns to Pair table
ALTER TABLE "Pair" ADD COLUMN IF NOT EXISTS "dexId" TEXT NOT NULL DEFAULT 'unknown';
ALTER TABLE "Pair" ADD COLUMN IF NOT EXISTS "dex" TEXT NOT NULL DEFAULT 'unknown';
ALTER TABLE "Pair" ADD COLUMN IF NOT EXISTS "pairAddress" TEXT;
ALTER TABLE "Pair" ADD COLUMN IF NOT EXISTS "chainId" TEXT;
ALTER TABLE "Pair" ADD COLUMN IF NOT EXISTS "priceUsd" DOUBLE PRECISION;
ALTER TABLE "Pair" ADD COLUMN IF NOT EXISTS "fdv" DOUBLE PRECISION;
ALTER TABLE "Pair" ADD COLUMN IF NOT EXISTS "volumeH24" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Pair" ADD COLUMN IF NOT EXISTS "priceChangeH24" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Create unique constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Pair_pairAddress_chainId_key'
    ) THEN
        ALTER TABLE "Pair" ADD CONSTRAINT "Pair_pairAddress_chainId_key" UNIQUE ("pairAddress", "chainId");
    END IF;
END $$;
