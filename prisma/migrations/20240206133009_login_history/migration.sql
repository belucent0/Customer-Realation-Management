/*
  Warnings:

  - You are about to drop the column `revoked` on the `LogInHistory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `LogInHistory` DROP COLUMN `revoked`,
    ADD COLUMN `logoutAt` DATETIME(3) NULL;
