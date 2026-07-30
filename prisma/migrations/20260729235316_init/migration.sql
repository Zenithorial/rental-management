-- CreateTable
CREATE TABLE "Profile" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'User',

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);
