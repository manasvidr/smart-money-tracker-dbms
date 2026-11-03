from datetime import date, timedelta
import pandas as pd
import yfinance as yf
from sqlalchemy import text

from config import DATABASE_URL
from db.connection import engine


def fetch_and_store_prices(tickers: list[str], start_date=None, end_date=None):
    """Fetch daily OHLCV data with yfinance and upsert it into the prototype schema."""
    end_date = end_date or date.today()
    start_date = start_date or (end_date - timedelta(days=365 * 2))
    for ticker in tickers:
        try:
            frame = yf.download(
                ticker, start=start_date.isoformat(), end=end_date.isoformat(),
                auto_adjust=False, progress=False, threads=False
            )
            if frame.empty:
                print(f"No price rows returned for {ticker}")
                continue
            if isinstance(frame.columns, pd.MultiIndex):
                frame.columns = frame.columns.get_level_values(0)
            frame = frame.reset_index()
            frame.columns = [str(c).lower().replace(" ", "_") for c in frame.columns]
            frame["ticker"] = ticker
            frame = frame.rename(columns={"date": "price_date", "adj_close": "adj_close"})
            keep = ["ticker","price_date","open","high","low","close","adj_close","volume"]
            frame = frame[[c for c in keep if c in frame.columns]].copy()
            frame = frame.rename(columns={"open":"open_price","high":"high_price","low":"low_price","close":"close_price"})
            frame["price_date"] = pd.to_datetime(frame["price_date"]).dt.date
            frame = frame.where(pd.notnull(frame), None)
            records = frame.to_dict(orient="records")
            if not records:
                continue
            with engine.begin() as conn:
                for row in records:
                    if DATABASE_URL.startswith("sqlite"):
                        sql = """INSERT INTO daily_prices(ticker,price_date,open_price,high_price,low_price,close_price,adj_close,volume)
                                 VALUES(:ticker,:price_date,:open_price,:high_price,:low_price,:close_price,:adj_close,:volume)
                                 ON CONFLICT(ticker,price_date) DO UPDATE SET open_price=excluded.open_price,
                                 high_price=excluded.high_price,low_price=excluded.low_price,close_price=excluded.close_price,
                                 adj_close=excluded.adj_close,volume=excluded.volume"""
                    else:
                        sql = """INSERT INTO daily_prices(ticker,price_date,open_price,high_price,low_price,close_price,adj_close,volume)
                                 VALUES(:ticker,:price_date,:open_price,:high_price,:low_price,:close_price,:adj_close,:volume)
                                 ON CONFLICT(ticker,price_date) DO UPDATE SET open_price=excluded.open_price,
                                 high_price=excluded.high_price,low_price=excluded.low_price,close_price=excluded.close_price,
                                 adj_close=excluded.adj_close,volume=excluded.volume"""
                    conn.execute(text(sql), row)
            print(f"Stored {len(records)} price rows for {ticker}")
        except Exception as exc:
            print(f"Price ingestion failed for {ticker}: {exc}")
