# Smart Money Tracker — Final Relational Schema

**Approved decisions:** multiple reporting owners are represented by `TRANSACTION_OWNERS`; `sector` and `industry` are NOT NULL with `Unknown` fallback; seed roles are Admin, Analyst and Viewer. PostgreSQL is the target DBMS.

Notation: PK primary key; FK foreign key; UK unique; NN not null; CK check; GEN generated stored.

1. **USERS**(`user_id` PK, `username` UK NN, `email` UK NN, `password_hash` NN, `is_active` NN DEFAULT TRUE, `created_at` NN DEFAULT CURRENT_TIMESTAMP)
2. **ROLES**(`role_id` PK, `role_name` UK NN, `description`). Seed `Admin`, `Analyst`, `Viewer`. Enforce permissions in backend/API.
3. **USER_ROLES**(`user_id` PK/FK → USERS ON DELETE CASCADE, `role_id` PK/FK → ROLES ON DELETE CASCADE, `assigned_at` NN DEFAULT CURRENT_TIMESTAMP). PK(`user_id`, `role_id`).
4. **COMPANIES**(`company_id` PK, `cik` UK NN, `ticker` UK NN, `company_name` NN, `sector` NN, `industry` NN). Missing sector/industry source values become `Unknown`, never NULL.
5. **INSIDERS**(`insider_id` PK, `full_name` NN, `sec_person_cik` UK NULLABLE).
6. **COMPANY_INSIDER_ROLES**(`role_assignment_id` PK, `insider_id` FK → INSIDERS ON DELETE RESTRICT NN, `company_id` FK → COMPANIES ON DELETE RESTRICT NN, `title` NN, `is_officer` NN DEFAULT FALSE, `is_board_director` NN DEFAULT FALSE, `start_date` NN, `end_date` NULLABLE, CK end_date IS NULL OR end_date >= start_date). Preserve history by closing an old assignment and inserting a new row when title/tenure changes.
7. **SEC_FILINGS**(`filing_id` PK, `company_id` FK → COMPANIES ON DELETE RESTRICT NN, `accession_number` UK NN, `filing_date` NN, `report_period` NN, `form_type` NN DEFAULT '4', `source_url` NULLABLE, `raw_document_xml` TEXT NN, `created_at` NN DEFAULT CURRENT_TIMESTAMP). One filing belongs to one issuer company; retain raw XML for provenance.
8. **INSIDER_TRANSACTIONS**(`transaction_id` PK, `filing_id` FK → SEC_FILINGS ON DELETE RESTRICT NN, `transaction_date` NN, `transaction_code` NN CK IN ('P','S'), `shares_traded` NUMERIC(15,4) NN CK > 0, `price_per_share` NUMERIC(12,4) NN CK >= 0, `total_value` NUMERIC(18,2) GEN STORED AS shares_traded * price_per_share, `created_at` NN DEFAULT CURRENT_TIMESTAMP). Store each transaction once, even if several owners are associated.
9. **TRANSACTION_OWNERS**(`transaction_id` PK/FK → INSIDER_TRANSACTIONS ON DELETE CASCADE, `role_assignment_id` PK/FK → COMPANY_INSIDER_ROLES ON DELETE RESTRICT, `owner_order` NULLABLE, `created_at` NN DEFAULT CURRENT_TIMESTAMP). PK(`transaction_id`, `role_assignment_id`). A transaction may have multiple reporting owners; one role assignment may be linked to many transactions.
10. **DAILY_PRICES**(`company_id` PK/FK → COMPANIES ON DELETE CASCADE NN, `price_date` PK, `open_price`, `high_price`, `low_price`, `close_price`, `adj_close` NUMERIC(12,4) NN CK >= 0, `volume` BIGINT NN CK >= 0). PK(`company_id`, `price_date`). Add OHLC envelope consistency checks.
11. **INSTITUTIONS**(`institution_id` PK, `cik` UK NN, `institution_name` NN, `manager_name` NULLABLE).
12. **INSTITUTIONAL_HOLDINGS**(`institution_id` PK/FK → INSTITUTIONS ON DELETE CASCADE, `company_id` PK/FK → COMPANIES ON DELETE CASCADE, `report_date` PK, `shares_held` NUMERIC(20,4) NN CK >= 0, `market_value` NUMERIC(20,2) NN CK >= 0, `percentage_held` NUMERIC(7,4) NULLABLE CK BETWEEN 0 AND 100). PK(`institution_id`, `company_id`, `report_date`). Percentage is 0–100; NULL is allowed if denominator unavailable.
13. **USER_WATCHLIST**(`user_id` PK/FK → USERS ON DELETE CASCADE, `company_id` PK/FK → COMPANIES ON DELETE CASCADE, `added_at` NN DEFAULT CURRENT_TIMESTAMP, `notes` NULLABLE). PK(`user_id`, `company_id`).
14. **AUDIT_LOGS**(`log_id` PK, `table_name` NN, `action_type` NN CK IN ('INSERT','UPDATE','DELETE'), `record_id` NN, `performed_by` FK → USERS ON DELETE SET NULL, `action_timestamp` NN DEFAULT CURRENT_TIMESTAMP, `old_values` JSONB NULLABLE, `new_values` JSONB NULLABLE). `record_id` is polymorphic, not a conventional FK; ordinary app roles should not be able to modify/delete audit history.

## Relationship cardinalities

- USERS 1:N USER_ROLES; ROLES 1:N USER_ROLES.
- USERS 1:N USER_WATCHLIST; COMPANIES 1:N USER_WATCHLIST.
- USERS 1:N AUDIT_LOGS.
- INSIDERS 1:N COMPANY_INSIDER_ROLES; COMPANIES 1:N COMPANY_INSIDER_ROLES.
- COMPANIES 1:N SEC_FILINGS; SEC_FILINGS 1:N INSIDER_TRANSACTIONS.
- INSIDER_TRANSACTIONS 1:N TRANSACTION_OWNERS; COMPANY_INSIDER_ROLES 1:N TRANSACTION_OWNERS.
- COMPANIES 1:N DAILY_PRICES.
- INSTITUTIONS 1:N INSTITUTIONAL_HOLDINGS; COMPANIES 1:N INSTITUTIONAL_HOLDINGS.

## Required trigger

Create a PostgreSQL BEFORE INSERT OR UPDATE trigger on `TRANSACTION_OWNERS`. Resolve the transaction's date and issuer company through INSIDER_TRANSACTIONS → SEC_FILINGS; resolve the role assignment's company, start_date and end_date. Reject missing lookup rows, reject issuer/role company mismatch, and reject transaction dates outside the inclusive role tenure. A NULL end_date means ongoing.
