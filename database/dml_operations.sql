
-- =====================================================
-- SMART MONEY TRACKER
-- DML OPERATIONS
-- MySQL 8.0.46
-- =====================================================

USE smart_money_tracker;

-- 1. INSERT OPERATION
-- Add a new company to analyst_one's watchlist.

START TRANSACTION;

INSERT INTO user_watchlist
(user_id, company_id, notes)

SELECT
    u.user_id,
    c.company_id,
    'Testing DML insertion operation'

FROM users u
CROSS JOIN companies c

WHERE u.username = 'analyst_one'
AND c.ticker = 'MSFT';


-- 2. SELECT OPERATION
-- Retrieve the newly inserted record.

SELECT
    u.username,
    c.ticker,
    w.notes,
    w.added_at

FROM user_watchlist w

JOIN users u
ON w.user_id = u.user_id

JOIN companies c
ON w.company_id = c.company_id

WHERE u.username = 'analyst_one'
AND c.ticker = 'MSFT';


-- 3. UPDATE OPERATION
-- Modify the watchlist note.

UPDATE user_watchlist w

JOIN users u
ON w.user_id = u.user_id

JOIN companies c
ON w.company_id = c.company_id

SET w.notes = 'Updated DML testing note'

WHERE u.username = 'analyst_one'
AND c.ticker = 'MSFT';


-- Verify UPDATE.

SELECT
    u.username,
    c.ticker,
    w.notes

FROM user_watchlist w

JOIN users u
ON w.user_id = u.user_id

JOIN companies c
ON w.company_id = c.company_id

WHERE u.username = 'analyst_one'
AND c.ticker = 'MSFT';


-- 4. DELETE OPERATION
-- Remove the temporary testing record.

DELETE w

FROM user_watchlist w

JOIN users u
ON w.user_id = u.user_id

JOIN companies c
ON w.company_id = c.company_id

WHERE u.username = 'analyst_one'
AND c.ticker = 'MSFT';


-- Verify deletion.

SELECT COUNT(*) AS remaining_test_records

FROM user_watchlist w

JOIN users u
ON w.user_id = u.user_id

JOIN companies c
ON w.company_id = c.company_id

WHERE u.username = 'analyst_one'
AND c.ticker = 'MSFT';


-- Restore the original database state.
ROLLBACK;

-- =====================================================
-- END OF DML OPERATIONS
-- =====================================================
