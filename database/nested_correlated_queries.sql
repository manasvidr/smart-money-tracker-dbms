
USE smart_money_tracker;

-- QUERY 1: NESTED SUBQUERY

SELECT
    c.ticker,
    c.company_name,
    SUM(t.total_value) AS total_insider_value

FROM companies c

JOIN insider_transactions t
    ON c.company_id = t.company_id

GROUP BY c.company_id, c.ticker, c.company_name

HAVING SUM(t.total_value) >
(
    SELECT AVG(company_total)
    FROM
    (
        SELECT SUM(total_value) AS company_total
        FROM insider_transactions
        GROUP BY company_id
    ) AS company_values
);



-- QUERY 2: CORRELATED SUBQUERY

SELECT
    c.ticker,
    i.full_name,
    t.transaction_id,
    t.transaction_code,
    t.total_value

FROM insider_transactions t

JOIN companies c
    ON t.company_id = c.company_id

JOIN transaction_owners o
    ON t.transaction_id = o.transaction_id
    AND t.company_id = o.company_id

JOIN company_insider_roles r
    ON o.role_assignment_id = r.role_assignment_id
    AND o.company_id = r.company_id

JOIN insiders i
    ON r.insider_id = i.insider_id

WHERE t.total_value =
(
    SELECT MAX(t2.total_value)
    FROM insider_transactions t2
    WHERE t2.company_id = t.company_id
)

ORDER BY c.ticker;




-- QUERY 3: EXISTS SUBQUERY

SELECT
    c.ticker,
    c.company_name,
    c.sector

FROM companies c

WHERE EXISTS
(
    SELECT 1
    FROM insider_transactions t

    WHERE t.company_id = c.company_id
    AND t.transaction_code = 'P'
);




-- QUERY 4: CORRELATED AGGREGATE SUBQUERY

SELECT DISTINCT
    i.insider_id,
    i.full_name

FROM insiders i

JOIN company_insider_roles r
    ON i.insider_id = r.insider_id

JOIN transaction_owners o
    ON r.role_assignment_id = o.role_assignment_id

JOIN insider_transactions t
    ON o.transaction_id = t.transaction_id
    AND o.company_id = t.company_id

WHERE t.total_value >
(
    SELECT AVG(t2.total_value)
    FROM insider_transactions t2
    JOIN transaction_owners o2
        ON t2.transaction_id = o2.transaction_id
        AND t2.company_id = o2.company_id
    WHERE o2.role_assignment_id = r.role_assignment_id
)

ORDER BY i.full_name;
