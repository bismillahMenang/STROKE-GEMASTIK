-- DropForeignKey
ALTER TABLE "Assessment" DROP CONSTRAINT "Assessment_patientId_fkey";

-- DropTable
DROP TABLE "Assessment";

-- DropEnum
DROP TYPE "AssessmentType";

-- DropEnum
DROP TYPE "RiskLevel";
