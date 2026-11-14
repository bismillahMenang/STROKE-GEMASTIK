-- CreateEnum
CREATE TYPE "PainLevel" AS ENUM ('none', 'mild', 'stopped');

-- AlterTable
ALTER TABLE "Session" ADD COLUMN "avgSmoothness" DOUBLE PRECISION,
ADD COLUMN "ceilingHits" INTEGER,
ADD COLUMN "pain" "PainLevel",
ADD COLUMN "prescriptionSource" TEXT;

-- CreateTable
CREATE TABLE "Prescription" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "exercise" "Exercise" NOT NULL,
    "targetRom" DOUBLE PRECISION NOT NULL,
    "romCeiling" DOUBLE PRECISION NOT NULL,
    "targetReps" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Prescription_patientId_exercise_key" ON "Prescription"("patientId", "exercise");

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;