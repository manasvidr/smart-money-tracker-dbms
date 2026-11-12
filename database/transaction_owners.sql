
-- =====================================================
-- SMART MONEY TRACKER
-- TRANSACTION OWNERS INSERTION
-- MySQL 8.0.46
-- =====================================================

USE smart_money_tracker;

INSERT INTO transaction_owners
(
    transaction_id,
    role_assignment_id,
    company_id,
    owner_role,
    nature_of_ownership
)

SELECT
    t.transaction_id,
    r.role_assignment_id,
    c.company_id,
    'REPORTING_OWNER',
    'Direct ownership (synthetic demonstration data)'

FROM
(
    SELECT 'AAPL' AS ticker,
           '2026-01-12' AS transaction_date,
           'Alex Morgan' AS full_name

    UNION ALL
    SELECT 'AAPL', '2026-02-12', 'Daniel Smith'

    UNION ALL
    SELECT 'AAPL', '2026-03-12', 'Alex Morgan'

    UNION ALL
    SELECT 'MSFT', '2026-01-12', 'Robert Wilson'

    UNION ALL
    SELECT 'MSFT', '2026-02-12', 'Emily Johnson'

    UNION ALL
    SELECT 'MSFT', '2026-03-12', 'Robert Wilson'

    UNION ALL
    SELECT 'NVDA', '2026-01-12', 'Michael Brown'

    UNION ALL
    SELECT 'NVDA', '2026-02-12', 'Sarah Davis'

    UNION ALL
    SELECT 'NVDA', '2026-03-12', 'Michael Brown'

    UNION ALL
    SELECT 'AMZN', '2026-01-12', 'James Anderson'

    UNION ALL
    SELECT 'AMZN', '2026-02-12', 'William Thomas'

    UNION ALL
    SELECT 'AMZN', '2026-03-12', 'James Anderson'

    UNION ALL
    SELECT 'TSLA', '2026-01-12', 'Alex Morgan'

    UNION ALL
    SELECT 'TSLA', '2026-02-12', 'Daniel Smith'

    UNION ALL
    SELECT 'TSLA', '2026-03-12', 'Alex Morgan'

) AS x

JOIN companies c
    ON c.ticker = x.ticker

JOIN insiders i
    ON i.full_name = x.full_name

JOIN company_insider_roles r
    ON r.insider_id = i.insider_id
    AND r.company_id = c.company_id

JOIN insider_transactions t
    ON t.company_id = c.company_id
    AND t.transaction_date = x.transaction_date;


-- END OF TRANSACTION OWNERS
