-- Smart Money Tracker prototype analytics
-- QUERY: Forward 30/60/90 trading-session returns after insider purchases
WITH price_lead AS (
    SELECT ticker, price_date, adj_close AS current_price,
           LEAD(adj_close,21) OVER(PARTITION BY ticker ORDER BY price_date) AS price_30d_forward,
           LEAD(adj_close,42) OVER(PARTITION BY ticker ORDER BY price_date) AS price_60d_forward,
           LEAD(adj_close,63) OVER(PARTITION BY ticker ORDER BY price_date) AS price_90d_forward
    FROM daily_prices
)
SELECT it.ticker, c.company_name, it.insider_name, it.transaction_date,
       it.total_transaction_value,
       ROUND(((pl.price_30d_forward-pl.current_price)/pl.current_price)*100,2) AS return_30d_pct,
       ROUND(((pl.price_60d_forward-pl.current_price)/pl.current_price)*100,2) AS return_60d_pct,
       ROUND(((pl.price_90d_forward-pl.current_price)/pl.current_price)*100,2) AS return_90d_pct
FROM insider_transactions it
JOIN price_lead pl ON pl.ticker=it.ticker AND pl.price_date=it.transaction_date
JOIN companies c ON c.ticker=it.ticker
WHERE it.transaction_code='P' AND it.total_transaction_value >= 25000
ORDER BY return_90d_pct DESC;

-- QUERY: Insider purchase clusters — at least three distinct insiders in rolling 30 calendar days
SELECT a.ticker, a.transaction_date AS window_end,
       COUNT(DISTINCT b.insider_name) AS distinct_buyers,
       SUM(b.total_transaction_value) AS cluster_value
FROM insider_transactions a
JOIN insider_transactions b ON b.ticker=a.ticker
 AND b.transaction_code='P'
 AND b.transaction_date BETWEEN date(a.transaction_date,'-30 days') AND a.transaction_date
WHERE a.transaction_code='P'
GROUP BY a.ticker,a.transaction_date
HAVING COUNT(DISTINCT b.insider_name) >= 3
ORDER BY cluster_value DESC;

-- QUERY: 90-session purchase return by executive role
WITH future_prices AS (
 SELECT ticker,price_date,adj_close,
        LEAD(adj_close,63) OVER(PARTITION BY ticker ORDER BY price_date) AS future_close
 FROM daily_prices
)
SELECT it.insider_title,COUNT(*) AS purchase_count,
       ROUND(AVG((fp.future_close-fp.adj_close)/NULLIF(fp.adj_close,0)*100),2) AS avg_90_session_return_pct
FROM insider_transactions it
JOIN future_prices fp ON fp.ticker=it.ticker AND fp.price_date=it.transaction_date
WHERE it.transaction_code='P' AND fp.future_close IS NOT NULL
GROUP BY it.insider_title ORDER BY avg_90_session_return_pct DESC;
