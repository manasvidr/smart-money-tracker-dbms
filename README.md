 # Smart Money Tracker

DBMS mini-project — insider transactions, institutional ownership and market-price analytics.

## Status
This repository preserves the supplied October prototype as a baseline. The 13-table rectified database design is documented under `docs/`; it is the target specification and is not yet implemented in the runtime schema.

## Structure
- `app/`: current Streamlit dashboard and CLI
- `db/`: SQLAlchemy connection and prototype database setup
- `ingestion/`: sample data, SEC Form 4 parsing and stock-price ingestion
- `sql/`: prototype four-table DDL and three analytics queries
- `docs/`: target schema review, relational schema and Chen ER diagram

See `docs/schema-review.md`, `docs/relational-schema.md`, and `docs/chen-er-diagram.png` before beginning the PostgreSQL implementation.

## Run the prototype
Python 3.10+ recommended. From the repository root:

```bash
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
python app/main.py --help
streamlit run app/dashboard.py
```

Check command help and `config.py` before running database reset or seed commands. The local database is intentionally not committed; create a fresh one with the CLI.

## Important
- The current `sql/schema.sql` is the four-table prototype, not the final target schema.
- Sample records are synthetic and must not be described as live SEC or market data.
- SEC parser logic exists; full live filing discovery/download needs implementation and verification.
- Never commit `.env`, credentials, local databases, downloaded datasets or virtual environments.

## Planned sequence
1. Freeze and implement the 13-table PostgreSQL schema, keys, constraints and integrity trigger.
2. Migrate seed data and harden SEC/price ingestion.
3. Complete the SQL rubric and automated tests.
4. Add NoSQL/vector filing search.
5. Build FastAPI and Next.js integration.
6. Implement authentication, role-based authorization and audit logging.
7. Complete documentation, GitHub evidence and evaluation demo.
