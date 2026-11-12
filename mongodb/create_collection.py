import os
from dotenv import load_dotenv
from pymongo import MongoClient, ASCENDING, DESCENDING

load_dotenv()
db = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017"))["smart_money_nosql"]

# JSON schema validator: every document must have these fields with correct types.
validator = {"$jsonSchema": {
    "bsonType": "object",
    "required": ["accession_number", "issuer_ticker", "filing_date", "raw_xml", "parsed_status"],
    "properties": {
        "accession_number": {"bsonType": "string"},
        "issuer_cik": {"bsonType": "string"},
        "issuer_ticker": {"bsonType": "string"},
        "filing_date": {"bsonType": "string"},
        "raw_xml": {"bsonType": "string"},
        "parsed": {"bsonType": "object"},
        "footnotes": {"bsonType": "array"},
        "parsed_status": {"enum": ["PENDING", "PARSED", "ERROR"]},
    },
}}

# Drop and recreate so the script is re-runnable.
if "raw_sec_filings" in db.list_collection_names():
    db.drop_collection("raw_sec_filings")

db.create_collection("raw_sec_filings", validator=validator)
col = db["raw_sec_filings"]

# Index on accession_number (unique join key with MySQL).
col.create_index("accession_number", unique=True)
# Compound index for ticker + filing_date queries.
col.create_index([("issuer_ticker", ASCENDING), ("filing_date", DESCENDING)])
# Index on parsed_status for filtering.
col.create_index("parsed_status")

print("Collection created with validator and indexes.")
