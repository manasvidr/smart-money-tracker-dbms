# Target Schema Review and Approved Conventions

**Status:** review of the supplied *Final Rectified* design. It is not evidence that the schema has been implemented.

## Overall verdict

The 13-entity model is a sound improvement over the old four-table prototype. It separates user/role management, companies, insider identities and company-specific appointments, filings, transactions, daily prices, institutions/holdings, watchlists and audit events. The four composite keys in the supplied verification matrix agree with the attribute catalog.

## Decisions to settle before freezing DDL

1. **Multiple reporting owners:** SEC Form 4 can describe multiple reporting owners. The design has one `role_assignment_id` per transaction row. Confirm whether each trade/owner association becomes a separate row or whether an owner-transaction junction is needed.
2. **Issuer identity:** Resolve `SEC_FILINGS.company_id` from issuer CIK, not ticker alone.
3. **Trigger:** Add explicit `NOT FOUND` handling for filing and role lookups. Reject cross-company references and transaction dates outside the inclusive `[start_date, end_date]` tenure.
4. **Historical roles:** Close an old role assignment and insert a new one when a title/role changes; avoid rewriting historical appointment attributes.
5. **Generated total:** `total_value` is generated as shares × price. Do not insert the prototype's `total_transaction_value` into this column; define required rounding/precision.
6. **Daily price checks:** Add OHLC consistency (high >= low and high/low envelope open/close) in addition to non-negative values.
7. **Holding percentage:** Clarify the meaning of `percentage_held`; nullable is sensible when shares outstanding is unknown.
8. **Audit `record_id`:** It is polymorphic text, not an FK. Document this and ensure normal users cannot alter/delete audit records.
9. **Audit actor:** `performed_by ON DELETE SET NULL` preserves audit history and is appropriate.
10. **CIK format:** Keep company and institution CIKs as separate unique identifiers; validate zero-padded 10-character format.
11. **RBAC scope:** `ROLES` and `USER_ROLES` define role assignment. Permissions can be defined in backend policy unless the scope calls for permission tables.
12. **Sector/industry nullability:** Target catalog says NOT NULL. Either seed `Unknown` or consciously relax nullability and update the diagram/catalog in one change.

## Key map

- `USERS(user_id)` PK; unique username and email.
- `ROLES(role_id)` PK; unique role_name.
- `USER_ROLES(user_id, role_id)` composite PK; both FKs.
- `USER_WATCHLIST(user_id, company_id)` composite PK; both FKs.
- `COMPANIES(company_id)` PK; unique CIK and ticker.
- `INSIDERS(insider_id)` PK; unique nullable SEC person CIK.
- `COMPANY_INSIDER_ROLES(role_assignment_id)` PK; FKs to INSIDERS and COMPANIES.
- `SEC_FILINGS(filing_id)` PK; FK to COMPANIES; unique accession_number.
- `INSIDER_TRANSACTIONS(transaction_id)` PK; FKs to SEC_FILINGS and COMPANY_INSIDER_ROLES.
- `DAILY_PRICES(company_id, price_date)` composite PK; company_id FK.
- `INSTITUTIONS(institution_id)` PK; unique CIK.
- `INSTITUTIONAL_HOLDINGS(institution_id, company_id, report_date)` composite PK; two FKs.
- `AUDIT_LOGS(log_id)` PK; nullable performed_by FK to USERS with SET NULL.

## Normalization

Separating INSIDERS from COMPANY_INSIDER_ROLES avoids repeating identity for each appointment and supports employment history. SEC_FILINGS remains distinct from parsed INSIDER_TRANSACTIONS, preserving document provenance. USER_ROLES and USER_WATCHLIST are proper junction entities. INSTITUTIONAL_HOLDINGS represents a dated holding fact. The multi-owner Form 4 question is the main modeling ambiguity to settle before claiming full normalization.

## Chen notation

The supplied `chen-er-diagram.png` uses rectangles for entities, diamonds for relationships, ovals for attributes, underlined primary-key attributes and 1/N cardinalities. Associative entities carry relationship attributes so the diagram maps clearly to the relational model.
