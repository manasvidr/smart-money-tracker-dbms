# Supplied Rectified Database Design — Source Snapshot

This file should preserve the supplied source PDF `database_schema_and_er_diagram_v2.pdf`. Its text extraction is included in this snapshot for reference.

**Model:** 13 entities — USERS, ROLES, USER_ROLES, USER_WATCHLIST, COMPANIES, INSIDERS, COMPANY_INSIDER_ROLES, SEC_FILINGS, INSIDER_TRANSACTIONS, DAILY_PRICES, INSTITUTIONS, INSTITUTIONAL_HOLDINGS, AUDIT_LOGS.

**Composite keys:** DAILY_PRICES(company_id, price_date); INSTITUTIONAL_HOLDINGS(institution_id, company_id, report_date); USER_ROLES(user_id, role_id); USER_WATCHLIST(user_id, company_id).

**Important attributes and rules:** company and institution master data each have a unique CIK; companies also have a unique ticker; SEC_FILINGS has a unique accession_number; INSIDER_TRANSACTIONS has filing_id and role_assignment_id FKs, transaction_code limited to P/S, positive shares, non-negative price, and a generated stored total_value; COMPANY_INSIDER_ROLES tracks title and start/end dates; INSTITUTIONAL_HOLDINGS stores shares, market value and a nullable ownership percentage constrained to 0–100; AUDIT_LOGS stores old/new JSONB snapshots and actor FK with ON DELETE SET NULL.

**Trigger requirement:** BEFORE INSERT OR UPDATE on INSIDER_TRANSACTIONS, compare the company associated with filing_id to the company associated with role_assignment_id, then reject trade dates outside the role assignment's inclusive tenure.

See `schema-review.md` for design-review notes and `relational-schema.md` for the full relational notation. The original PDF remains the authoritative supplied artifact; this file is a quick text summary.
