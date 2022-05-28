-- AlterTable
ALTER TABLE `StockData` ADD COLUMN `amount` VARCHAR(191) NULL,
    ADD COLUMN `previousId` INTEGER NULL,
    ADD COLUMN `volume` VARCHAR(191) NULL,
    MODIFY `preClose` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `StockData` ADD CONSTRAINT `StockData_previousId_fkey` FOREIGN KEY (`previousId`) REFERENCES `StockData`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
