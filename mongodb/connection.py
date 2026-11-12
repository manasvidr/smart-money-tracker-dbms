import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

def get_collection():
    """Return the raw_sec_filings collection."""
    client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017"))
    return client["smart_money_nosql"]["raw_sec_filings"]
