-- CreateTable
CREATE TABLE "MaterialSave" (
    "userId" UUID NOT NULL,
    "materialId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaterialSave_pkey" PRIMARY KEY ("userId", "materialId")
);

-- CreateTable
CREATE TABLE "MaterialView" (
    "userId" UUID NOT NULL,
    "materialId" UUID NOT NULL,
    "lastViewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "viewCount" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "MaterialView_pkey" PRIMARY KEY ("userId", "materialId")
);

-- CreateIndex
CREATE INDEX "MaterialSave_userId_createdAt_idx" ON "MaterialSave"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "MaterialSave_materialId_idx" ON "MaterialSave"("materialId");

-- CreateIndex
CREATE INDEX "MaterialView_userId_lastViewedAt_idx" ON "MaterialView"("userId", "lastViewedAt");

-- CreateIndex
CREATE INDEX "MaterialView_materialId_idx" ON "MaterialView"("materialId");

-- AddForeignKey
ALTER TABLE "MaterialSave" ADD CONSTRAINT "MaterialSave_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialSave" ADD CONSTRAINT "MaterialSave_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "LearningMaterial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialView" ADD CONSTRAINT "MaterialView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialView" ADD CONSTRAINT "MaterialView_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "LearningMaterial"("id") ON DELETE CASCADE ON UPDATE CASCADE;
