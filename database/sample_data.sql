
-- =====================================================
-- SMART MONEY TRACKER
-- SAMPLE DATA INSERTION - PHASE 1
-- MySQL 8.0.46
-- =====================================================

USE smart_money_tracker;

-- 1. INSERT USERS

INSERT INTO users
(username, email, password_hash, is_active)
VALUES
('admin_user', 'admin@smartmoney.com', 'DEMO_HASH_ADMIN', TRUE),
('analyst_one', 'analyst1@smartmoney.com', 'DEMO_HASH_1', TRUE),
('analyst_two', 'analyst2@smartmoney.com', 'DEMO_HASH_2', TRUE);


-- 2. INSERT ROLES

INSERT INTO roles
(role_name, description)
VALUES
('ADMIN', 'Full database and application administration'),
('ANALYST', 'Access to financial analytics and market signals');


-- 3. INSERT COMPANIES

INSERT INTO companies
(cik, ticker, company_name, sector, industry)
VALUES
('0000320193', 'AAPL', 'Apple Inc.', 'Technology', 'Consumer Electronics'),
('0000789019', 'MSFT', 'Microsoft Corporation', 'Technology', 'Software'),
('0001045810', 'NVDA', 'NVIDIA Corporation', 'Technology', 'Semiconductors'),
('0001018724', 'AMZN', 'Amazon.com Inc.', 'Consumer Cyclical', 'Internet Retail'),
('0001318605', 'TSLA', 'Tesla Inc.', 'Consumer Cyclical', 'Automobiles');


-- 4. INSERT INSIDERS

INSERT INTO insiders
(full_name, sec_person_cik)
VALUES
('Alex Morgan', NULL),
('Daniel Smith', NULL),
('Robert Wilson', NULL),
('Emily Johnson', NULL),
('Michael Brown', NULL),
('Sarah Davis', NULL),
('James Anderson', NULL),
('William Thomas', NULL);


-- 5. INSERT INSTITUTIONS

INSERT INTO institutions
(cik, institution_name, manager_name)
VALUES
('0000102909', 'The Vanguard Group', 'Vanguard Management'),
('0001364742', 'BlackRock Inc.', 'BlackRock Management'),
('0001067983', 'Berkshire Hathaway Inc.', 'Warren Buffett'),
('0000093751', 'State Street Corporation', 'State Street Management'),
('0000315066', 'FMR LLC', 'Fidelity Management');


-- =====================================================
-- END OF PHASE 1 SAMPLE DATA
-- =====================================================
