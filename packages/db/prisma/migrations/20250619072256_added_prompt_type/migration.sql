/*
  Warnings:

  - Added the required column `type` to the `Prompt` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PromptType" AS ENUM ('USER', 'SYSTEM');

-- AlterTable
ALTER TABLE "Prompt" ADD COLUMN     "type" "PromptType" NOT NULL;
