/*
  Warnings:

  - Added the required column `owner` to the `ScheduledMeeting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant` to the `ScheduledMeeting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ScheduledMeeting` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ScheduledMeeting" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "owner" TEXT NOT NULL,
ADD COLUMN     "tenant" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
