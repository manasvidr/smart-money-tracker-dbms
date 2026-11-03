import streamlit as st
import pandas as pd
from sqlalchemy import text
from db.connection import engine

st.set_page_config(page_title="Smart Money Tracker", layout="wide")
st.title("Smart Money Tracker")
st.caption("Prototype dashboard — demo/sample data may be synthetic.")

def load_df(query: str) -> pd.DataFrame:
    with engine.connect() as conn:
        return pd.read_sql_query(text(query), conn)

tabs = st.tabs(["Forward Returns", "Insider Clusters", "Role Performance", "SEC Filings"])
with tabs[0]:
    st.subheader("Insider purchase forward returns")
    try:
        df = load_df("""
            WITH price_lead AS (
              SELECT ticker, price_date, adj_close AS current_price,
                LEAD(adj_close,21) OVER(PARTITION BY ticker ORDER BY price_date) AS p30,
                LEAD(adj_close,42) OVER(PARTITION BY ticker ORDER BY price_date) AS p60,
                LEAD(adj_close,63) OVER(PARTITION BY ticker ORDER BY price_date) AS p90
              FROM daily_prices
            )
            SELECT it.ticker,it.insider_name,it.transaction_date,it.total_transaction_value,
              ROUND((pl.p30-pl.current_price)/pl.current_price*100,2) AS return_30d_pct,
              ROUND((pl.p60-pl.current_price)/pl.current_price*100,2) AS return_60d_pct,
              ROUND((pl.p90-pl.current_price)/pl.current_price*100,2) AS return_90d_pct
            FROM insider_transactions it JOIN price_lead pl
              ON pl.ticker=it.ticker AND pl.price_date=it.transaction_date
            WHERE it.transaction_code='P'
            ORDER BY return_90d_pct DESC
        """)
        st.dataframe(df, use_container_width=True)
    except Exception as exc:
        st.error(f"Could not load forward returns: {exc}")
with tabs[1]:
    st.subheader("Insider purchase clusters")
    try:
        df = load_df("""
          SELECT ticker, transaction_date, COUNT(DISTINCT insider_name) AS buyer_count,
                 SUM(total_transaction_value) AS cluster_value
          FROM insider_transactions
          WHERE transaction_code='P'
          GROUP BY ticker, transaction_date
          HAVING COUNT(DISTINCT insider_name) >= 3
          ORDER BY cluster_value DESC
        """)
        st.dataframe(df, use_container_width=True)
    except Exception as exc:
        st.error(f"Could not load clusters: {exc}")
with tabs[2]:
    st.subheader("Signal performance by executive role")
    try:
        df = load_df("""
          SELECT insider_title, COUNT(*) AS purchase_count,
                 ROUND(AVG(total_transaction_value),2) AS avg_transaction_value
          FROM insider_transactions
          WHERE transaction_code='P'
          GROUP BY insider_title ORDER BY purchase_count DESC
        """)
        st.dataframe(df, use_container_width=True)
    except Exception as exc:
        st.error(f"Could not load role performance: {exc}")
with tabs[3]:
    st.subheader("Stored SEC filing documents")
    try:
        df = load_df("SELECT accession_number,ticker,filing_date,LENGTH(raw_document_xml) AS xml_characters FROM sec_filings ORDER BY filing_date DESC")
        st.dataframe(df, use_container_width=True)
    except Exception as exc:
        st.error(f"Could not load filings: {exc}")
