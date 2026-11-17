"""
Load every row from MySQL sec_filings into MongoDB raw_sec_filings.
Each document uses the same accession_number so the two databases match.
"""
import os
from datetime import datetime, timezone
from decimal import Decimal
from dotenv import load_dotenv
import pymysql
from connection import get_collection

load_dotenv()

# Connect to MySQL.
mysql_conn = pymysql.connect(
    host=os.getenv("MYSQL_HOST", "localhost"),
    user=os.getenv("MYSQL_USER", "root"),
    password=os.getenv("MYSQL_PASSWORD", ""),
    database=os.getenv("MYSQL_DATABASE", "smart_money_tracker"),
    cursorclass=pymysql.cursors.DictCursor,
)

col = get_collection()


def safe(val):
    """Convert Decimal to float and date/datetime to string for MongoDB."""
    if isinstance(val, Decimal):
        return float(val)
    if hasattr(val, "isoformat"):
        return val.isoformat() if hasattr(val, "hour") else str(val)
    return val


# 1. Fetch all filings joined with company info.
with mysql_conn.cursor() as cur:
    cur.execute("""
        SELECT f.accession_number, f.filing_date, f.report_period,
               c.ticker, c.cik, c.company_name
          FROM sec_filings f
          JOIN companies c ON c.company_id = f.company_id
    """)
    filings = cur.fetchall()

docs = []
for row in filings:
    acc = row["accession_number"]
    ticker = row["ticker"]
    cik = row["cik"]
    company_name = row["company_name"]
    filing_date = str(row["filing_date"])
    report_period = str(row["report_period"]) if row["report_period"] else filing_date

    # 2. Fetch insider transactions for this filing.
    with mysql_conn.cursor() as cur:
        cur.execute("""
            SELECT t.transaction_date, t.transaction_code,
                   t.shares_traded, t.price_per_share
              FROM insider_transactions t
              JOIN sec_filings f ON f.filing_id = t.filing_id
             WHERE f.accession_number = %s
        """, (acc,))
        txns = cur.fetchall()

    # Build parsed transactions list and XML snippet.
    transactions_list = []
    transactions_xml = ""
    for t in txns:
        transactions_list.append({
            "transaction_date": str(t["transaction_date"]),
            "transaction_code": t["transaction_code"],
            "shares_traded": safe(t["shares_traded"]),
            "price_per_share": safe(t["price_per_share"]),
        })
        transactions_xml += (
            f"<transaction><transactionDate>{t['transaction_date']}</transactionDate>"
            f"<transactionCode>{t['transaction_code']}</transactionCode>"
            f"<sharesTraded>{safe(t['shares_traded'])}</sharesTraded>"
            f"<pricePerShare>{safe(t['price_per_share'])}</pricePerShare></transaction>"
        )

    # 3. Build the MongoDB document.
    doc = {
        "accession_number": acc,
        "issuer_cik": cik,
        "issuer_ticker": ticker,
        "issuer_name": company_name,
        "filing_date": filing_date,
        "report_period": report_period,
        "form_type": "4",
        "raw_xml": (
            f"<ownershipDocument><schemaVersion>X0306</schemaVersion>"
            f"<documentType>4</documentType>"
            f"<issuer><issuerCik>{cik}</issuerCik>"
            f"<issuerTradingSymbol>{ticker}</issuerTradingSymbol></issuer>"
            f"{transactions_xml}</ownershipDocument>"
        ),
        "parsed": {"transactions": transactions_list},
        "footnotes": ["Shares sold pursuant to a Rule 10b5-1 trading plan."],
        "parsed_status": "PENDING",
        "ingested_at": datetime.now(timezone.utc).isoformat(),
    }
    docs.append(doc)

# 4. Insert all documents.
if docs:
    col.insert_many(docs)

print(f"Inserted {len(docs)} documents into raw_sec_filings.")

mysql_conn.close()
