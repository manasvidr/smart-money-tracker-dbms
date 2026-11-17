"""
CRUD operations on the raw_sec_filings MongoDB collection.
Each function prints before/after counts so screenshots clearly show the effect.
"""
from connection import get_collection
from datetime import datetime, timezone

col = get_collection()


# CREATE: insert one hand-written test document.
def insert_one_filing():
    """Insert a single test filing document."""
    print("\n--- INSERT ONE ---")
    print(f"  Count before: {col.count_documents({})}")
    col.insert_one({
        "accession_number": "TEST-0000000001",
        "issuer_cik": "0000000000",
        "issuer_ticker": "TEST",
        "issuer_name": "Test Company",
        "filing_date": "2026-06-01",
        "report_period": "2026-06-01",
        "form_type": "4",
        "raw_xml": "<ownershipDocument><test>true</test></ownershipDocument>",
        "parsed": {"transactions": []},
        "footnotes": ["Test footnote."],
        "parsed_status": "PENDING",
        "ingested_at": datetime.now(timezone.utc).isoformat(),
    })
    print(f"  Count after:  {col.count_documents({})}")


# READ: list first N filings (hide raw_xml for readability).
def read_all(limit=5):
    """Read the first N filings, hiding raw_xml."""
    print(f"\n--- READ ALL (limit {limit}) ---")
    for doc in col.find({}, {"raw_xml": 0}).limit(limit):
        print(f"  {doc['accession_number']}  {doc['issuer_ticker']}  {doc['parsed_status']}")


# READ: find filings by ticker.
def read_by_ticker(ticker="AAPL"):
    """Read filings for a specific ticker."""
    print(f"\n--- READ BY TICKER ({ticker}) ---")
    for doc in col.find({"issuer_ticker": ticker}, {"raw_xml": 0}):
        print(f"  {doc['accession_number']}  {doc['filing_date']}  {doc['parsed_status']}")


# READ: find a filing by accession number.
def read_by_accession(acc):
    """Read one filing by its accession_number."""
    print(f"\n--- READ BY ACCESSION ({acc}) ---")
    doc = col.find_one({"accession_number": acc}, {"raw_xml": 0})
    if doc:
        print(f"  Found: {doc['issuer_ticker']} on {doc['filing_date']}")
    else:
        print("  Not found.")


# UPDATE: change parsed_status of one document.
def update_one_status(acc, new_status):
    """Update the parsed_status of a single filing."""
    print(f"\n--- UPDATE ONE ({acc} -> {new_status}) ---")
    before = col.find_one({"accession_number": acc})
    print(f"  Status before: {before['parsed_status'] if before else 'N/A'}")
    col.update_one({"accession_number": acc}, {"$set": {"parsed_status": new_status}})
    after = col.find_one({"accession_number": acc})
    print(f"  Status after:  {after['parsed_status'] if after else 'N/A'}")


# UPDATE MANY: set all PENDING filings of one ticker to PARSED.
def update_many_by_ticker(ticker="AAPL"):
    """Mark all PENDING filings of a ticker as PARSED."""
    print(f"\n--- UPDATE MANY ({ticker}: PENDING -> PARSED) ---")
    pending = col.count_documents({"issuer_ticker": ticker, "parsed_status": "PENDING"})
    print(f"  PENDING before: {pending}")
    result = col.update_many(
        {"issuer_ticker": ticker, "parsed_status": "PENDING"},
        {"$set": {"parsed_status": "PARSED"}},
    )
    print(f"  Modified: {result.modified_count}")
    pending_after = col.count_documents({"issuer_ticker": ticker, "parsed_status": "PENDING"})
    print(f"  PENDING after:  {pending_after}")


# DELETE: remove the test document.
def delete_one_filing(acc="TEST-0000000001"):
    """Delete a filing by accession_number."""
    print(f"\n--- DELETE ONE ({acc}) ---")
    print(f"  Count before: {col.count_documents({})}")
    col.delete_one({"accession_number": acc})
    print(f"  Count after:  {col.count_documents({})}")


# Run all operations in order.
def main():
    insert_one_filing()
    read_all(limit=5)
    read_by_ticker("AAPL")
    read_by_accession("TEST-0000000001")
    update_one_status("TEST-0000000001", "PARSED")
    update_many_by_ticker("AAPL")
    delete_one_filing("TEST-0000000001")
    print("\n--- FINAL COUNT ---")
    print(f"  Total documents: {col.count_documents({})}")


if __name__ == "__main__":
    main()
