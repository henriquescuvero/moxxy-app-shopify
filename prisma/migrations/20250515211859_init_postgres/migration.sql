/*
  Warnings:

  - You are about to alter the column `title` on the `Popup` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `status` on the `Popup` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - You are about to alter the column `trigger` on the `Popup` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `position` on the `Popup` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `animation` on the `Popup` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `backgroundColor` on the `Popup` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(7)`.
  - You are about to alter the column `textColor` on the `Popup` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(7)`.
  - You are about to alter the column `buttonColor` on the `Popup` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(7)`.
  - You are about to alter the column `buttonTextColor` on the `Popup` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(7)`.
  - You are about to drop the column `shop` on the `Session` table. All the data in the column will be lost.
  - You are about to alter the column `state` on the `Session` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `scope` on the `Session` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `accessToken` on the `Session` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `firstName` on the `Session` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `lastName` on the `Session` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `email` on the `Session` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `locale` on the `Session` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(5)`.
  - You are about to alter the column `shopify_domain` on the `Shop` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `access_token` on the `Shop` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `scopes` on the `Shop` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - A unique constraint covering the columns `[shopDomain]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shopDomain` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_shop_fkey";

-- AlterTable
ALTER TABLE "Popup" ALTER COLUMN "title" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "status" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "trigger" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "position" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "animation" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "backgroundColor" SET DATA TYPE VARCHAR(7),
ALTER COLUMN "textColor" SET DATA TYPE VARCHAR(7),
ALTER COLUMN "buttonColor" SET DATA TYPE VARCHAR(7),
ALTER COLUMN "buttonTextColor" SET DATA TYPE VARCHAR(7);

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "shop",
ADD COLUMN     "shopDomain" TEXT NOT NULL,
ALTER COLUMN "state" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "scope" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "accessToken" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "firstName" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "lastName" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "email" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "locale" SET DATA TYPE VARCHAR(5);

-- AlterTable
ALTER TABLE "Shop" ALTER COLUMN "shopify_domain" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "access_token" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "scopes" SET DATA TYPE VARCHAR(255)[];

-- CreateIndex
CREATE INDEX "Popup_shopId_idx" ON "Popup"("shopId");

-- CreateIndex
CREATE INDEX "Popup_status_idx" ON "Popup"("status");

-- CreateIndex
CREATE INDEX "Popup_created_at_idx" ON "Popup"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "Session_shopDomain_key" ON "Session"("shopDomain");

-- CreateIndex
CREATE INDEX "Session_shopDomain_idx" ON "Session"("shopDomain");

-- CreateIndex
CREATE INDEX "Shop_shopify_domain_idx" ON "Shop"("shopify_domain");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_shopDomain_fkey" FOREIGN KEY ("shopDomain") REFERENCES "Shop"("shopify_domain") ON DELETE RESTRICT ON UPDATE CASCADE;
