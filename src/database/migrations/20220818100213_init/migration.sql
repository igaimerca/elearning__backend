/*
  Warnings:

  - You are about to drop the column `ip` on the `AuditLog` table. All the data in the column will be lost.
  - Added the required column `details` to the `AuditLog` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ANNOUNCEMENT', 'EVENT', 'MESSAGE', 'ASSIGNMENT');

-- CreateEnum
CREATE TYPE "TargetType" AS ENUM ('USER', 'GROUP', 'ALL', 'TEACHER');

-- CreateEnum
CREATE TYPE "NotificationSettings" AS ENUM ('ON', 'OFF');

-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "ip",
ADD COLUMN     "details" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "InterestOrSkills" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterestOrSkills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "targetedUser" "TargetType" NOT NULL,
    "announcementId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "NotificationType" "NotificationType" NOT NULL,
    "linkToAttachment" TEXT,
    "courseId" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "linkToAttachment" TEXT,
    "notificationId" TEXT NOT NULL,
    "notificationSeen" BOOLEAN NOT NULL DEFAULT false,
    "notificationSettings" "NotificationSettings" NOT NULL DEFAULT 'ON',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserNotification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InterestOrSkills" ADD CONSTRAINT "InterestOrSkills_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "Announcement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNotification" ADD CONSTRAINT "UserNotification_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNotification" ADD CONSTRAINT "UserNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
