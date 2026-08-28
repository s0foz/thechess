-- Migration 0002: Add shop fields to User table
-- Run this if you already have the User table from migration 0001.

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "pieces" INTEGER NOT NULL DEFAULT 50;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "ownedSkins" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "ownedTitles" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "activePieceSkin" TEXT NOT NULL DEFAULT 'default';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "activeBoardSkin" TEXT NOT NULL DEFAULT 'default';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "activeTitle" TEXT;
