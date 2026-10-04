-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: electrical_shop
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cash_transactions`
--

DROP TABLE IF EXISTS `cash_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cash_transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` enum('sale','customer_payment','purchase','supplier_payment','expense','withdrawal','sale_return','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `reference_id` int DEFAULT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transaction_date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cash_transactions`
--

LOCK TABLES `cash_transactions` WRITE;
/*!40000 ALTER TABLE `cash_transactions` DISABLE KEYS */;
INSERT INTO `cash_transactions` VALUES (50,'sale',60.00,30,'دریافت نقدی فروش INV-000001','2026-10-01 18:53:18'),(51,'sale',60.00,31,'دریافت نقدی فروش INV-000031','2026-10-01 18:54:29'),(52,'sale',50.00,32,'دریافت نقدی فروش INV-000032','2026-10-01 19:04:26'),(53,'sale',180.00,33,'دریافت نقدی فروش INV-000033','2026-10-01 19:10:27'),(54,'sale',950.00,34,'دریافت نقدی فروش INV-000034','2026-10-01 19:25:34'),(55,'sale',950.00,35,'دریافت نقدی فروش INV-000035','2026-10-01 19:25:48'),(56,'sale',50.00,36,'دریافت نقدی فروش INV-000036','2026-10-01 19:26:09'),(57,'sale',300.00,37,'دریافت نقدی فروش INV-000037','2026-10-01 19:26:57'),(58,'sale',100.00,38,'دریافت نقدی فروش INV-000038','2026-10-02 10:04:34'),(59,'sale',100.00,39,'دریافت نقدی فروش INV-000039','2026-10-02 10:11:25'),(60,'sale',100.00,40,'دریافت نقدی فروش INV-000040','2026-10-02 10:17:09'),(61,'purchase',60.00,21,'پرداخت نقدی خرید PUR-000001','2026-10-02 11:16:52'),(62,'purchase',27.50,22,'پرداخت نقدی خرید PUR-000022','2026-10-02 11:19:42'),(63,'purchase',30.00,23,'پرداخت نقدی خرید PUR-000023','2026-10-02 11:22:22'),(64,'purchase',100.00,24,'پرداخت نقدی خرید PUR-000024','2026-10-02 11:29:52'),(65,'purchase',10.00,25,'پرداخت نقدی خرید PUR-000025','2026-10-02 11:31:38'),(66,'purchase',525.00,26,'پرداخت نقدی خرید PUR-000026','2026-10-03 09:30:18'),(67,'sale',360.00,41,'دریافت نقدی فروش INV-000041','2026-10-03 09:32:34'),(68,'purchase',1050.00,27,'پرداخت نقدی خرید PUR-000027','2026-10-03 09:53:58'),(69,'sale',1200.00,42,'دریافت نقدی فروش INV-000042','2026-10-03 09:55:24'),(70,'purchase',1378.00,28,'پرداخت نقدی خرید PUR-000028','2026-10-03 10:40:39'),(71,'sale',120.00,43,'دریافت نقدی فروش INV-000043','2026-10-03 11:08:41'),(72,'sale',180.00,44,'دریافت نقدی فروش INV-000044','2026-10-03 12:25:36'),(73,'purchase',2560.00,29,'پرداخت نقدی خرید PUR-000029','2026-10-03 12:27:40'),(74,'purchase',800.00,30,'پرداخت نقدی خرید PUR-000030','2026-10-03 16:45:47'),(75,'purchase',225.00,31,'پرداخت نقدی خرید PUR-000031','2026-10-03 16:54:16'),(76,'withdrawal',250.00,1,'برداشت کارمند:\n                     فرهاد\n                     قانت','2026-10-03 17:44:23'),(77,'withdrawal',860.00,2,'برداشت کارمند:\n                     فرهاد\n                     قانت','2026-10-03 17:44:37'),(78,'withdrawal',1000.00,5,'پرداخت معاش:\n                     شبیب\n                     حبیبی','2026-10-03 18:43:53'),(79,'withdrawal',250.00,8,'برداشت کارمند:\n                     وحید جبار\n                     بارک','2026-10-04 09:16:06'),(80,'withdrawal',4750.00,9,'پرداخت معاش:\n                     وحید جبار\n                     بارک','2026-10-04 09:16:49'),(81,'withdrawal',100.00,11,'برداشت کارمند:\n                     شهرام\n                     علی','2026-10-04 09:33:56'),(82,'withdrawal',400.00,12,'پرداخت معاش:\n                     شهرام\n                     علی','2026-10-04 09:34:08'),(83,'expense',260.00,2,'هزینه: نان چاشت','2026-10-04 11:11:00'),(84,'sale_return',240.00,19,'بازپرداخت برگشت فروش INV-000041','2026-10-04 12:22:24');
/*!40000 ALTER TABLE `cash_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (9,'شربت',NULL,'2026-10-01 12:28:07'),(10,'Tab',NULL,'2026-10-03 04:55:46');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_payments`
--

DROP TABLE IF EXISTS `customer_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `payment_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `payment_method` enum('cash','card','transfer') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'cash',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `customer_payments_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_payments`
--

LOCK TABLES `customer_payments` WRITE;
/*!40000 ALTER TABLE `customer_payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `customer_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_transactions`
--

DROP TABLE IF EXISTS `customer_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `type` enum('debit','credit') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `customer_transactions_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_transactions`
--

LOCK TABLES `customer_transactions` WRITE;
/*!40000 ALTER TABLE `customer_transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `customer_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `opening_balance` decimal(15,2) NOT NULL DEFAULT '0.00',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` tinyint NOT NULL DEFAULT '1',
  `opening_balance_type` enum('debit','credit') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'debit',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_transactions`
--

DROP TABLE IF EXISTS `employee_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `type` enum('debit','credit') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_id` int DEFAULT NULL,
  `transaction_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `salary_month` varchar(7) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_employee_salary_month` (`employee_id`,`salary_month`),
  KEY `idx_employee_transactions_employee_id` (`employee_id`),
  KEY `idx_employee_transactions_date` (`transaction_date`),
  CONSTRAINT `fk_employee_transactions_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_transactions`
--

LOCK TABLES `employee_transactions` WRITE;
/*!40000 ALTER TABLE `employee_transactions` DISABLE KEYS */;
INSERT INTO `employee_transactions` VALUES (1,2,'debit',250.00,'نقدی','withdrawal',NULL,'2026-10-03 17:44:23','2026-10-03 17:44:23',NULL),(2,2,'debit',860.00,'نقدی','withdrawal',NULL,'2026-10-03 17:44:37','2026-10-03 17:44:37',NULL),(3,2,'credit',150000.00,'معاش ماه جوزا','salary',NULL,'2026-10-03 17:44:51','2026-10-03 17:44:51',NULL),(5,1,'debit',1000.00,'پرداخت معاش','salary_payment',NULL,'2026-10-03 18:43:53','2026-10-03 18:43:53',NULL),(6,2,'credit',150000.00,'معاش ماهانه','salary',NULL,'2026-10-03 19:02:40','2026-10-03 19:02:40','1405/10'),(7,3,'credit',5000.00,'معاش ماهانه','salary',NULL,'2026-10-04 09:15:03','2026-10-04 09:15:03','1405/07'),(8,3,'debit',250.00,'نقدی','withdrawal',NULL,'2026-10-04 09:16:06','2026-10-04 09:16:06',NULL),(9,3,'debit',4750.00,'پرداخت معاش','salary_payment',NULL,'2026-10-04 09:16:49','2026-10-04 09:16:49',NULL),(10,4,'credit',500.00,'معاش ماهانه','salary',NULL,'2026-10-04 09:33:29','2026-10-04 09:33:29','1405/07'),(11,4,'debit',100.00,'نقدی','withdrawal',NULL,'2026-10-04 09:33:56','2026-10-04 09:33:56',NULL),(12,4,'debit',400.00,'پرداخت معاش','salary_payment',NULL,'2026-10-04 09:34:08','2026-10-04 09:34:08',NULL);
/*!40000 ALTER TABLE `employee_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `salary` decimal(15,2) NOT NULL DEFAULT '0.00',
  `work_time` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES (1,'شبیب','حبیبی','0729013796','ناحیه چهارم',10000.00,'8 صبح تا 8 شام',1,'2026-10-03 17:37:48','2026-10-03 17:38:12'),(2,'فرهاد','قانت','07900000052',NULL,150000.00,NULL,1,'2026-10-03 17:39:21','2026-10-03 17:39:21'),(3,'وحید جبار','بارک','07985622',NULL,5000.00,'8 - 6',1,'2026-10-04 09:14:40','2026-10-04 09:14:40'),(4,'شهرام','علی',NULL,NULL,100000.00,NULL,1,'2026-10-04 09:33:13','2026-10-04 09:34:49');
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expenses`
--

DROP TABLE IF EXISTS `expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expenses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `expense_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expenses`
--

LOCK TABLES `expenses` WRITE;
/*!40000 ALTER TABLE `expenses` DISABLE KEYS */;
INSERT INTO `expenses` VALUES (2,'نان چاشت',260.00,'2026-10-04 11:11:00',NULL);
/*!40000 ALTER TABLE `expenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicine_batches`
--

DROP TABLE IF EXISTS `medicine_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicine_batches` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `batch_number` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiry_date` date NOT NULL,
  `quantity` decimal(15,3) NOT NULL DEFAULT '0.000',
  `purchase_price` decimal(15,2) NOT NULL DEFAULT '0.00',
  `sale_price` decimal(15,2) NOT NULL DEFAULT '0.00',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_medicine_batch_product` (`product_id`),
  CONSTRAINT `fk_medicine_batch_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicine_batches`
--

LOCK TABLES `medicine_batches` WRITE;
/*!40000 ALTER TABLE `medicine_batches` DISABLE KEYS */;
INSERT INTO `medicine_batches` VALUES (6,28,'1','2026-10-21',0.000,10.00,20.00,1,'2026-10-02 05:41:06'),(7,29,'TEST-002','2027-10-21',4.000,105.00,120.00,1,'2026-10-03 05:00:18'),(8,29,'تست سه','2026-11-07',0.000,105.00,120.00,1,'2026-10-03 05:23:58'),(9,29,'برای برگشت','2026-10-23',0.000,106.00,120.00,1,'2026-10-03 06:10:39'),(10,30,'OPENING-000030','2027-04-24',25.000,160.00,180.00,1,'2026-10-03 07:54:57'),(11,30,'1','2030-01-07',16.000,160.00,180.00,1,'2026-10-03 07:57:40'),(12,30,'2555','2026-10-13',5.000,160.00,180.00,1,'2026-10-03 12:15:47'),(13,29,'2','2026-10-28',1.000,105.00,120.00,1,'2026-10-03 12:24:16'),(14,27,'2','2026-10-28',1.000,110.00,120.00,1,'2026-10-03 12:24:16'),(15,28,'2','2026-10-28',1.000,10.00,20.00,1,'2026-10-03 12:24:16');
/*!40000 ALTER TABLE `medicine_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` int DEFAULT NULL,
  `unit` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'عدد',
  `purchase_price` decimal(15,2) NOT NULL DEFAULT '0.00',
  `sale_price` decimal(15,2) NOT NULL DEFAULT '0.00',
  `stock` decimal(15,3) NOT NULL DEFAULT '0.000',
  `min_stock` decimal(15,3) NOT NULL DEFAULT '0.000',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (27,'12312','پرستامول',9,'عدد',110.00,120.00,12.000,20.000,NULL,1,'2026-10-01 12:28:21','2026-10-03 12:24:16'),(28,'812121','فرهاد',9,'عدد',10.00,20.00,21.000,5.000,NULL,1,'2026-10-01 14:54:04','2026-10-03 12:24:16'),(29,'125','CLOMOPHIN',10,'عدد',105.00,120.00,5.000,0.000,NULL,1,'2026-10-03 04:57:47','2026-10-04 07:52:24'),(30,'00025','میم',10,'پاکت',160.00,180.00,46.000,10.000,NULL,1,'2026-10-03 07:54:57','2026-10-04 07:45:32');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_items`
--

DROP TABLE IF EXISTS `purchase_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `purchase_id` int NOT NULL,
  `product_id` int NOT NULL,
  `batch_id` int DEFAULT NULL,
  `quantity` decimal(15,3) NOT NULL,
  `purchase_price` decimal(15,2) NOT NULL,
  `total_price` decimal(15,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `purchase_id` (`purchase_id`),
  KEY `product_id` (`product_id`),
  KEY `idx_purchase_items_batch_id` (`batch_id`),
  CONSTRAINT `fk_purchase_items_batch` FOREIGN KEY (`batch_id`) REFERENCES `medicine_batches` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `purchase_items_ibfk_1` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `purchase_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_items`
--

LOCK TABLES `purchase_items` WRITE;
/*!40000 ALTER TABLE `purchase_items` DISABLE KEYS */;
INSERT INTO `purchase_items` VALUES (42,21,28,NULL,6.000,10.00,60.00),(43,22,27,NULL,11.000,2.50,27.50),(44,23,28,NULL,3.000,10.00,30.00),(45,24,28,NULL,10.000,10.00,100.00),(46,25,28,NULL,1.000,10.00,10.00),(47,26,29,7,5.000,105.00,525.00),(48,27,29,8,10.000,105.00,1050.00),(49,28,29,9,13.000,106.00,1378.00),(50,29,30,11,16.000,160.00,2560.00),(51,30,30,12,5.000,160.00,800.00),(52,31,29,13,1.000,105.00,105.00),(53,31,27,14,1.000,110.00,110.00),(54,31,28,15,1.000,10.00,10.00);
/*!40000 ALTER TABLE `purchase_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_return_items`
--

DROP TABLE IF EXISTS `purchase_return_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_return_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `return_id` int NOT NULL,
  `purchase_item_id` int NOT NULL,
  `product_id` int NOT NULL,
  `batch_id` int DEFAULT NULL,
  `quantity` decimal(15,3) NOT NULL,
  `purchase_price` decimal(15,2) NOT NULL,
  `total_price` decimal(15,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_return_id` (`return_id`),
  KEY `idx_purchase_item_id` (`purchase_item_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_purchase_return_items_batch_id` (`batch_id`),
  CONSTRAINT `fk_purchase_return_items_batch` FOREIGN KEY (`batch_id`) REFERENCES `medicine_batches` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_return_items`
--

LOCK TABLES `purchase_return_items` WRITE;
/*!40000 ALTER TABLE `purchase_return_items` DISABLE KEYS */;
INSERT INTO `purchase_return_items` VALUES (10,10,49,29,9,10.000,106.00,1060.00),(11,11,49,29,9,3.000,106.00,318.00);
/*!40000 ALTER TABLE `purchase_return_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_returns`
--

DROP TABLE IF EXISTS `purchase_returns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_returns` (
  `id` int NOT NULL AUTO_INCREMENT,
  `purchase_id` int NOT NULL,
  `supplier_id` int DEFAULT NULL,
  `total_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `return_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_purchase_id` (`purchase_id`),
  KEY `idx_supplier_id` (`supplier_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_returns`
--

LOCK TABLES `purchase_returns` WRITE;
/*!40000 ALTER TABLE `purchase_returns` DISABLE KEYS */;
INSERT INTO `purchase_returns` VALUES (10,28,7,1060.00,NULL,'2026-10-03 10:41:28'),(11,28,7,318.00,NULL,'2026-10-03 10:43:43');
/*!40000 ALTER TABLE `purchase_returns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchases`
--

DROP TABLE IF EXISTS `purchases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchases` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invoice_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `supplier_id` int DEFAULT NULL,
  `total_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `paid_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `remaining_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `purchase_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoice_number` (`invoice_number`),
  KEY `supplier_id` (`supplier_id`),
  CONSTRAINT `purchases_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchases`
--

LOCK TABLES `purchases` WRITE;
/*!40000 ALTER TABLE `purchases` DISABLE KEYS */;
INSERT INTO `purchases` VALUES (21,'PUR-000001',NULL,60.00,60.00,0.00,'2026-10-02 11:16:52',NULL),(22,'PUR-000022',7,27.50,27.50,0.00,'2026-10-02 11:19:42',NULL),(23,'PUR-000023',6,30.00,30.00,0.00,'2026-10-02 11:22:22',NULL),(24,'PUR-000024',7,100.00,100.00,0.00,'2026-10-02 11:29:52',NULL),(25,'PUR-000025',7,10.00,10.00,0.00,'2026-10-02 11:31:38',NULL),(26,'PUR-000026',7,525.00,525.00,0.00,'2026-10-03 09:30:18',NULL),(27,'PUR-000027',7,1050.00,1050.00,0.00,'2026-10-03 09:53:58',NULL),(28,'PUR-000028',7,1378.00,1378.00,0.00,'2026-10-03 10:40:39',NULL),(29,'PUR-000029',7,2560.00,2560.00,0.00,'2026-10-03 12:27:40',NULL),(30,'PUR-000030',7,800.00,800.00,0.00,'2026-10-03 16:45:47',NULL),(31,'PUR-000031',7,225.00,225.00,0.00,'2026-10-03 16:54:16',NULL);
/*!40000 ALTER TABLE `purchases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sale_items`
--

DROP TABLE IF EXISTS `sale_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sale_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sale_id` int NOT NULL,
  `product_id` int NOT NULL,
  `batch_id` int DEFAULT NULL,
  `quantity` decimal(15,3) NOT NULL,
  `sale_price` decimal(15,2) NOT NULL,
  `purchase_price` decimal(15,2) NOT NULL,
  `total_price` decimal(15,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sale_id` (`sale_id`),
  KEY `product_id` (`product_id`),
  KEY `idx_sale_items_batch_id` (`batch_id`),
  CONSTRAINT `fk_sale_items_batch` FOREIGN KEY (`batch_id`) REFERENCES `medicine_batches` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `sale_items_ibfk_1` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `sale_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sale_items`
--

LOCK TABLES `sale_items` WRITE;
/*!40000 ALTER TABLE `sale_items` DISABLE KEYS */;
INSERT INTO `sale_items` VALUES (61,40,28,6,5.000,20.00,10.00,100.00),(62,41,29,7,3.000,120.00,105.00,360.00),(63,42,29,8,10.000,120.00,105.00,1200.00),(64,43,29,7,1.000,120.00,105.00,120.00),(65,44,30,10,1.000,180.00,160.00,180.00);
/*!40000 ALTER TABLE `sale_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sale_return_items`
--

DROP TABLE IF EXISTS `sale_return_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sale_return_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `return_id` int NOT NULL,
  `sale_item_id` int NOT NULL,
  `product_id` int NOT NULL,
  `batch_id` int DEFAULT NULL,
  `quantity` decimal(15,3) NOT NULL,
  `sale_price` decimal(15,2) NOT NULL,
  `purchase_price` decimal(15,2) NOT NULL,
  `total_price` decimal(15,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_return_id` (`return_id`),
  KEY `idx_sale_item_id` (`sale_item_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_sale_return_items_batch_id` (`batch_id`),
  CONSTRAINT `fk_sale_return_items_batch` FOREIGN KEY (`batch_id`) REFERENCES `medicine_batches` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sale_return_items`
--

LOCK TABLES `sale_return_items` WRITE;
/*!40000 ALTER TABLE `sale_return_items` DISABLE KEYS */;
INSERT INTO `sale_return_items` VALUES (17,17,64,29,7,1.000,120.00,105.00,120.00),(18,18,65,30,10,1.000,180.00,160.00,180.00),(19,19,62,29,7,2.000,120.00,105.00,240.00);
/*!40000 ALTER TABLE `sale_return_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sale_returns`
--

DROP TABLE IF EXISTS `sale_returns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sale_returns` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sale_id` int NOT NULL,
  `customer_id` int DEFAULT NULL,
  `total_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `refund_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `return_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sale_id` (`sale_id`),
  KEY `idx_customer_id` (`customer_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sale_returns`
--

LOCK TABLES `sale_returns` WRITE;
/*!40000 ALTER TABLE `sale_returns` DISABLE KEYS */;
INSERT INTO `sale_returns` VALUES (17,43,NULL,120.00,0.00,NULL,'2026-10-03 11:10:16'),(18,44,NULL,180.00,0.00,NULL,'2026-10-04 12:15:32'),(19,41,NULL,240.00,240.00,NULL,'2026-10-04 12:22:24');
/*!40000 ALTER TABLE `sale_returns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales`
--

DROP TABLE IF EXISTS `sales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invoice_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_id` int DEFAULT NULL,
  `total_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `discount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `paid_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `remaining_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `sale_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoice_number` (`invoice_number`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `sales_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales`
--

LOCK TABLES `sales` WRITE;
/*!40000 ALTER TABLE `sales` DISABLE KEYS */;
INSERT INTO `sales` VALUES (30,'INV-000001',NULL,60.00,0.00,60.00,0.00,'2026-10-01 18:53:18',NULL),(31,'INV-000031',NULL,60.00,0.00,60.00,0.00,'2026-10-01 18:54:29',NULL),(32,'INV-000032',NULL,50.00,0.00,50.00,0.00,'2026-10-01 19:04:26',NULL),(33,'INV-000033',NULL,180.00,0.00,180.00,0.00,'2026-10-01 19:10:27',NULL),(34,'INV-000034',NULL,950.00,0.00,950.00,0.00,'2026-10-01 19:25:34',NULL),(35,'INV-000035',NULL,950.00,0.00,950.00,0.00,'2026-10-01 19:25:48',NULL),(36,'INV-000036',NULL,50.00,0.00,50.00,0.00,'2026-10-01 19:26:09',NULL),(37,'INV-000037',NULL,300.00,0.00,300.00,0.00,'2026-10-01 19:26:57',NULL),(38,'INV-000038',NULL,100.00,0.00,100.00,0.00,'2026-10-02 10:04:34',NULL),(39,'INV-000039',NULL,100.00,0.00,100.00,0.00,'2026-10-02 10:11:25',NULL),(40,'INV-000040',NULL,100.00,0.00,100.00,0.00,'2026-10-02 10:17:09',NULL),(41,'INV-000041',NULL,360.00,0.00,360.00,0.00,'2026-10-03 09:32:34',NULL),(42,'INV-000042',NULL,1200.00,0.00,1200.00,0.00,'2026-10-03 09:55:24',NULL),(43,'INV-000043',NULL,120.00,0.00,120.00,0.00,'2026-10-03 11:08:41',NULL),(44,'INV-000044',NULL,180.00,0.00,180.00,0.00,'2026-10-03 12:25:36',NULL);
/*!40000 ALTER TABLE `sales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `shop_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `currency` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'AFN',
  `invoice_footer` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `font_family` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Tahoma',
  `font_size` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '16px',
  `primary_color` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '#2563eb',
  `secondary_color` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '#1e293b',
  `button_color` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '#2563eb',
  `theme` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'light',
  `logo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `show_logo` tinyint(1) DEFAULT '1',
  `shop_description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `show_shop_name` tinyint(1) DEFAULT '1',
  `show_shop_contact` tinyint(1) DEFAULT '1',
  `print_copies` int DEFAULT '1',
  `decimal_places` int DEFAULT '0',
  `amount_format` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'comma',
  `table_style` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'normal',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_movements`
--

DROP TABLE IF EXISTS `stock_movements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_movements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `type` enum('purchase','sale','return_purchase','return_sale','adjustment') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` decimal(15,3) NOT NULL,
  `reference_id` int DEFAULT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `movement_date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `stock_movements_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=141 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_movements`
--

LOCK TABLES `stock_movements` WRITE;
/*!40000 ALTER TABLE `stock_movements` DISABLE KEYS */;
INSERT INTO `stock_movements` VALUES (108,27,'sale',6.000,30,'فروش در فاکتور INV-000001','2026-10-01 18:53:18'),(109,27,'sale',6.000,31,'فروش در فاکتور INV-000031','2026-10-01 18:54:29'),(110,27,'sale',25.000,32,'فروش در فاکتور INV-000032','2026-10-01 19:04:26'),(111,27,'sale',15.000,33,'فروش در فاکتور INV-000033','2026-10-01 19:10:27'),(112,28,'sale',50.000,34,'فروش در فاکتور INV-000034','2026-10-01 19:25:34'),(113,28,'sale',50.000,35,'فروش در فاکتور INV-000035','2026-10-01 19:25:48'),(114,27,'sale',25.000,36,'فروش در فاکتور INV-000036','2026-10-01 19:26:09'),(115,28,'sale',15.000,37,'فروش در فاکتور INV-000037','2026-10-01 19:26:57'),(116,28,'sale',5.000,38,'فروش در فاکتور INV-000038','2026-10-02 10:04:34'),(117,28,'sale',5.000,39,'فروش در فاکتور INV-000039','2026-10-02 10:11:25'),(118,28,'sale',5.000,40,'فروش در فاکتور INV-000040','2026-10-02 10:17:09'),(119,28,'purchase',6.000,21,'خرید در فاکتور PUR-000001','2026-10-02 11:16:52'),(120,27,'purchase',11.000,22,'خرید در فاکتور PUR-000022','2026-10-02 11:19:42'),(121,28,'purchase',3.000,23,'خرید در فاکتور PUR-000023','2026-10-02 11:22:22'),(122,28,'purchase',10.000,24,'خرید در فاکتور PUR-000024','2026-10-02 11:29:52'),(123,28,'purchase',1.000,25,'خرید در فاکتور PUR-000025','2026-10-02 11:31:38'),(124,29,'purchase',5.000,26,'خرید در فاکتور PUR-000026','2026-10-03 09:30:18'),(125,29,'sale',3.000,41,'فروش در فاکتور INV-000041','2026-10-03 09:32:34'),(126,29,'purchase',10.000,27,'خرید در فاکتور PUR-000027','2026-10-03 09:53:58'),(127,29,'sale',10.000,42,'فروش در فاکتور INV-000042','2026-10-03 09:55:24'),(128,29,'purchase',13.000,28,'خرید در فاکتور PUR-000028','2026-10-03 10:40:39'),(129,29,'return_purchase',10.000,10,'برگشت خرید PUR-000028','2026-10-03 10:41:28'),(130,29,'return_purchase',3.000,11,'برگشت خرید PUR-000028','2026-10-03 10:43:43'),(131,29,'sale',1.000,43,'فروش در فاکتور INV-000043','2026-10-03 11:08:41'),(132,29,'return_sale',1.000,17,'برگشت فروش INV-000043','2026-10-03 11:10:16'),(133,30,'sale',1.000,44,'فروش در فاکتور INV-000044','2026-10-03 12:25:36'),(134,30,'purchase',16.000,29,'خرید در فاکتور PUR-000029','2026-10-03 12:27:40'),(135,30,'purchase',5.000,30,'خرید در فاکتور PUR-000030','2026-10-03 16:45:47'),(136,29,'purchase',1.000,31,'خرید در فاکتور PUR-000031','2026-10-03 16:54:16'),(137,27,'purchase',1.000,31,'خرید در فاکتور PUR-000031','2026-10-03 16:54:16'),(138,28,'purchase',1.000,31,'خرید در فاکتور PUR-000031','2026-10-03 16:54:16'),(139,30,'return_sale',1.000,18,'برگشت فروش INV-000044','2026-10-04 12:15:32'),(140,29,'return_sale',2.000,19,'برگشت فروش INV-000041','2026-10-04 12:22:24');
/*!40000 ALTER TABLE `stock_movements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supplier_payments`
--

DROP TABLE IF EXISTS `supplier_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier_payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `supplier_id` int NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `payment_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `payment_method` enum('cash','card','transfer') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'cash',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `supplier_id` (`supplier_id`),
  CONSTRAINT `supplier_payments_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supplier_payments`
--

LOCK TABLES `supplier_payments` WRITE;
/*!40000 ALTER TABLE `supplier_payments` DISABLE KEYS */;
INSERT INTO `supplier_payments` VALUES (21,7,27.50,'2026-10-02 11:19:42','cash','پرداخت خرید PUR-000022'),(22,6,30.00,'2026-10-02 11:22:22','cash','پرداخت خرید PUR-000023'),(23,7,100.00,'2026-10-02 11:29:52','cash','پرداخت خرید PUR-000024'),(24,7,10.00,'2026-10-02 11:31:38','cash','پرداخت خرید PUR-000025'),(25,7,525.00,'2026-10-03 09:30:18','cash','پرداخت خرید PUR-000026'),(26,7,1050.00,'2026-10-03 09:53:58','cash','پرداخت خرید PUR-000027'),(27,7,1378.00,'2026-10-03 10:40:39','cash','پرداخت خرید PUR-000028'),(28,7,1060.00,'2026-10-03 10:41:28','cash','برگشت کالا از خرید PUR-000028'),(29,7,318.00,'2026-10-03 10:43:43','cash','برگشت کالا از خرید PUR-000028'),(30,7,2560.00,'2026-10-03 12:27:40','cash','پرداخت خرید PUR-000029'),(31,7,800.00,'2026-10-03 16:45:47','cash','پرداخت خرید PUR-000030'),(32,7,225.00,'2026-10-03 16:54:16','cash','پرداخت خرید PUR-000031');
/*!40000 ALTER TABLE `supplier_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `opening_balance` decimal(15,2) NOT NULL DEFAULT '0.00',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES (6,'محمد شبیب قانت',NULL,'هرات',0.00,NULL,'2026-08-26 08:02:25'),(7,'محمد شبیب قانت - فاکتور دوم',NULL,'هرات',0.00,NULL,'2026-08-26 08:26:25');
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','seller','accountant') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'seller',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (3,'مدیر سیستم','admin','$2b$10$UgSJOGJFEo.vzlmjAY3muuH8YYeUwB50eoSTmgojvYWU4mYc6um8O','admin',1,'2026-10-01 12:09:52');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'electrical_shop'
--

--
-- Dumping routines for database 'electrical_shop'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-04 12:25:51
