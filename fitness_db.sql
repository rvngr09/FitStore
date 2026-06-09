-- ========================================
-- Fitness Store Database Schema
-- ========================================
-- This script creates all tables for the fitness e-commerce application.
-- Execute in MySQL/MariaDB: source fitness_db.sql;
-- ========================================

-- Create database
CREATE DATABASE IF NOT EXISTS fitness_store
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE fitness_store;

-- ---------------------------------------------------------
-- Users
-- ---------------------------------------------------------
CREATE TABLE users (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uuid              VARCHAR(255) NOT NULL UNIQUE,
  name              VARCHAR(255) NOT NULL,
  email             VARCHAR(255) NOT NULL UNIQUE,
  email_verified_at TIMESTAMP NULL DEFAULT NULL,
  password          VARCHAR(255) NOT NULL,
  remember_token    VARCHAR(100) NULL DEFAULT NULL,
  created_at        TIMESTAMP NULL DEFAULT NULL,
  updated_at        TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- Password Reset Tokens
-- ---------------------------------------------------------
CREATE TABLE password_reset_tokens (
  email      VARCHAR(255) NOT NULL,
  token      VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- Personal Access Tokens (Sanctum)
-- ---------------------------------------------------------
CREATE TABLE personal_access_tokens (
  id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tokenable_type VARCHAR(255) NOT NULL,
  tokenable_id   BIGINT UNSIGNED NOT NULL,
  name           VARCHAR(255) NOT NULL,
  token          VARCHAR(64) NOT NULL UNIQUE,
  abilities      TEXT NULL DEFAULT NULL,
  last_used_at   TIMESTAMP NULL DEFAULT NULL,
  expires_at     TIMESTAMP NULL DEFAULT NULL,
  created_at     TIMESTAMP NULL DEFAULT NULL,
  updated_at     TIMESTAMP NULL DEFAULT NULL,
  INDEX personal_access_tokens_tokenable_index (tokenable_type, tokenable_id),
  INDEX personal_access_tokens_expires_at_index (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- Categories
-- ---------------------------------------------------------
CREATE TABLE categories (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  slug        VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NULL DEFAULT NULL,
  image       VARCHAR(255) NULL DEFAULT NULL,
  parent_id   BIGINT UNSIGNED NULL DEFAULT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  created_at  TIMESTAMP NULL DEFAULT NULL,
  updated_at  TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT categories_parent_id_foreign FOREIGN KEY (parent_id) REFERENCES categories (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- Tags
-- ---------------------------------------------------------
CREATE TABLE tags (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  slug       VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- Products
-- ---------------------------------------------------------
CREATE TABLE products (
  id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(255) NOT NULL,
  slug           VARCHAR(255) NOT NULL UNIQUE,
  description    TEXT NULL DEFAULT NULL,
  price          DECIMAL(10, 2) NOT NULL,
  category_id    BIGINT UNSIGNED NOT NULL,
  specifications JSON NULL DEFAULT NULL,
  images         JSON NULL DEFAULT NULL,
  stock          INT NOT NULL DEFAULT 0,
  is_featured    TINYINT(1) NOT NULL DEFAULT 0,
  is_active      TINYINT(1) NOT NULL DEFAULT 1,
  created_at     TIMESTAMP NULL DEFAULT NULL,
  updated_at     TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT products_category_id_foreign FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- Product Tag Pivot
-- ---------------------------------------------------------
CREATE TABLE product_tag (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT UNSIGNED NOT NULL,
  tag_id     BIGINT UNSIGNED NOT NULL,
  UNIQUE KEY product_tag_product_id_tag_id_unique (product_id, tag_id),
  CONSTRAINT product_tag_product_id_foreign FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
  CONSTRAINT product_tag_tag_id_foreign    FOREIGN KEY (tag_id)     REFERENCES tags (id)     ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- Cart Items
-- ---------------------------------------------------------
CREATE TABLE cart_items (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(255) NULL DEFAULT NULL,
  user_id    BIGINT UNSIGNED NULL DEFAULT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  quantity   INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  INDEX cart_items_session_id_index (session_id),
  CONSTRAINT cart_items_user_id_foreign   FOREIGN KEY (user_id)   REFERENCES users (id)   ON DELETE CASCADE,
  CONSTRAINT cart_items_product_id_foreign FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- Orders
-- ---------------------------------------------------------
CREATE TABLE orders (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_number     VARCHAR(255) NOT NULL UNIQUE,
  user_id          BIGINT UNSIGNED NULL DEFAULT NULL,
  customer_name    VARCHAR(255) NOT NULL,
  customer_phone   VARCHAR(255) NOT NULL,
  customer_email   VARCHAR(255) NULL DEFAULT NULL,
  shipping_address TEXT NOT NULL,
  notes            TEXT NULL DEFAULT NULL,
  subtotal         DECIMAL(10, 2) NOT NULL,
  total            DECIMAL(10, 2) NOT NULL,
  status           ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
  created_at       TIMESTAMP NULL DEFAULT NULL,
  updated_at       TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT orders_user_id_foreign FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- Order Items
-- ---------------------------------------------------------
CREATE TABLE order_items (
  id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id       BIGINT UNSIGNED NOT NULL,
  product_id     BIGINT UNSIGNED NULL DEFAULT NULL,
  product_name   VARCHAR(255) NOT NULL,
  product_price  DECIMAL(10, 2) NOT NULL,
  quantity       INT NOT NULL,
  subtotal       DECIMAL(10, 2) NOT NULL,
  created_at     TIMESTAMP NULL DEFAULT NULL,
  updated_at     TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT order_items_order_id_foreign   FOREIGN KEY (order_id)   REFERENCES orders (id)  ON DELETE CASCADE,
  CONSTRAINT order_items_product_id_foreign FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- Permissions (spatie/laravel-permission)
-- ---------------------------------------------------------
CREATE TABLE permissions (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  guard_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  UNIQUE KEY permissions_name_guard_name_unique (name, guard_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- Roles
-- ---------------------------------------------------------
CREATE TABLE roles (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  guard_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  UNIQUE KEY roles_name_guard_name_unique (name, guard_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- Model Has Permissions
-- ---------------------------------------------------------
CREATE TABLE model_has_permissions (
  permission_id BIGINT UNSIGNED NOT NULL,
  model_type    VARCHAR(255) NOT NULL,
  model_id      BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (permission_id, model_id, model_type),
  INDEX model_has_permissions_model_index (model_id, model_type),
  CONSTRAINT model_has_permissions_permission_id_foreign FOREIGN KEY (permission_id) REFERENCES permissions (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- Model Has Roles
-- ---------------------------------------------------------
CREATE TABLE model_has_roles (
  role_id    BIGINT UNSIGNED NOT NULL,
  model_type VARCHAR(255) NOT NULL,
  model_id   BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (role_id, model_id, model_type),
  INDEX model_has_roles_model_index (model_id, model_type),
  CONSTRAINT model_has_roles_role_id_foreign FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- Role Has Permissions
-- ---------------------------------------------------------
CREATE TABLE role_has_permissions (
  permission_id BIGINT UNSIGNED NOT NULL,
  role_id       BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (permission_id, role_id),
  CONSTRAINT role_has_permissions_permission_id_foreign FOREIGN KEY (permission_id) REFERENCES permissions (id) ON DELETE CASCADE,
  CONSTRAINT role_has_permissions_role_id_foreign       FOREIGN KEY (role_id)       REFERENCES roles (id)       ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- Cache
-- ---------------------------------------------------------
CREATE TABLE cache (
  `key`      VARCHAR(255) NOT NULL PRIMARY KEY,
  value      MEDIUMTEXT NOT NULL,
  expiration BIGINT NOT NULL,
  INDEX cache_expiration_index (expiration)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- Cache Locks
-- ---------------------------------------------------------
CREATE TABLE cache_locks (
  `key`       VARCHAR(255) NOT NULL PRIMARY KEY,
  owner       VARCHAR(255) NOT NULL,
  expiration  BIGINT NOT NULL,
  INDEX cache_locks_expiration_index (expiration)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- Jobs
-- ---------------------------------------------------------
CREATE TABLE jobs (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  queue        VARCHAR(255) NOT NULL,
  payload      LONGTEXT NOT NULL,
  attempts     SMALLINT UNSIGNED NOT NULL,
  reserved_at  INT UNSIGNED NULL DEFAULT NULL,
  available_at INT UNSIGNED NOT NULL,
  created_at   INT UNSIGNED NOT NULL,
  INDEX jobs_queue_index (queue)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- Sessions
-- ---------------------------------------------------------
CREATE TABLE sessions (
  id            VARCHAR(255) NOT NULL PRIMARY KEY,
  user_id       BIGINT UNSIGNED NULL DEFAULT NULL,
  ip_address    VARCHAR(45) NULL DEFAULT NULL,
  user_agent    TEXT NULL DEFAULT NULL,
  payload       LONGTEXT NOT NULL,
  last_activity INT NOT NULL,
  INDEX sessions_user_id_index (user_id),
  INDEX sessions_last_activity_index (last_activity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
