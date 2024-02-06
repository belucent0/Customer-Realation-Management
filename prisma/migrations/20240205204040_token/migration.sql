/*
  Warnings:

  - You are about to drop the column `tokenVersion` on the `Token` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tokenVer]` on the table `Token` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Token_tokenVersion_key` ON `Token`;

-- AlterTable
ALTER TABLE `Token` DROP COLUMN `tokenVersion`,
    ADD COLUMN `tokenVer` VARCHAR(191) NOT NULL DEFAULT 'v1';

-- CreateIndex
CREATE UNIQUE INDEX `Token_tokenVer_key` ON `Token`(`tokenVer`);
