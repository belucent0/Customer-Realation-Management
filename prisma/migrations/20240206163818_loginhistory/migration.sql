/*
  Warnings:

  - You are about to drop the column `expiredAt` on the `LogInHistory` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `LogInHistory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `LogInHistory` DROP COLUMN `expiredAt`,
    DROP COLUMN `location`;
