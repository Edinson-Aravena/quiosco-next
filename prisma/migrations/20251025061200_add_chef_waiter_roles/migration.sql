-- AlterEnum - Add new roles and update existing users
BEGIN;

-- First update existing CUSTOMER users to WAITER
UPDATE "User" SET role = 'WAITER' WHERE role = 'CUSTOMER';

-- AlterEnum: Add CHEF and WAITER, remove CUSTOMER
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'CHEF';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'WAITER';

-- AlterTable: Add name column
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "name" TEXT;

-- Update default value
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'WAITER';

COMMIT;
