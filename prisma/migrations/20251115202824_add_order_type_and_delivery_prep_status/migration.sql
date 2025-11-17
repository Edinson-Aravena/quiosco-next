-- AlterTable
ALTER TABLE `orders` ADD COLUMN `order_delivered_at` DATETIME(3) NULL,
    ADD COLUMN `order_in_progress_at` DATETIME(3) NULL,
    ADD COLUMN `order_ready_at` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `orders_quiosco` ADD COLUMN `order_type` ENUM('QUIOSCO', 'DELIVERY') NOT NULL DEFAULT 'QUIOSCO';
