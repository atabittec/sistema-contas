-- CreateTable
CREATE TABLE "RecurringGeneration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recurringItemId" TEXT NOT NULL,
    "competenceMonth" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RecurringGeneration_recurringItemId_fkey" FOREIGN KEY ("recurringItemId") REFERENCES "RecurringItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "RecurringGeneration_recurringItemId_competenceMonth_key" ON "RecurringGeneration"("recurringItemId", "competenceMonth");

-- Backfill: marca como já gerados os meses que já têm lançamento da conta fixa.
INSERT INTO "RecurringGeneration" ("id", "recurringItemId", "competenceMonth")
SELECT DISTINCT 'bf' || lower(hex(randomblob(12))), t."recurringItemId", t."competenceMonth"
FROM (SELECT DISTINCT "recurringItemId", "competenceMonth" FROM "Transaction" WHERE "recurringItemId" IS NOT NULL) t
WHERE t."recurringItemId" IN (SELECT "id" FROM "RecurringItem");
