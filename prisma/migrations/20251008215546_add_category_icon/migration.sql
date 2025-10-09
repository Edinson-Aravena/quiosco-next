/*
  Warnings:

  - Added the required column `icon` to the `Category` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Category" ADD COLUMN "icon" TEXT NOT NULL DEFAULT '';

-- Update existing categories with their icons
UPDATE "public"."Category" SET "icon" = '/almuerzo-icon.png' WHERE "slug" = 'almuerzos';
UPDATE "public"."Category" SET "icon" = '/comida-rapida-icon.png' WHERE "slug" = 'comida-rapida';
UPDATE "public"."Category" SET "icon" = '/bebida-icon.png' WHERE "slug" = 'bebidas';
UPDATE "public"."Category" SET "icon" = '/postres-icon.png' WHERE "slug" = 'postres';
UPDATE "public"."Category" SET "icon" = '/alcohol-icon.png' WHERE "slug" = 'alcohol';
