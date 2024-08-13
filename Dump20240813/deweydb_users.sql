-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: localhost    Database: deweydb
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'köksal','123'),(2,'admin','123'),(3,'kutluhan','şasldkf'),(4,'asdf','sadf'),(5,'kutluhanunsal','123456'),(6,'admin','123'),(7,'admin','123'),(8,'kutku','123'),(9,'admin1','$2b$10$z4ADVRa5rt2.Nnl4wqKqNup8en7rT.XQCQRP.hlkCPE5fu6AFFiv.'),(10,'kutlu7','$2b$10$ref9BQrOyY6Avhki/wzabuiCRgJ84R6KHAHpXSpFB3yYN8H7ocgXu'),(11,'verinova1','$2b$10$lfcSZ4V1FOqFmcYeQk5.xOkMM4TBnIFPKqJ3GkqsCFCYelqEJuyu.'),(12,'kutlu88','$2b$10$2p4yyk0vDcNqWFVH0gOw8.Ed2WqqiNbPr7nbxMxkQx1PvJP.eLKNW'),(13,'verinova23','$2b$10$R1JUBjWJHk9Vmpv4qsjCme1PhdKjVUHl9JLbJrChpp2UPv.CMbwnC'),(14,'verinova11','$2b$10$uqOZGr.W2UhddtgG4rbD.OFkRkqXizS.7GPvn5FQjqdP3L3qzF2FC'),(15,'aaa','$2b$10$0gGwaRmlocZZzm2XAiXNmen2M5BKkyWvk/i8doPP7lL2gDUvsZCle'),(16,'aaa','$2b$10$TVF44pQ8ZNK4MQi79Xi8wuXp603MuZnRoMRScSSaWbC7AzeCNeg.2'),(17,'aaa','$2b$10$6tQ9KV8Wfik5DIwxsoSvteKhHX3bq7d3oEEbPO7iR6xtdh1cFh6K6'),(18,'aaa','$2b$10$7/wJG.cdTLlVjtw6.zXWRes6dYvSKN4uutXHM0HaHfh0QE2ldXO7K'),(19,'aaa','$2b$10$vN6qiADYKzpSnrallUJjguvagxcV2a8d2UPKNYbVgG/Yp02bzO7qK'),(20,'aaa','$2b$10$9elvM22NU81insiC8mnCfegeqV64BxWIYxEwcr2om7J1/Z4MPYqvS'),(21,'aa','$2b$10$Yu./bEYg3awaY5dBP6zQZ.c8mwqpMKI80BJPoG1qAgRsxGFRAGjGa'),(22,'kutluska','$2b$10$NEonE5O8oVPRAc0/zbwEAuLDaJgHBGri3U6GooRlW1MB/AvRejfgi'),(23,'kkk','$2b$10$NHKJGF0o43mLpm0kiAUsIeffwWdxCz3/k3XirOGAPnP5CRgxAFrZ.');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-08-13  1:36:42
