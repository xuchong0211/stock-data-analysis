/*
  Warnings:

  - Added the required column `stockDataId` to the `CrossPoint` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `CriticalPoint` ADD COLUMN `stockDataId` INTEGER NULL;

-- AlterTable
ALTER TABLE `CrossPoint` ADD COLUMN `stockDataId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `StockData` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stockId` VARCHAR(191) NOT NULL,
    `date` INTEGER NOT NULL,
    `time` VARCHAR(191) NOT NULL,
    `open` VARCHAR(191) NOT NULL,
    `close` VARCHAR(191) NOT NULL,
    `high` VARCHAR(191) NOT NULL,
    `low` VARCHAR(191) NOT NULL,
    `preClose` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StockData` ADD CONSTRAINT `StockData_stockId_fkey` FOREIGN KEY (`stockId`) REFERENCES `Stock`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CriticalPoint` ADD CONSTRAINT `CriticalPoint_stockDataId_fkey` FOREIGN KEY (`stockDataId`) REFERENCES `StockData`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CrossPoint` ADD CONSTRAINT `CrossPoint_stockDataId_fkey` FOREIGN KEY (`stockDataId`) REFERENCES `StockData`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
