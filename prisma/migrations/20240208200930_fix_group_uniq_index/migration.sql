/*
  Warnings:

  - A unique constraint covering the columns `[name,deleted]` on the table `groups` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "groups_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "groups_name_deleted_key" ON "groups"("name", "deleted");
