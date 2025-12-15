-- CreateTable
CREATE TABLE "users" (
    "id_user" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "last_name" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "avatar" TEXT,
    "status" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "change_password" (
    "id_change_password" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_user" INTEGER NOT NULL,
    "reset_password_token" TEXT NOT NULL,
    "token_lifetime" DATETIME NOT NULL,
    CONSTRAINT "change_password_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users" ("id_user") ON DELETE NO ACTION ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "verify_emails" (
    "id_verification_email" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_user" INTEGER NOT NULL,
    "verified_email" BOOLEAN NOT NULL,
    "token_email" TEXT NOT NULL,
    "token_lifetime" DATETIME NOT NULL,
    CONSTRAINT "verify_emails_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users" ("id_user") ON DELETE NO ACTION ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "clients" (
    "id_client" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "client_id" TEXT NOT NULL,
    "client_secret" TEXT NOT NULL,
    "redirect_uris" TEXT NOT NULL,
    "grant_types" TEXT NOT NULL,
    "response_types" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "token_endpoint" TEXT NOT NULL,
    "id_user" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "clients_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users" ("id_user") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tokens" (
    "id_token" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "client_id" INTEGER NOT NULL,
    "scope" TEXT NOT NULL,
    "expires_at" DATETIME NOT NULL,
    "is_revoked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "token_value" TEXT NOT NULL,
    CONSTRAINT "tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id_user") ON DELETE NO ACTION ON UPDATE CASCADE,
    CONSTRAINT "tokens_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients" ("id_client") ON DELETE NO ACTION ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "logs" (
    "id_log" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "client_id" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id_user") ON DELETE NO ACTION ON UPDATE CASCADE,
    CONSTRAINT "logs_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients" ("id_client") ON DELETE NO ACTION ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "verify_emails_id_user_key" ON "verify_emails"("id_user");

-- CreateIndex
CREATE UNIQUE INDEX "clients_client_id_key" ON "clients"("client_id");

