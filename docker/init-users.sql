-- Script de inicialización de usuarios
-- Este script se ejecuta automáticamente al iniciar MySQL si la base de datos está vacía

-- Crear tabla app_user si no existe
CREATE TABLE IF NOT EXISTS `app_user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(180) NOT NULL,
  `roles` json NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL COMMENT '(DC2Type:datetime_immutable)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_88BDF3E9F85E0677` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar usuarios solo si no existen
-- Contraseña: password123
INSERT IGNORE INTO `app_user` (`username`, `roles`, `password`, `created_at`) 
VALUES ('admin', '["ROLE_ADMIN"]', '$2y$13$msX/vSodMn0FonqMO3SSA.R16xwY0shvl.F8IGaBnoQ450fDAl7da', NOW());

-- Contraseña: editor123
INSERT IGNORE INTO `app_user` (`username`, `roles`, `password`, `created_at`) 
VALUES ('editor', '["ROLE_EDITOR"]', '$2y$13$vdCvY4G1yl4ypvksoiuG5.y3gf1.AWZ1pO1Pk3ojlDalXCqSC515a', NOW());

-- Contraseña: viewer123
INSERT IGNORE INTO `app_user` (`username`, `roles`, `password`, `created_at`) 
VALUES ('viewer', '["ROLE_VIEWER"]', '$2y$13$QJG5tpV/1hfyQ2u8/a1xo.SCoTzeDwb5XGKiJYHNNBJ7WDdhCpnam', NOW());

