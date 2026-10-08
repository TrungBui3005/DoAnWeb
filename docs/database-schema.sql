-- Tạo Database
CREATE DATABASE IF NOT EXISTS `nutrition_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `nutrition_db`;

-- 1. Bảng NguoiDung (users)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('user', 'admin') DEFAULT 'user',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Bảng HoSoTheTrang (user_profiles)
CREATE TABLE IF NOT EXISTS `user_profiles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `full_name` VARCHAR(100) NOT NULL,
  `age` INT NOT NULL,
  `gender` ENUM('male', 'female') NOT NULL,
  `height_cm` DECIMAL(5,2) NOT NULL,
  `weight_kg` DECIMAL(5,2) NOT NULL,
  `activity_level` ENUM('sedentary', 'lightly_active', 'moderately_active', 'very_active') DEFAULT 'sedentary',
  `bmr` DECIMAL(7,2) DEFAULT 0,
  `tdee` DECIMAL(7,2) DEFAULT 0,
  `goal` ENUM('lose', 'maintain', 'gain') NOT NULL DEFAULT 'maintain',
  `target_calories` DECIMAL(7,2) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Bảng DanhMucThucPham (foods)
CREATE TABLE IF NOT EXISTS `foods` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `calories` DECIMAL(7,2) NOT NULL DEFAULT 0,
  `protein` DECIMAL(6,2) NOT NULL DEFAULT 0,
  `carbs` DECIMAL(6,2) NOT NULL DEFAULT 0,
  `fat` DECIMAL(6,2) NOT NULL DEFAULT 0,
  `serving_unit` VARCHAR(50) DEFAULT '100g',
  `image_url` VARCHAR(255) DEFAULT NULL,
  `is_custom` TINYINT(1) DEFAULT 0,
  `created_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Bảng BuaAn (meals)
CREATE TABLE IF NOT EXISTS `meals` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `meal_type` ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL,
  `meal_date` DATE NOT NULL,
  `total_calories` DECIMAL(7,2) DEFAULT 0,
  `total_protein` DECIMAL(6,2) DEFAULT 0,
  `total_carbs` DECIMAL(6,2) DEFAULT 0,
  `total_fat` DECIMAL(6,2) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Bảng ChiTietBuaAn (meal_details)
CREATE TABLE IF NOT EXISTS `meal_details` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `meal_id` INT NOT NULL,
  `food_name` VARCHAR(150) NOT NULL,
  `amount_gram` DECIMAL(6,2) NOT NULL,
  `calories` DECIMAL(7,2) NOT NULL,
  `protein` DECIMAL(6,2) NOT NULL,
  `carbs` DECIMAL(6,2) NOT NULL,
  `fat` DECIMAL(6,2) NOT NULL,
  `image_url` VARCHAR(255) DEFAULT NULL,
  FOREIGN KEY (`meal_id`) REFERENCES `meals`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Bảng LichSuCanNang (weight_logs)
CREATE TABLE IF NOT EXISTS `weight_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `weight_kg` DECIMAL(5,2) NOT NULL,
  `logged_at` DATE NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Nhật ký hoạt động thể chất (activity_logs)
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `activity_type` VARCHAR(40) NOT NULL,
  `duration_minutes` SMALLINT UNSIGNED NOT NULL,
  `met_value` DECIMAL(4,2) NOT NULL,
  `weight_kg` DECIMAL(5,2) NOT NULL,
  `calories_burned` DECIMAL(7,2) NOT NULL,
  `activity_date` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_activity_user_date` (`user_id`, `activity_date`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Thêm mẫu dữ liệu thực phẩm chuẩn
INSERT INTO `foods` (`name`, `calories`, `protein`, `carbs`, `fat`, `serving_unit`) VALUES
('Cơm trắng', 130.00, 2.70, 28.00, 0.30, '100g'),
('Ức gà luộc', 165.00, 31.00, 0.00, 3.60, '100g'),
('Thịt bò xào', 250.00, 26.00, 0.00, 15.00, '100g'),
('Trứng chiên', 154.00, 11.00, 1.10, 12.00, '100g'),
('Rau muống luộc', 20.00, 3.20, 3.10, 0.20, '100g');