from datetime import date, timedelta

import pandas as pd
import yfinance as yf
from sqlalchemy import text

from config import DATABASE_URL
from db.connection import engine


def fetch_and_store_prices(tickers: list[str], start_date=None, end_date=None):
    """Fetch daily OHLCV records and upsert them into the four-table prototype schema."""
    end_date = end_date or date.today()
    start_date = start_date or (end_date - timedelta(days=365 * 2))
    dialect_sql = """INSERT INTO daily_prices(
        ticker, price_date, open_price, high_price, low_price, close_price, adj_close, volume
    ) VALUES (
        :ticker, :price_date, :open_price, :high_price, :low_price, :close_price, :adj_close, :volume
    ) ON CONFLICT(ticker, price_date) DO UPDATE SET
        open_price=excluded.open_price, high_price=excluded.high_price,
        low_price=excluded.low_price, close_price=excluded.close_price,
        adj_close=excluded.adj_close, volume=excluded.volume"""

    for ticker in tickers:
        try:
            frame = yf.download(
                ticker, start=start_date.isoformat(), end=end_date.isoformat(),
                auto_adjust=False, progress=False, threads=False,
            )
            if frame.empty:
                print(f"No price rows returned for {ticker}")
                continue
            if isinstance(frame.columns, pd.MultiIndex):
                frame.columns = frame.columns.get_level_values(0)
            frame = frame.reset_index()
            frame.columns = [str(c).lower().replace(" ", "_") for c in frame.columns]
            frame["ticker"] = ticker
            frame = frame.rename(columns={"date": "price_date"})
            required = ["ticker", "price_date", "open", "high", "low", "close", "adj_close", "volume"]
            missing = [c for c in required if c not in frame.columns]
            if missing:
                raise ValueError(f"yfinance response missing columns: {missing}")
            frame = frame[required].rename(columns={
                "open": "open_price", "high": "high_price", "low": "low_price", "close": "close_price"
            })
            frame["price_date"] = pd.to_datetime(frame["price_date"]).dt.date
            frame = frame.astype(object).where(pd.notna(frame), None)
            with engine.begin() as conn:
                for row in frame.to_dict(orient="records"):
                    conn.execute(text(dialect_sql), row)
            print(f"Stored {len(frame)} price rows for {ticker}")
        except Exception as exc:
            print(f"Price ingestion failed for {ticker}: {exc}")
