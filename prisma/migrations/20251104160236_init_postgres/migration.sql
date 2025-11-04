-- CreateTable
CREATE TABLE "Evaluation" (
    "id" SERIAL NOT NULL,
    "dealName" TEXT NOT NULL,
    "evaluator" TEXT NOT NULL,
    "scores" JSONB NOT NULL,
    "notes" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Evaluation_dealName_idx" ON "Evaluation"("dealName");

-- CreateIndex
CREATE UNIQUE INDEX "Evaluation_dealName_evaluator_key" ON "Evaluation"("dealName", "evaluator");
