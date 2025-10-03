-- Make pairAddress and chainId nullable
ALTER TABLE "Pair" ALTER COLUMN "pairAddress" DROP NOT NULL;
ALTER TABLE "Pair" ALTER COLUMN "chainId" DROP NOT NULL;
ALTER TABLE "Pair" ALTER COLUMN "dexId" SET DEFAULT 'unknown';
