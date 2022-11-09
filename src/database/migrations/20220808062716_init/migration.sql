/*
  Warnings:

  - You are about to drop the column `assignmentId` on the `Grade` table. All the data in the column will be lost.
  - You are about to drop the column `grade` on the `Submission` table. All the data in the column will be lost.
  - Added the required column `gradeId` to the `Submission` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Grade" DROP CONSTRAINT "Grade_assignmentId_fkey";

-- AlterTable
ALTER TABLE "Grade" DROP COLUMN "assignmentId";

-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "grade",
ADD COLUMN     "gradeId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
