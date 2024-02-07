/*
  Warnings:

  - You are about to drop the `LogInHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `LogInHistory` DROP FOREIGN KEY `LogInHistory_userId_fkey`;

-- DropTable
DROP TABLE `LogInHistory`;

-- CreateTable
CREATE TABLE `Token` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `issuedAt` TIMESTAMP(0) NOT NULL,
    `expiresAt` TIMESTAMP(0) NOT NULL,
    `isRevoked` BIGINT NOT NULL DEFAULT 0,

    INDEX `Token_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Token` ADD CONSTRAINT `Token_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
