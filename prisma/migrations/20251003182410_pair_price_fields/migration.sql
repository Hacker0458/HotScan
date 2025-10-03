-- Add priceChange1h field to Pair table
ALTER TABLE "Pair" ADD COLUMN IF NOT EXISTS "priceChange1h" DOUBLE PRECISION;

-- Rename priceChangeH24 to priceChange24h for naming consistency (if column exists)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Pair' AND column_name = 'priceChangeH24'
    ) THEN
        ALTER TABLE "Pair" RENAME COLUMN "priceChangeH24" TO "priceChange24h";
    END IF;
END $$;

-- Ensure priceChange24h exists if migration was run before
ALTER TABLE "Pair" ADD COLUMN IF NOT EXISTS "priceChange24h" DOUBLE PRECISION;
