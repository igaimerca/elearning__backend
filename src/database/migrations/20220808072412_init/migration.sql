/*
  Warnings:

  - You are about to drop the column `gradeId` on the `Submission` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_gradeId_fkey";

-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "gradeId";
