-- DropForeignKey
ALTER TABLE "TutorProfile" DROP CONSTRAINT "TutorProfile_userId_fkey";
ALTER TABLE "StudentProfile" DROP CONSTRAINT "StudentProfile_userId_fkey";
ALTER TABLE "Application" DROP CONSTRAINT "Application_studentId_fkey";
ALTER TABLE "Application" DROP CONSTRAINT "Application_tutorId_fkey";
ALTER TABLE "Review" DROP CONSTRAINT "Review_tutorId_fkey";
ALTER TABLE "Review" DROP CONSTRAINT "Review_studentId_fkey";
ALTER TABLE "FileUpload" DROP CONSTRAINT "FileUpload_userId_fkey";
ALTER TABLE "Material" DROP CONSTRAINT "Material_tutorId_fkey";
ALTER TABLE "MaterialAccess" DROP CONSTRAINT "MaterialAccess_materialId_fkey";
ALTER TABLE "MaterialAccess" DROP CONSTRAINT "MaterialAccess_studentId_fkey";

-- AddColumn (updatedAt). Backfill with createdAt for existing rows, then add NOT NULL default now().
ALTER TABLE "Material" ADD COLUMN "updatedAt" TIMESTAMP(3);
UPDATE "Material" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;
ALTER TABLE "Material" ALTER COLUMN "updatedAt" SET NOT NULL, ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "FileUpload" ADD COLUMN "updatedAt" TIMESTAMP(3);
UPDATE "FileUpload" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;
ALTER TABLE "FileUpload" ALTER COLUMN "updatedAt" SET NOT NULL, ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AddUnique
CREATE UNIQUE INDEX "Application_studentId_tutorId_key" ON "Application"("studentId", "tutorId");
CREATE UNIQUE INDEX "Review_tutorId_studentId_key" ON "Review"("tutorId", "studentId");
CREATE UNIQUE INDEX "MaterialAccess_materialId_studentId_key" ON "MaterialAccess"("materialId", "studentId");

-- AddForeignKey (recreated with explicit onDelete)
ALTER TABLE "TutorProfile" ADD CONSTRAINT "TutorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Application" ADD CONSTRAINT "Application_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Application" ADD CONSTRAINT "Application_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "TutorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "TutorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FileUpload" ADD CONSTRAINT "FileUpload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Material" ADD CONSTRAINT "Material_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "TutorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MaterialAccess" ADD CONSTRAINT "MaterialAccess_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MaterialAccess" ADD CONSTRAINT "MaterialAccess_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
