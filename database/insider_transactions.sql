
-- ============================================================
-- SMART MONEY TRACKER
-- INSIDER TRANSACTIONS - SAMPLE DATA
-- MySQL 8.0.46
-- ============================================================

USE smart_money_tracker;

-- Insert 15 illustrative insider transactions.
-- Prices are retrieved from DAILY_PRICES.

INSERT INTO insider_transactions
(
    filing_id,
    company_id,
    transaction_date,
    transaction_code,
    shares_traded,
    price_per_share
)

SELECT
    f.filing_id,
    c.company_id,
    x.transaction_date,
    x.transaction_code,
    x.shares_traded,
    d.close_price

FROM
(
    SELECT
        'AAPL' AS ticker,
        '0000320193-26-000001' AS accession_number,
        '2026-01-12' AS transaction_date,
        'P' AS transaction_code,
        500 AS shares_traded

    UNION ALL
    SELECT 'AAPL', '0000320193-26-000002',
           '2026-02-12', 'S', 200

    UNION ALL
    SELECT 'AAPL', '0000320193-26-000003',
           '2026-03-12', 'P', 750

    UNION ALL
    SELECT 'MSFT', '0000789019-26-000001',
           '2026-01-12', 'P', 400

    UNION ALL
    SELECT 'MSFT', '0000789019-26-000002',
           '2026-02-12', 'S', 150

    UNION ALL
    SELECT 'MSFT', '0000789019-26-000003',
           '2026-03-12', 'P', 600

    UNION ALL
    SELECT 'NVDA', '0001045810-26-000001',
           '2026-01-12', 'P', 800

    UNION ALL
    SELECT 'NVDA', '0001045810-26-000002',
           '2026-02-12', 'P', 1000

    UNION ALL
    SELECT 'NVDA', '0001045810-26-000003',
           '2026-03-12', 'S', 300

    UNION ALL
    SELECT 'AMZN', '0001018724-26-000001',
           '2026-01-12', 'P', 350

    UNION ALL
    SELECT 'AMZN', '0001018724-26-000002',
           '2026-02-12', 'S', 120

    UNION ALL
    SELECT 'AMZN', '0001018724-26-000003',
           '2026-03-12', 'P', 500

    UNION ALL
    SELECT 'TSLA', '0001318605-26-000001',
           '2026-01-12', 'S', 250

    UNION ALL
    SELECT 'TSLA', '0001318605-26-000002',
           '2026-02-12', 'P', 450

    UNION ALL
    SELECT 'TSLA', '0001318605-26-000003',
           '2026-03-12', 'P', 700

) AS x

JOIN companies c
    ON c.ticker = x.ticker

JOIN sec_filings f
    ON f.company_id = c.company_id
    AND f.accession_number = x.accession_number

JOIN daily_prices d
    ON d.company_id = c.company_id
    AND d.price_date = x.transaction_date;


-- ============================================================
-- END OF INSIDER TRANSACTION INSERTION
-- ============================================================
