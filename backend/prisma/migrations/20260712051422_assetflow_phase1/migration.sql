/*
  Warnings:

  - Added the required column `categoryId` to the `Asset` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "categoryId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "departmentId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "AssetCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
