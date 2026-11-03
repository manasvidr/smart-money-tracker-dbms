# Final Schema Review — Decisions Frozen

## Team decisions

| Topic | Final decision |
|---|---|
| Multiple SEC reporting owners | Add `TRANSACTION_OWNERS(transaction_id, role_assignment_id)` junction. |
| Company sector and industry | Both NOT NULL; ingest `Unknown` when unavailable. |
| Application roles | Seed Admin, Analyst and Viewer. |
| Target relational DBMS | PostgreSQL. |

## Final model

The model contains **14 tables**: the original 13-table target plus `TRANSACTION_OWNERS`. This is a normalized foundation separating authentication, company master data, insider identity, company-specific appointments, filing provenance, transaction facts, daily prices, institutions/holdings, watchlists and audit events.

## Why TRANSACTION_OWNERS is required

A Form 4 filing may identify multiple reporting owners. Store a transaction fact once in INSIDER_TRANSACTIONS, then associate it with every applicable COMPANY_INSIDER_ROLES row through TRANSACTION_OWNERS. This avoids duplicating transaction values and inflating analytics. The junction's composite primary key prevents duplicate links.

The integrity trigger belongs on TRANSACTION_OWNERS because that is where a transaction and a reporting-owner role assignment are associated.

## Key design checks

- Existing composite keys remain: DAILY_PRICES(company_id, price_date); INSTITUTIONAL_HOLDINGS(institution_id, company_id, report_date); USER_ROLES(user_id, role_id); USER_WATCHLIST(user_id, company_id).
- New composite key: TRANSACTION_OWNERS(transaction_id, role_assignment_id).
- Company CIK, ticker and filing accession number are unique.
- total_value is generated; do not insert it directly.
- P and S are the supported transaction codes for this project's buy/sell analytics.
- percentage_held uses 0–100 scale and may be NULL when denominator data is unavailable.
- AUDIT_LOGS.record_id is polymorphic, not a true FK.
- Role history is preserved by closing old role assignments and creating new rows.
- raw_document_xml is retained for source provenance and parser re-runs.

## Trigger rules

A PostgreSQL BEFORE INSERT OR UPDATE trigger on TRANSACTION_OWNERS must:
1. Resolve transaction_date and issuer company through INSIDER_TRANSACTIONS → SEC_FILINGS.
2. Resolve company_id, start_date and end_date from COMPANY_INSIDER_ROLES.
3. Raise a clear exception if either lookup is missing.
4. Reject if issuer company and role-assignment company differ.
5. Reject if transaction_date is earlier than start_date or later than a non-NULL end_date.
6. Treat both tenure endpoints as inclusive.

## Remaining implementation cautions

1. Test actual SEC Form 4 XML with multiple reporting owners and multiple transaction entries before claiming parser correctness.
2. Resolve filing issuer CIK to COMPANIES; do not trust ticker alone.
3. Use RESTRICT where deleting history would orphan filing or insider facts.
4. Test generated numeric precision and rounding in PostgreSQL.
5. Enforce Admin/Analyst/Viewer permissions on the backend/API.
6. SQLite prototype DDL is not the target schema and must not be mistaken for completed implementation.

## Normalization rationale

INSIDERS separates person identity from appointments. COMPANY_INSIDER_ROLES models dated appointments. SEC_FILINGS is separate from parsed transaction facts. TRANSACTION_OWNERS resolves the many-to-many owner association. USER_ROLES and USER_WATCHLIST are proper junctions; INSTITUTIONAL_HOLDINGS is a time-specific associative fact.

**Status: design decisions frozen. Next milestone: implement PostgreSQL DDL and test all keys, FKs, checks, generated columns and the owner/tenure trigger.**
