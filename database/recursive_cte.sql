
-- =====================================================
-- SMART MONEY TRACKER
-- RECURSIVE CTE DEMONSTRATION
-- MySQL 8.0.46
-- =====================================================

USE smart_money_tracker;

-- QUERY 1: Generate dates recursively

WITH RECURSIVE date_sequence AS
(
    -- Anchor member: starting date
    SELECT DATE('2026-01-01') AS calendar_date

    UNION ALL

    -- Recursive member: generate next date
    SELECT DATE_ADD(calendar_date, INTERVAL 1 DAY)

    FROM date_sequence

    WHERE calendar_date < '2026-01-15'
)

SELECT
    ds.calendar_date,
    c.ticker,
    d.close_price,
    d.volume

FROM date_sequence ds

JOIN companies c
    ON c.ticker = 'AAPL'

LEFT JOIN daily_prices d
    ON d.company_id = c.company_id
    AND d.price_date = ds.calendar_date

WHERE DAYOFWEEK(ds.calendar_date) NOT IN (1, 7)

ORDER BY ds.calendar_date;


-- QUERY 2: Count generated weekdays

WITH RECURSIVE date_sequence AS
(
    SELECT DATE('2026-01-01') AS calendar_date

    UNION ALL

    SELECT DATE_ADD(calendar_date, INTERVAL 1 DAY)

    FROM date_sequence

    WHERE calendar_date < '2026-01-31'
)

SELECT
    COUNT(*) AS generated_weekdays

FROM date_sequence

WHERE DAYOFWEEK(calendar_date) NOT IN (1, 7);


-- =====================================================
-- END OF RECURSIVE CTE
-- =====================================================
