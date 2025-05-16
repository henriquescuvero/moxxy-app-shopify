-- CreateTable
CREATE TABLE "Shop" (
    "id" TEXT NOT NULL,
    "shopify_domain" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "scopes" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Popup" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'inactive',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "metrics" JSONB,
    "trigger" TEXT NOT NULL DEFAULT 'on_page_load',
    "duration" INTEGER NOT NULL DEFAULT 5,
    "position" TEXT NOT NULL DEFAULT 'center',
    "animation" TEXT NOT NULL DEFAULT 'fade',
    "backgroundColor" TEXT NOT NULL DEFAULT '#ffffff',
    "textColor" TEXT NOT NULL DEFAULT '#000000',
    "buttonColor" TEXT NOT NULL DEFAULT '#007bff',
    "buttonTextColor" TEXT NOT NULL DEFAULT '#ffffff',
    "cookieDuration" INTEGER NOT NULL DEFAULT 24,
    "isDismissable" BOOLEAN NOT NULL DEFAULT true,
    "showCloseButton" BOOLEAN NOT NULL DEFAULT true,
    "zIndex" INTEGER NOT NULL DEFAULT 9999,

    CONSTRAINT "Popup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Shop_shopify_domain_key" ON "Shop"("shopify_domain");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_shop_fkey" FOREIGN KEY ("shop") REFERENCES "Shop"("shopify_domain") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Popup" ADD CONSTRAINT "Popup_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
