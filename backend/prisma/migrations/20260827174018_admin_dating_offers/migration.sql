-- CreateEnum
CREATE TYPE "DatingStatus" AS ENUM ('NONE', 'PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "canPostOffers" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "datingRejectionReason" TEXT,
ADD COLUMN     "datingStatus" "DatingStatus" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "OfferPermissionRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "OfferPermissionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vacancy" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "contact" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vacancy_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OfferPermissionRequest" ADD CONSTRAINT "OfferPermissionRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vacancy" ADD CONSTRAINT "Vacancy_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
