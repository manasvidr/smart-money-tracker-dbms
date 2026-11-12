
-- ============================================================
-- SMART MONEY TRACKER
-- DAILY STOCK PRICE DATA GENERATION
-- MySQL 8.0.46
-- ============================================================

USE smart_money_tracker;

-- Generate weekdays from January 1 to July 31, 2026.
-- Weekends are excluded.

INSERT INTO daily_prices
(
    company_id,
    price_date,
    open_price,
    high_price,
    low_price,
    close_price,
    adj_close,
    volume
)

WITH RECURSIVE calendar AS
(
    SELECT DATE('2026-01-01') AS price_date

    UNION ALL

    SELECT DATE_ADD(price_date, INTERVAL 1 DAY)
    FROM calendar
    WHERE price_date < '2026-07-31'
),

trading_days AS
(
    SELECT price_date,
           DATEDIFF(price_date, '2026-01-01') AS day_number
    FROM calendar
    WHERE DAYOFWEEK(price_date) NOT IN (1, 7)
),

base_prices AS
(
    SELECT
        c.company_id,
        d.price_date,
        d.day_number,

        (
            100 + c.company_id * 50
            + d.day_number * 0.08
            + MOD(c.company_id * 7 + d.day_number * 3, 11) * 0.35
        ) AS open_price

    FROM companies c
    CROSS JOIN trading_days d
),

calculated_prices AS
(
    SELECT
        company_id,
        price_date,
        open_price,

        open_price +
        (MOD(day_number + company_id, 5) - 2) * 0.40
        AS close_price,

        day_number

    FROM base_prices
)

SELECT
    company_id,
    price_date,

    ROUND(open_price, 4),

    ROUND(
        GREATEST(open_price, close_price) + 1.20, 4
    ),

    ROUND(
        LEAST(open_price, close_price) - 1.20, 4
    ),

    ROUND(close_price, 4),

    ROUND(close_price * 0.99, 4),

    1000000 + MOD(day_number * 1237 + company_id * 5000, 9000000)

FROM calculated_prices

ON DUPLICATE KEY UPDATE
    open_price = VALUES(open_price),
    high_price = VALUES(high_price),
    low_price = VALUES(low_price),
    close_price = VALUES(close_price),
    adj_close = VALUES(adj_close),
    volume = VALUES(volume);


-- ============================================================
-- END OF DAILY PRICE DATA GENERATION
-- ============================================================
