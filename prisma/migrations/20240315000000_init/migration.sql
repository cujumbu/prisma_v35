-- CreateTable
CREATE TABLE "Claim" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "problemDescription" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "submissionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Claim_orderNumber_key" ON "Claim"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");