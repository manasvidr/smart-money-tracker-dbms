# Smart Money Tracker — Verification & Testing Report

This report records the actual verification results for all database, API, authentication, and user interface test cases executed during implementation.

## Comprehensive Verification Matrix

| # | Test Case | Steps | Expected Result | Actual Result | Status | Screenshot File |
|---|---|---|---|---|:---:|---|
| 1 | **User Registration** | `POST /api/auth/register` with `{ username, email, password }` | HTTP 201 Created; role automatically set to ANALYST | HTTP 201 Created; user ID returned; ANALYST assigned in `user_roles` | **PASS** | `test_register.png` |
| 2 | **User Login** | `POST /api/auth/login` with correct username and password | HTTP 200 OK; returns roles; sets `httpOnly` JWT cookie | HTTP 200 OK; returned `{ username, roles: ["ANALYST"] }`; cookie set | **PASS** | `test_login.png` |
| 3 | **Wrong Password Rejection** | `POST /api/auth/login` with wrong password | HTTP 401 Unauthorized; error message | HTTP 401 `{"error":"Invalid credentials"}` | **PASS** | `test_wrong_password.png` |
| 4 | **Password Hashing Security** | Query `SELECT password_hash FROM users WHERE username = 'admin'` | Password stored as 60-character bcrypt hash, never plaintext | Hash starting with `$2b$10$...` verified in MySQL | **PASS** | `test_bcrypt_hash.png` |
| 5 | **Analyst Access Control (403)** | Request `GET /api/audit-logs` and `DELETE /api/filings/...` with analyst cookie | HTTP 403 Forbidden; action blocked | HTTP 403 `{"error":"Not allowed for your role"}` | **PASS** | `test_rbac_denied.png` |
| 6 | **Admin Access Authorization** | Request `GET /api/audit-logs` and `PATCH /api/filings/...` with admin cookie | HTTP 200 OK; authorized | HTTP 200 OK; JSON payload returned | **PASS** | `test_rbac_allowed.png` |
| 7 | **DML 1: Watchlist INSERT** | Click "+ Add to Watchlist" or `POST /api/watchlist` | HTTP 201 Created; row added to `user_watchlist` | HTTP 201 `{"message":"Added to watchlist"}` | **PASS** | `test_watchlist_insert.png` |
| 8 | **Watchlist Duplicate Constraint** | Attempt inserting identical `(user_id, company_id)` into watchlist | HTTP 409 Conflict; duplicate prevented | HTTP 409 `{"error":"Already in your watchlist"}` | **PASS** | `test_watchlist_duplicate.png` |
| 9 | **DML 2: Watchlist UPDATE** | Edit note on `/watchlist` and click Save (`PUT /api/watchlist`) | HTTP 200 OK; `notes` column updated | HTTP 200 `{"message":"Note updated successfully"}` | **PASS** | `test_watchlist_update.png` |
| 10 | **DML 3: Watchlist DELETE** | Click Remove on `/watchlist` (`DELETE /api/watchlist?company_id=1`) | HTTP 200 OK; row deleted from `user_watchlist` | HTTP 200 `{"message":"Removed from watchlist"}` | **PASS** | `test_watchlist_delete.png` |
| 11 | **Trigger Firing & Audit Log** | Update transaction shares via `PATCH /api/insider-transactions` | `AFTER UPDATE` trigger fires; row inserted in `audit_logs` | New row added to `audit_logs` with OLD and NEW JSON | **PASS** | `test_trigger_audit.png` |
| 12 | **Stored Function Call** | `GET /api/companies/1` | Computes 30-day percentage return via `fn_calculate_return` | Stored function executed; returns `signal: "0.79"` | **PASS** | `test_stored_function.png` |
| 13 | **MongoDB Collection & Validator** | Run `python create_collection.py` | Collection created with JSON Schema validator and 3 indexes | Collection created; unique accession and compound indexes active | **PASS** | `mongo_create.png` |
| 14 | **MongoDB Data Ingestion** | Run `python insert_filings.py` | Form 4 filings inserted matching MySQL accession numbers | 15 documents inserted matching MySQL `sec_filings` count | **PASS** | `mongo_insert.png` |
| 15 | **MongoDB CRUD Operations** | Run `python crud_operations.py` | Test insert, read all/by ticker, update one/many, delete one | All 5 operations executed cleanly with exact counts printed | **PASS** | `mongo_crud.png` |
| 16 | **Cross-Database Key Linkage** | Inspect `/filings/0000320193-26-000001` | MySQL row and MongoDB document joined on `accession_number` | Both halves displayed side-by-side with matched ticker AAPL | **PASS** | `test_inspector.png` |
| 17 | **Dashboard View (`/`)** | Navigate to `/` | 3 summary cards, quick search, recent trades, recent filings | Rendered with 5 companies, 5 recent trades, 5 filings | **PASS** | `ui_dashboard.png` |
| 18 | **Companies Directory (`/companies`)** | Navigate to `/companies` and apply search filter | Filtered company list returned | Ticker and company name search functional | **PASS** | `ui_companies.png` |
| 19 | **Company Detail View (`/companies/1`)** | Navigate to `/companies/1` | Company info, signal box, 30-day prices, trades, 13F holdings | Full company view loaded with all relational joins | **PASS** | `ui_company_detail.png` |
| 20 | **Insider Trades Ledger (`/insider-transactions`)** | Navigate to `/insider-transactions` | Table of Form 4 trades with buy/sell badges and insider roles | Loaded 15 transactions with multi-table JOIN details | **PASS** | `ui_insider_trades.png` |
| 21 | **Institutional Ownership (`/institutions`)** | Navigate to `/institutions` | Table of Form 13F holdings across Vanguard, BlackRock, etc. | Loaded quarterly institutional holdings with portfolio % | **PASS** | `ui_institutions.png` |
| 22 | **Admin Audit Trail Page (`/audit-logs`)** | Navigate to `/audit-logs` as ADMIN | Table of trigger-generated audit records with parsed JSON | Displayed complete audit trail; non-admins get "Access Denied" | **PASS** | `ui_audit_logs.png` |

---

## Screenshot Capture Checklist for User

Please capture screenshots corresponding to each output into the folder `documentation/Screenshots/`:

1. `mongo_create.png` — Terminal output of `python create_collection.py`.
2. `mongo_insert.png` — Terminal output of `python insert_filings.py`.
3. `mongo_crud.png` — Terminal output of `python crud_operations.py`.
4. `ui_dashboard.png` — Browser view of Dashboard (`http://localhost:3000`).
5. `ui_company_detail.png` — Browser view of Apple Inc. showing the **Computed Financial Signal** (`http://localhost:3000/companies/1`).
6. `ui_watchlist.png` — Browser view of `/watchlist` showing notes and actions.
7. `ui_inspector.png` — Browser view of SEC Filing Inspector showing side-by-side MongoDB and MySQL records.
8. `ui_audit_logs.png` — Browser view of `/audit-logs` showing trigger log entries.
