# Smart Money Tracker

DBMS mini-project for analyzing insider transactions, SEC filings, institutional holdings and market-price behaviour.

## Approved database design

The approved target relational design contains **14 tables**. It extends the original 13-table proposal with `TRANSACTION_OWNERS`, a junction table associating a transaction fact with one or more reporting-owner role assignments without duplicating transaction amounts.

Team decisions:
- Multiple reporting owners: `TRANSACTION_OWNERS` junction.
- `COMPANIES.sector` and `COMPANIES.industry`: NOT NULL; use `Unknown` when source data is unavailable.
- Seed application roles: `Admin`, `Analyst`, `Viewer`.
- Target relational DBMS: PostgreSQL.

## Design documentation

- `docs/relational-schema-final.md` — finalized 14-table relational schema.
- `docs/schema-review-final.md` — design decisions, normalization rationale and integrity rules.
- `docs/chen-er-diagram-final.dot` — editable Graphviz source for the Chen ER diagram.
- A rendered PNG/PDF/SVG diagram is available in the accompanying design package; the source can be rendered with Graphviz.

## Implementation status

The current Python/SQLite application is a prototype. Its four-table schema is **not** the approved target schema and has not yet been migrated. The next implementation milestone is PostgreSQL DDL, constraints, generated columns, indexes and the `TRANSACTION_OWNERS` validation trigger.

## Planned sequence

1. Implement and test PostgreSQL schema.
2. Migrate seed data and harden SEC/market-data ingestion.
3. Complete SQL rubric coverage and automated tests.
4. Add vector search over filing text.
5. Build FastAPI and Next.js integration.
6. Implement authentication, RBAC and audit logging.
