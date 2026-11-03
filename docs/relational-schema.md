# Smart Money Tracker — Relational Schema (Target)

Notation: `PK` primary key, `FK` foreign key, `UK` unique, `NN` not null, `CK` check constraint, `GEN` generated stored.

1. **USERS**(`user_id` PK, `username` UK NN, `email` UK NN, `password_hash` NN, `is_active` NN DEFAULT TRUE, `created_at` NN DEFAULT CURRENT_TIMESTAMP)
2. **ROLES**(`role_id` PK, `role_name` UK NN, `description`)
3. **USER_ROLES**(`user_id` PK/FK → USERS.user_id ON DELETE CASCADE, `role_id` PK/FK → ROLES.role_id ON DELETE CASCADE, `assigned_at` NN DEFAULT CURRENT_TIMESTAMP). PK(`user_id`, `role_id`).
4. **COMPANIES**(`company_id` PK, `cik` UK NN, `ticker` UK NN, `company_name` NN, `sector` NN, `industry` NN)
5. **INSIDERS**(`insider_id` PK, `full_name` NN, `sec_person_cik` UK NULLABLE)
6. **COMPANY_INSIDER_ROLES**(`role_assignment_id` PK, `insider_id` FK → INSIDERS.insider_id ON DELETE CASCADE NN, `company_id` FK → COMPANIES.company_id ON DELETE CASCADE NN, `title` NN, `is_officer` NN DEFAULT FALSE, `is_board_director` NN DEFAULT FALSE, `start_date` NN, `end_date` NULLABLE, CK end_date IS NULL OR end_date >= start_date, UK(`insider_id`,`company_id`,`title`,`start_date`))
7. **SEC_FILINGS**(`filing_id` PK, `company_id` FK → COMPANIES.company_id ON DELETE CASCADE NN, `accession_number` UK NN, `filing_date` NN, `report_period` NN)
8. **INSIDER_TRANSACTIONS**(`transaction_id` PK, `filing_id` FK → SEC_FILINGS.filing_id ON DELETE CASCADE NN, `role_assignment_id` FK → COMPANY_INSIDER_ROLES.role_assignment_id ON DELETE RESTRICT NN, `transaction_date` NN, `transaction_code` NN CK IN ('P','S'), `shares_traded` NN CK > 0, `price_per_share` NN CK >= 0, `total_value` GEN STORED as shares_traded * price_per_share, `created_at` NN DEFAULT CURRENT_TIMESTAMP)
9. **DAILY_PRICES**(`company_id` PK/FK → COMPANIES.company_id ON DELETE CASCADE NN, `price_date` PK NN, `open_price` NN CK >= 0, `high_price` NN CK >= 0, `low_price` NN CK >= 0, `close_price` NN CK >= 0, `adj_close` NN CK >= 0, `volume` NN CK >= 0). PK(`company_id`, `price_date`).
10. **INSTITUTIONS**(`institution_id` PK, `cik` UK NN, `institution_name` NN, `manager_name`)
11. **INSTITUTIONAL_HOLDINGS**(`institution_id` PK/FK → INSTITUTIONS.institution_id ON DELETE CASCADE NN, `company_id` PK/FK → COMPANIES.company_id ON DELETE CASCADE NN, `report_date` PK NN, `shares_held` NN CK >= 0, `market_value` NN CK >= 0, `percentage_held` NULLABLE CK between 0 and 100). PK(`institution_id`, `company_id`, `report_date`).
12. **USER_WATCHLIST**(`user_id` PK/FK → USERS.user_id ON DELETE CASCADE NN, `company_id` PK/FK → COMPANIES.company_id ON DELETE CASCADE NN, `added_at` NN DEFAULT CURRENT_TIMESTAMP, `notes`). PK(`user_id`, `company_id`).
13. **AUDIT_LOGS**(`log_id` PK, `table_name` NN, `action_type` NN CK IN ('INSERT','UPDATE','DELETE'), `record_id` NN, `performed_by` FK → USERS.user_id ON DELETE SET NULL, `action_timestamp` NN DEFAULT CURRENT_TIMESTAMP, `old_values` JSONB, `new_values` JSONB).

## Required trigger

`trg_validate_transaction_integrity` BEFORE INSERT OR UPDATE on INSIDER_TRANSACTIONS:
- Resolve `filing_id` to its `company_id`.
- Resolve `role_assignment_id` to its `company_id`, `start_date`, and `end_date`.
- Reject if filing company and role company differ.
- Reject if transaction_date is before start_date or after non-null end_date.
- Raise clear exceptions for missing referenced rows.

See `schema-review.md` for the design decisions to agree before implementation.
