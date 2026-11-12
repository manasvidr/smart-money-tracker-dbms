
USE smart_money_tracker;

-- QUERY 1: ROW_NUMBER()
-- Number transactions separately for each company.

SELECT
    c.ticker,
    t.transaction_id,
    t.transaction_date,
    t.total_value,

    ROW_NUMBER() OVER (
        PARTITION BY c.company_id
        ORDER BY t.transaction_date
    ) AS transaction_number

FROM insider_transactions t

JOIN companies c
ON t.company_id = c.company_id

ORDER BY c.ticker, transaction_number;


-- QUERY 2: RANK()
-- Rank transactions by value within each company.

SELECT
    c.ticker,
    t.transaction_id,
    t.total_value,

    RANK() OVER (
        PARTITION BY c.company_id
        ORDER BY t.total_value DESC
    ) AS transaction_rank

FROM insider_transactions t

JOIN companies c
ON t.company_id = c.company_id

ORDER BY c.ticker, transaction_rank;


-- QUERY 3: DENSE_RANK()
-- Rank insiders based on their total transaction value.

SELECT
    i.full_name,
    SUM(t.total_value) AS total_value,

    DENSE_RANK() OVER (
        ORDER BY SUM(t.total_value) DESC
    ) AS insider_rank

FROM insiders i

JOIN company_insider_roles r
ON i.insider_id = r.insider_id

JOIN transaction_owners o
ON r.role_assignment_id = o.role_assignment_id

JOIN insider_transactions t
ON o.transaction_id = t.transaction_id
AND o.company_id = t.company_id

GROUP BY i.insider_id, i.full_name;


-- QUERY 4: LAG()
-- Compare current closing price with previous trading day.

SELECT
    c.ticker,
    d.price_date,
    d.close_price,

    LAG(d.close_price) OVER (
        PARTITION BY d.company_id
        ORDER BY d.price_date
    ) AS previous_close,

    d.close_price -
    LAG(d.close_price) OVER (
        PARTITION BY d.company_id
        ORDER BY d.price_date
    ) AS price_change

FROM daily_prices d

JOIN companies c
ON d.company_id = c.company_id

WHERE c.ticker = 'AAPL'

ORDER BY d.price_date
LIMIT 15;


-- QUERY 5: LEAD()
-- Retrieve next available trading day's closing price.

SELECT
    c.ticker,
    d.price_date,
    d.close_price,

    LEAD(d.close_price) OVER (
        PARTITION BY d.company_id
        ORDER BY d.price_date
    ) AS next_close

FROM daily_prices d

JOIN companies c
ON d.company_id = c.company_id

WHERE c.ticker = 'AAPL'

ORDER BY d.price_date
LIMIT 15;
