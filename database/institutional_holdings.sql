
USE smart_money_tracker;

INSERT INTO institutional_holdings
(
    institution_id,
    company_id,
    report_date,
    shares_held,
    market_value,
    percentage_held
)

SELECT
    i.institution_id,
    c.company_id,
    '2026-03-31',
    x.shares_held,
    x.market_value,
    x.percentage_held

FROM
(
    SELECT
        'The Vanguard Group' AS institution_name,
        'AAPL' AS ticker,
        100000 AS shares_held,
        25000000.00 AS market_value,
        0.65 AS percentage_held

    UNION ALL
    SELECT 'The Vanguard Group', 'MSFT',
           120000, 48000000.00, 0.70

    UNION ALL
    SELECT 'The Vanguard Group', 'NVDA',
           90000, 18000000.00, 0.45

    UNION ALL
    SELECT 'The Vanguard Group', 'AMZN',
           110000, 22000000.00, 0.55

    UNION ALL
    SELECT 'The Vanguard Group', 'TSLA',
           50000, 12500000.00, 0.35

    UNION ALL
    SELECT 'BlackRock Inc.', 'AAPL',
           150000, 37500000.00, 0.80

    UNION ALL
    SELECT 'BlackRock Inc.', 'MSFT',
           130000, 52000000.00, 0.75

    UNION ALL
    SELECT 'BlackRock Inc.', 'NVDA',
           100000, 20000000.00, 0.50

    UNION ALL
    SELECT 'BlackRock Inc.', 'AMZN',
           125000, 25000000.00, 0.60

    UNION ALL
    SELECT 'BlackRock Inc.', 'TSLA',
           60000, 15000000.00, 0.40

    UNION ALL
    SELECT 'Berkshire Hathaway Inc.', 'AAPL',
           200000, 50000000.00, 1.00

    UNION ALL
    SELECT 'Berkshire Hathaway Inc.', 'MSFT',
           50000, 20000000.00, 0.30

    UNION ALL
    SELECT 'Berkshire Hathaway Inc.', 'NVDA',
           25000, 5000000.00, 0.15

    UNION ALL
    SELECT 'Berkshire Hathaway Inc.', 'AMZN',
           40000, 8000000.00, 0.20

    UNION ALL
    SELECT 'Berkshire Hathaway Inc.', 'TSLA',
           15000, 3750000.00, 0.10

    UNION ALL
    SELECT 'State Street Corporation', 'AAPL',
           80000, 20000000.00, 0.50

    UNION ALL
    SELECT 'State Street Corporation', 'MSFT',
           90000, 36000000.00, 0.55

    UNION ALL
    SELECT 'State Street Corporation', 'NVDA',
           70000, 14000000.00, 0.35

    UNION ALL
    SELECT 'State Street Corporation', 'AMZN',
           75000, 15000000.00, 0.40

    UNION ALL
    SELECT 'State Street Corporation', 'TSLA',
           30000, 7500000.00, 0.20

    UNION ALL
    SELECT 'FMR LLC', 'AAPL',
           60000, 15000000.00, 0.40

    UNION ALL
    SELECT 'FMR LLC', 'MSFT',
           70000, 28000000.00, 0.45

    UNION ALL
    SELECT 'FMR LLC', 'NVDA',
           85000, 17000000.00, 0.42

    UNION ALL
    SELECT 'FMR LLC', 'AMZN',
           65000, 13000000.00, 0.32

    UNION ALL
    SELECT 'FMR LLC', 'TSLA',
           25000, 6250000.00, 0.15

) AS x

JOIN institutions i
    ON i.institution_name = x.institution_name

JOIN companies c
    ON c.ticker = x.ticker;
