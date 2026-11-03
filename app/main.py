import argparse
from pathlib import Path
import sys

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from config import BASE_DIR, DEFAULT_TICKERS
from db.connection import engine, init_db
from ingestion.price_data import fetch_and_store_prices
from ingestion.seed_data import seed_sample_data
from sqlalchemy import inspect, text


def show_schema():
    inspector = inspect(engine)
    names = inspector.get_table_names()
    if not names:
        print("No tables found. Initialize the database first.")
        return
    for name in names:
        pk = inspector.get_pk_constraint(name).get("constrained_columns", [])
        print(f"\nTABLE: {name.upper()}")
        for col in inspector.get_columns(name):
            key = "PK" if col["name"] in pk else ""
            print(f"  {col['name']:<30} {col['type']!s:<22} {key}")


def run_analytics():
    sql_path = BASE_DIR / "sql" / "analytics_queries.sql"
    content = sql_path.read_text(encoding="utf-8")
    sections = content.split("-- QUERY:")
    with engine.connect() as conn:
        for section in sections[1:]:
            lines = section.splitlines()
            title = lines[0].strip()
            sql_lines = [line for line in lines[1:] if not line.lstrip().startswith("--")]
            query = "\n".join(sql_lines).strip()
            if not query:
                continue
            print(f"\n{title}\n{'-' * len(title)}")
            try:
                result = conn.execute(text(query))
                rows = result.fetchall()
                print(" | ".join(result.keys()))
                for row in rows[:10]:
                    print(" | ".join(str(value) for value in row))
                if not rows:
                    print("No records returned.")
            except Exception as exc:
                print(f"Query failed: {exc}")


def main():
    parser = argparse.ArgumentParser(description="Smart Money Tracker prototype CLI")
    parser.add_argument("--init-db", action="store_true", help="Initialize/reset the prototype database")
    parser.add_argument("--seed", action="store_true", help="Initialize and populate synthetic demo data")
    parser.add_argument("--fetch-prices", action="store_true", help="Fetch historical prices for configured tickers")
    parser.add_argument("--analyze", action="store_true", help="Run the prototype SQL analytics")
    parser.add_argument("--schema", action="store_true", help="Inspect tables, columns and primary keys")
    args = parser.parse_args()

    if not any(vars(args).values()):
        parser.print_help()
        return
    if args.init_db:
        init_db(reset=True)
    if args.seed:
        init_db(reset=True)
        seed_sample_data()
    if args.fetch_prices:
        fetch_and_store_prices(DEFAULT_TICKERS)
    if args.analyze:
        run_analytics()
    if args.schema:
        show_schema()


if __name__ == "__main__":
    main()
