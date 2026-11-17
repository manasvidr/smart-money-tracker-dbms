USE smart_money_tracker;

SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;
SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '5d7a78d4-dedb-11f1-88db-9d6628977dae:1-56';
INSERT INTO `company_insider_roles` (`role_assignment_id`, `insider_id`, `company_id`, `title`, `is_officer`, `is_board_director`, `start_date`, `end_date`) VALUES (1,1,1,'CEO',1,1,'2020-01-01',NULL),(2,2,1,'CFO',1,0,'2020-01-01',NULL),(3,3,2,'CEO',1,1,'2020-01-01',NULL),(4,4,2,'CFO',1,0,'2020-01-01',NULL),(5,5,3,'CEO',1,1,'2020-01-01',NULL),(6,6,3,'CFO',1,0,'2020-01-01',NULL),(7,7,4,'CEO',1,1,'2020-01-01',NULL),(8,8,4,'CFO',1,0,'2020-01-01',NULL),(9,1,5,'Director',0,1,'2020-01-01',NULL),(10,2,5,'Director',0,1,'2020-01-01',NULL);
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
