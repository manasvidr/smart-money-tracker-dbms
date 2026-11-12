
-- =====================================================
-- SMART MONEY TRACKER
-- FORWARD STOCK RETURN ANALYSIS
-- =====================================================

USE smart_money_tracker;

WITH transaction_forward_prices AS
(
    SELECT
        t.transaction_id,
        c.ticker,
        t.transaction_date,
        t.transaction_code,
        t.shares_traded,
        t.total_value,

        -- Closing price on or before transaction date
        (
            SELECT d.close_price
            FROM daily_prices d
            WHERE d.company_id = t.company_id
              AND d.price_date <= t.transaction_date
            ORDER BY d.price_date DESC
            LIMIT 1
        ) AS base_close,

        -- First available trading price on or after 30 days
        (
            SELECT d.close_price
            FROM daily_prices d
            WHERE d.company_id = t.company_id
              AND d.price_date >=
                  DATE_ADD(t.transaction_date, INTERVAL 30 DAY)
            ORDER BY d.price_date ASC
            LIMIT 1
        ) AS price_after_30d,

        -- Actual date of the 30-day reference price
        (
            SELECT d.price_date
            FROM daily_prices d
            WHERE d.company_id = t.company_id
              AND d.price_date >=
                  DATE_ADD(t.transaction_date, INTERVAL 30 DAY)
            ORDER BY d.price_date ASC
            LIMIT 1
        ) AS date_after_30d,

        -- First available trading price on or after 90 days
        (
            SELECT d.close_price
            FROM daily_prices d
            WHERE d.company_id = t.company_id
              AND d.price_date >=
                  DATE_ADD(t.transaction_date, INTERVAL 90 DAY)
            ORDER BY d.price_date ASC
            LIMIT 1
        ) AS price_after_90d,

        -- Actual date of the 90-day reference price
        (
            SELECT d.price_date
            FROM daily_prices d
            WHERE d.company_id = t.company_id
              AND d.price_date >=
                  DATE_ADD(t.transaction_date, INTERVAL 90 DAY)
            ORDER BY d.price_date ASC
            LIMIT 1
        ) AS date_after_90d

    FROM insider_transactions t

    JOIN companies c
        ON t.company_id = c.company_id
)

SELECT
    transaction_id,
    ticker,
    transaction_date,
    transaction_code,
    total_value,
    base_close,
    date_after_30d,
    price_after_30d,

    ROUND(
        ((price_after_30d - base_close)
        / NULLIF(base_close, 0)) * 100,
        2
    ) AS forward_return_30d,

    date_after_90d,
    price_after_90d,

    ROUND(
        ((price_after_90d - base_close)
        / NULLIF(base_close, 0)) * 100,
        2
    ) AS forward_return_90d

FROM transaction_forward_prices

ORDER BY ticker, transaction_date;
