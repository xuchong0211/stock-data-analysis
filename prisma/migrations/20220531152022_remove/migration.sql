/*
  Warnings:

  - You are about to drop the column `stockDataId` on the `CriticalPoint` table. All the data in the column will be lost.
  - You are about to drop the `CrossPoint` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StockData` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `CriticalPoint` DROP FOREIGN KEY `CriticalPoint_stockDataId_fkey`;

-- DropForeignKey
ALTER TABLE `CrossPoint` DROP FOREIGN KEY `CrossPoint_criticalPointId_fkey`;

-- DropForeignKey
ALTER TABLE `CrossPoint` DROP FOREIGN KEY `CrossPoint_stockDataId_fkey`;

-- DropForeignKey
ALTER TABLE `StockData` DROP FOREIGN KEY `StockData_previousId_fkey`;

-- DropForeignKey
ALTER TABLE `StockData` DROP FOREIGN KEY `StockData_stockId_fkey`;

-- AlterTable
ALTER TABLE `CriticalPoint` DROP COLUMN `stockDataId`,
    ADD COLUMN `stockDateDataId` INTEGER NULL;

-- DropTable
DROP TABLE `CrossPoint`;

-- DropTable
DROP TABLE `StockData`;

-- CreateTable
CREATE TABLE `StockDateData` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stockId` VARCHAR(191) NOT NULL,
    `date` INTEGER NOT NULL,
    `time` VARCHAR(191) NOT NULL,
    `open` VARCHAR(191) NOT NULL,
    `close` VARCHAR(191) NOT NULL,
    `high` VARCHAR(191) NOT NULL,
    `low` VARCHAR(191) NOT NULL,
    `preClose` VARCHAR(191) NULL,
    `volume` VARCHAR(191) NULL,
    `amount` VARCHAR(191) NULL,
    `previousId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ModelPoint` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` INTEGER NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `mode` VARCHAR(191) NOT NULL,
    `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StockDateData` ADD CONSTRAINT `StockDateData_stockId_fkey` FOREIGN KEY (`stockId`) REFERENCES `Stock`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockDateData` ADD CONSTRAINT `StockDateData_previousId_fkey` FOREIGN KEY (`previousId`) REFERENCES `StockDateData`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CriticalPoint` ADD CONSTRAINT `CriticalPoint_stockDateDataId_fkey` FOREIGN KEY (`stockDateDataId`) REFERENCES `StockDateData`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
