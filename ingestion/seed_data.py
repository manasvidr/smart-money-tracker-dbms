from datetime import date, timedelta
import random

from sqlalchemy import text

from db.connection import engine


COMPANIES = [
    ("0000320193", "AAPL", "Apple Inc", "Technology", "Consumer Electronics"),
    ("0000789019", "MSFT", "Microsoft Corporation", "Technology", "Software"),
    ("0001045810", "NVDA", "NVIDIA Corporation", "Technology", "Semiconductors"),
    ("0001018724", "AMZN", "Amazon.com Inc", "Consumer Cyclical", "Internet Retail"),
    ("0001652044", "GOOGL", "Alphabet Inc", "Communication Services", "Internet Content"),
    ("0001326801", "META", "Meta Platforms Inc", "Communication Services", "Internet Content"),
    ("0001318605", "TSLA", "Tesla Inc", "Consumer Cyclical", "Auto Manufacturers"),
    ("0000019617", "JPM", "JPMorgan Chase & Co", "Financial Services", "Banks"),
]


def seed_sample_data():
    """Populate the four-table prototype with explicitly synthetic demo records."""
    rng = random.Random(42)
    with engine.begin() as conn:
        for table in ("insider_transactions", "sec_filings", "daily_prices", "companies"):
            conn.execute(text(f"DELETE FROM {table}"))
        for cik, ticker, name, sector, industry in COMPANIES:
            conn.execute(
                text("""INSERT INTO companies(cik,ticker,company_name,sector,industry)
                        VALUES(:cik,:ticker,:name,:sector,:industry)"""),
                {"cik": cik, "ticker": ticker, "name": name, "sector": sector, "industry": industry},
            )

        for cik, ticker, *_ in COMPANIES:
            for n in range(3):
                accession = f"{cik}-{2024}{n+1:02d}-000001"
                filing_date = date(2024, n + 1, 20)
                trade_date = filing_date - timedelta(days=2)
                owner_name = f"Demo Insider {n+1}"
                xml = (
                    f"<ownershipDocument><issuer><issuerCik>{cik}</issuerCik>"
                    f"<issuerTradingSymbol>{ticker}</issuerTradingSymbol></issuer>"
                    f"<reportingOwner><reportingOwnerId><rptOwnerName>{owner_name}</rptOwnerName></reportingOwnerId>"
                    f"<reportingOwnerRelationship><isOfficer>1</isOfficer><officerTitle>Chief Financial Officer</officerTitle>"
                    f"</reportingOwnerRelationship></reportingOwner></ownershipDocument>"
                )
                conn.execute(
                    text("""INSERT INTO sec_filings(accession_number,cik,ticker,filing_date,raw_document_xml)
                            VALUES(:acc,:cik,:ticker,:filing_date,:xml)"""),
                    {"acc": accession, "cik": cik, "ticker": ticker, "filing_date": filing_date, "xml": xml},
                )
                shares = rng.randint(100, 1000)
                price = round(rng.uniform(50, 500), 4)
                conn.execute(
                    text("""INSERT INTO insider_transactions(
                              accession_number,cik,ticker,insider_name,insider_title,is_board_director,
                              is_officer,transaction_date,transaction_code,shares_traded,price_per_share,
                              total_transaction_value)
                            VALUES(:acc,:cik,:ticker,:owner,:title,FALSE,TRUE,:txdate,'P',:shares,:price,:value)"""),
                    {"acc": accession, "cik": cik, "ticker": ticker, "owner": owner_name,
                     "title": "Chief Financial Officer", "txdate": trade_date,
                     "shares": shares, "price": price, "value": round(shares * price, 2)},
                )

        # Weekdays only: LEAD(21/42/63) is now based on synthetic trading sessions.
        session_dates = []
        current = date(2024, 1, 1)
        while len(session_dates) < 180:
            if current.weekday() < 5:
                session_dates.append(current)
            current += timedelta(days=1)

        for _, ticker, *_ in COMPANIES:
            price = 100 + rng.random() * 100
            for session_date in session_dates:
                price = max(5, price * (1 + rng.uniform(-0.02, 0.02)))
                conn.execute(
                    text("""INSERT INTO daily_prices(
                              ticker,price_date,open_price,high_price,low_price,close_price,adj_close,volume)
                            VALUES(:ticker,:date,:open,:high,:low,:close,:adj,:volume)"""),
                    {"ticker": ticker, "date": session_date, "open": round(price * 0.995, 4),
                     "high": round(price * 1.02, 4), "low": round(price * 0.98, 4),
                     "close": round(price, 4), "adj": round(price, 4),
                     "volume": rng.randint(100_000, 10_000_000)},
                )
    print("Synthetic prototype data seeded; these records are not live SEC or market data.")
