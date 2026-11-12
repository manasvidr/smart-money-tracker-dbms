
USE smart_money_tracker;

-- QUERY 1: INNER JOIN

SELECT
    t.transaction_id,
    i.full_name,
    c.ticker,
    r.title,
    t.transaction_date,
    t.transaction_code,
    t.shares_traded,
    t.total_value

FROM insider_transactions t

INNER JOIN transaction_owners o
    ON t.transaction_id = o.transaction_id
    AND t.company_id = o.company_id

INNER JOIN company_insider_roles r
    ON o.role_assignment_id = r.role_assignment_id
    AND o.company_id = r.company_id

INNER JOIN insiders i
    ON r.insider_id = i.insider_id

INNER JOIN companies c
    ON t.company_id = c.company_id

ORDER BY t.transaction_id;



-- QUERY 2: LEFT JOIN

SELECT
    c.ticker,
    c.company_name,
    t.transaction_id,
    t.transaction_code,
    t.shares_traded,
    t.total_value

FROM companies c

LEFT JOIN insider_transactions t
    ON c.company_id = t.company_id

ORDER BY c.ticker, t.transaction_id;



-- QUERY 3: MULTI-TABLE JOIN

SELECT
    i.institution_name,
    c.ticker,
    c.company_name,
    h.report_date,
    h.shares_held,
    h.market_value,
    d.close_price,
    d.volume

FROM institutional_holdings h

INNER JOIN institutions i
    ON h.institution_id = i.institution_id

INNER JOIN companies c
    ON h.company_id = c.company_id

INNER JOIN daily_prices d
    ON h.company_id = d.company_id

WHERE d.price_date = '2026-03-12'

ORDER BY i.institution_name, c.ticker;




-- QUERY 4: COMBINED FINANCIAL ANALYSIS

SELECT
    c.ticker,
    i.full_name,
    r.title,
    t.transaction_code,
    t.shares_traded,
    t.total_value,
    h.shares_held,
    h.market_value

FROM insider_transactions t

INNER JOIN transaction_owners o
    ON t.transaction_id = o.transaction_id
    AND t.company_id = o.company_id

INNER JOIN company_insider_roles r
    ON o.role_assignment_id = r.role_assignment_id
    AND o.company_id = r.company_id

INNER JOIN insiders i
    ON r.insider_id = i.insider_id

INNER JOIN companies c
    ON t.company_id = c.company_id

INNER JOIN institutional_holdings h
    ON c.company_id = h.company_id

ORDER BY c.ticker, t.transaction_id;
