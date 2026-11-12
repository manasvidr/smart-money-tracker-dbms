
-- =====================================================
-- SMART MONEY TRACKER
-- STORED PROCEDURE IMPLEMENTATION
-- =====================================================

USE smart_money_tracker;

-- Remove the previous procedure if it exists.

DROP PROCEDURE IF EXISTS sp_calculate_forward_returns;

DELIMITER $$

CREATE PROCEDURE sp_calculate_forward_returns(
    IN p_transaction_id INT
)

BEGIN

    SELECT
        t.transaction_id,
        c.ticker,
        t.transaction_date,
        t.transaction_code,
        t.total_value,

        -- Base closing price
        (
            SELECT d.close_price
            FROM daily_prices d
            WHERE d.company_id = t.company_id
              AND d.price_date <= t.transaction_date
            ORDER BY d.price_date DESC
            LIMIT 1
        ) AS base_close,

        -- 30-day future closing price
        (
            SELECT d.close_price
            FROM daily_prices d
            WHERE d.company_id = t.company_id
              AND d.price_date >=
                  DATE_ADD(t.transaction_date, INTERVAL 30 DAY)
            ORDER BY d.price_date
            LIMIT 1
        ) AS price_after_30d,

        -- 30-day forward return
        (
            SELECT ROUND(
                (
                    (
                        SELECT d.close_price
                        FROM daily_prices d
                        WHERE d.company_id = t.company_id
                          AND d.price_date >=
                              DATE_ADD(t.transaction_date, INTERVAL 30 DAY)
                        ORDER BY d.price_date
                        LIMIT 1
                    )
                    -
                    (
                        SELECT d.close_price
                        FROM daily_prices d
                        WHERE d.company_id = t.company_id
                          AND d.price_date <= t.transaction_date
                        ORDER BY d.price_date DESC
                        LIMIT 1
                    )
                )
                /
                NULLIF(
                    (
                        SELECT d.close_price
                        FROM daily_prices d
                        WHERE d.company_id = t.company_id
                          AND d.price_date <= t.transaction_date
                        ORDER BY d.price_date DESC
                        LIMIT 1
                    ), 0
                ) * 100, 2
            )
        ) AS forward_return_30d,

        -- 90-day future closing price
        (
            SELECT d.close_price
            FROM daily_prices d
            WHERE d.company_id = t.company_id
              AND d.price_date >=
                  DATE_ADD(t.transaction_date, INTERVAL 90 DAY)
            ORDER BY d.price_date
            LIMIT 1
        ) AS price_after_90d,

        -- 90-day forward return
        (
            SELECT ROUND(
                (
                    (
                        SELECT d.close_price
                        FROM daily_prices d
                        WHERE d.company_id = t.company_id
                          AND d.price_date >=
                              DATE_ADD(t.transaction_date, INTERVAL 90 DAY)
                        ORDER BY d.price_date
                        LIMIT 1
                    )
                    -
                    (
                        SELECT d.close_price
                        FROM daily_prices d
                        WHERE d.company_id = t.company_id
                          AND d.price_date <= t.transaction_date
                        ORDER BY d.price_date DESC
                        LIMIT 1
                    )
                )
                /
                NULLIF(
                    (
                        SELECT d.close_price
                        FROM daily_prices d
                        WHERE d.company_id = t.company_id
                          AND d.price_date <= t.transaction_date
                        ORDER BY d.price_date DESC
                        LIMIT 1
                    ), 0
                ) * 100, 2
            )
        ) AS forward_return_90d

    FROM insider_transactions t

    JOIN companies c
        ON t.company_id = c.company_id

    WHERE t.transaction_id = p_transaction_id;

END$$

DELIMITER ;

-- =====================================================
-- END OF STORED PROCEDURE
-- =====================================================
