# Target Schema Review and Approved Conventions

**Status:** review of the supplied *Final Rectified* specification. This is a design baseline, not proof of implementation.

## Verdict

The 13-entity model is a substantial improvement over the original four-table prototype. It separates user/role management, companies, insider identities and company-specific appointments, filings, transactions, daily prices, institutions/holdings, watchlists and audit events.

The four composite keys in the supplied verification matrix are consistent with the expanded model:

- `DAILY_PRICES(company_id, price_date)`
- `INSTITUTIONAL_HOLDINGS(institution_id, company_id, report_date)`
- `USER_ROLES(user_id, role_id)`
- `USER_WATCHLIST(user_id, company_id)`

Do not mix those expanded-design identifiers with the old prototype's `cik` and `ticker` keys.

## Attribute and normalization assessment

The separation of `INSIDERS` from `COMPANY_INSIDER_ROLES` is sound: an insider identity is stored once, while company-specific titles and tenure are represented as appointment records. Separating `SEC_FILINGS` from parsed `INSIDER_TRANSACTIONS` preserves filing provenance. `USER_ROLES`, `USER_WATCHLIST`, and `INSTITUTIONAL_HOLDINGS` are suitable associative entities with composite primary keys.

The target list of attributes is broadly coherent. The following questions must be made explicit before freezing DDL:

1. **Multiple SEC reporting owners:** a Form 4 filing can identify more than one reporting owner. The target transaction row references one `role_assignment_id`. Confirm whether the data loader creates one transaction row per owner/role or whether an owner-transaction junction is required. Do not silently duplicate transaction facts.
2. **Issuer consistency:** `SEC_FILINGS.company_id` should be resolved from the issuer CIK in the SEC submission, not guessed from ticker. A trigger must reject a transaction whose filing company differs from the company in the referenced role assignment.
3. **Tenure validation:** require `end_date IS NULL OR end_date >= start_date`; on transaction insert/update require transaction date within the inclusive role tenure. Handle missing lookup rows with clear exceptions.
4. **Historical titles:** don't overwrite a past appointment when an insider changes title. Close the previous appointment and insert a new one.
5. **Generated amount:** `total_value` is generated from `shares_traded * price_per_share`; never insert into it. Define precision/rounding deliberately.
6. **OHLC consistency:** in addition to nonnegative prices, check `high_price >= low_price`, and that high/low envelope open/close when those fields are present.
7. **Percentage held:** define whether `percentage_held` is percentage points from 0–100 and allow NULL when unavailable.
8. **Audit `record_id`:** this is polymorphic text, not a real FK to every target table. State that in the report. Decide whether the app or triggers write audit events; enforce append-only behavior for ordinary application roles.
9. **Separate CIK namespaces:** company CIK and institution CIK are identifiers in different domains; don't use one as the other's FK.
10. **Sector and industry:** the source design marks these required. For incomplete reference data, seed an explicit `Unknown` value or formally relax nullability and update the design artifacts together.
11. **Role permissions:** `ROLES` and `USER_ROLES` establish role assignments. The actual permission matrix remains an application authorization policy; add permissions tables only if the project scope needs finer-grained permissions.

## Primary and foreign key summary

- `USERS(user_id)` PK; `username`, `email` unique.
- `ROLES(role_id)` PK; `role_name` unique.
- `USER_ROLES(user_id, role_id)` composite PK; both columns are FKs.
- `COMPANIES(company_id)` PK; `cik`, `ticker` unique.
- `INSIDERS(insider_id)` PK; `sec_person_cik` unique when supplied.
- `COMPANY_INSIDER_ROLES(role_assignment_id)` PK; FKs to `INSIDERS`, `COMPANIES`.
- `SEC_FILINGS(filing_id)` PK; FK to `COMPANIES`; unique accession number.
- `INSIDER_TRANSACTIONS(transaction_id)` PK; FKs to `SEC_FILINGS`, `COMPANY_INSIDER_ROLES`.
- `DAILY_PRICES(company_id, price_date)` composite PK; company_id FK.
- `INSTITUTIONS(institution_id)` PK; unique CIK.
- `INSTITUTIONAL_HOLDINGS(institution_id, company_id, report_date)` composite PK; both ID columns are FKs.
- `USER_WATCHLIST(user_id, company_id)` composite PK; both columns are FKs.
- `AUDIT_LOGS(log_id)` PK; nullable `performed_by` FK to USERS with SET NULL.

## Chen notation

The diagram uses entity rectangles, relationship diamonds, attribute ovals, underlined primary-key attributes and 1/N cardinalities. Associative entities are retained as entities in the physical/logical design and linked with relationships.

## Design freeze checklist

- [ ] Confirm SEC multiple-owner transaction semantics.
- [ ] Confirm whether one filing is always associated with exactly one issuer company.
- [ ] Confirm percentage-held units and nullability.
- [ ] Confirm required vs nullable sector/industry.
- [ ] Confirm role permission policy (Admin, Analyst, Viewer).
- [ ] Approve PostgreSQL as the final implementation DBMS.
