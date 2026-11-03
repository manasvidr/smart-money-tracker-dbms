# Smart Money Tracker

A DBMS mini-project exploring insider transactions, institutional ownership and market-price behaviour.

## Current status

This repository starts by preserving the October prototype as a baseline. The supplied *Final Rectified* design describes a 13-table target model and is documented in `docs/`. **That target schema is not yet implemented in the runtime DDL.** The current prototype SQL still creates four tables: `companies`, `sec_filings`, `insider_transactions`, and `daily_prices`.

## Repository structure

- `app/` — current Streamlit dashboard and CLI
- `db/` — SQLAlchemy connection and schema initialization
- `ingestion/` — sample data, SEC Form 4 parsing and market-price ingestion
- `sql/` — current prototype DDL and analytics queries
- `docs/` — target schema, design review, relational schema and Chen ER diagram

## Prototype setup

Use Python 3.10+. Create a virtual environment and install dependencies:

```bash
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
python app/main.py --help
```

Run the existing dashboard with:

```bash
streamlit run app/dashboard.py
```

The prototype defaults to a local SQLite database. The local database file is intentionally not committed. Inspect `config.py` and the CLI help before running commands that reset or seed data.

## Important caveats

- Existing sample data is synthetic; do not present it as live SEC filings or live market signals.
- SEC XML parser code exists, but live filing discovery/download must be verified and completed.
- The analytics SQL is still prototype SQL and needs review for PostgreSQL compatibility.
- The expanded 13-table schema and trigger exist as a design specification, not running implementation.
- Do not commit `.env`, credentials, local databases, virtual environments, caches or downloaded datasets.

## Planned work

1. Freeze the rectified model and resolve the Form 4 multiple-reporting-owner modeling question.
2. Implement PostgreSQL DDL, constraints, four composite PKs and integrity trigger.
3. Migrate seed data and harden SEC/price ingestion.
4. Complete the SQL rubric and tests.
5. Add vector/NoSQL filing search.
6. Build FastAPI + Next.js and authentication/RBAC.
