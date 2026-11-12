# Smart Money Tracker

A DBMS-based project for analyzing insider transactions, SEC filings, institutional holdings, and stock market behaviour.

## Project Overview

Smart Money Tracker is designed to analyze insider trading activities and institutional ownership patterns to identify potentially meaningful market signals.

The system combines relational database management, advanced SQL analytics, stored procedures, stored functions, triggers, and audit logging.

## Technology Stack

- **Database:** MySQL 8.0.46
- **Storage Engine:** InnoDB
- **Query Language:** SQL
- **Advanced SQL:** Joins, subqueries, CTEs, recursive CTEs, window functions
- **Database Programming:** Stored procedures, stored functions, triggers
- **Data Format:** JSON

## Database Design

The relational database consists of **14 tables**:

1. USERS
2. ROLES
3. COMPANIES
4. INSIDERS
5. INSTITUTIONS
6. USER_ROLES
7. USER_WATCHLIST
8. COMPANY_INSIDER_ROLES
9. SEC_FILINGS
10. DAILY_PRICES
11. INSTITUTIONAL_HOLDINGS
12. INSIDER_TRANSACTIONS
13. TRANSACTION_OWNERS
14. AUDIT_LOGS

The database uses primary keys, foreign keys, composite keys, unique constraints, check constraints, and generated columns to maintain data integrity.

## Database Implementation

The `database/` directory contains the SQL implementation:

| File | Description |
|---|---|
| schema.sql | Creates the 14 relational tables |
| sample_data.sql | Inserts sample project data |
| daily_prices.sql | Generates historical stock price data |
| insider_transactions.sql | Insider transaction operations |
| institutional_holdings.sql | Institutional holdings operations |
| transaction_owners.sql | Associates transactions with reporting owners |
| dml_operations.sql | INSERT, UPDATE, DELETE and transaction operations |
| join_queries.sql | Multi-table JOIN queries |
| nested_correlated_queries.sql | Nested and correlated subqueries |
| recursive_cte.sql | Recursive Common Table Expressions |
| window_functions.sql | ROW_NUMBER, RANK, DENSE_RANK, LAG and LEAD |
| forward_returns.sql | Forward stock-return analysis |
| stored_procedures.sql | Stored procedure implementation |
| stored_functions.sql | Stored function implementation |
| audit_trigger.sql | INSERT audit trigger |
| audit_update_delete_triggers.sql | UPDATE and DELETE audit triggers |
| transaction_validation_trigger.sql | Transaction validation trigger |

## Key Database Features

- 14-table relational database design.
- Referential integrity through primary and foreign keys.
- Composite primary and foreign keys.
- Generated transaction values.
- Advanced SQL analytical queries.
- Recursive CTEs and window functions.
- Stored procedures and stored functions.
- Triggers for audit logging and transaction validation.
- JSON-based audit records.

## Project Documentation

- `docs/relational-schema-final.md` — Relational schema documentation.
- `docs/schema-review-final.md` — Database design decisions and integrity rules.
- `docs/chen-er-diagram-final.dot` — Chen ER diagram source.

## Implementation Status

The MySQL database implementation includes the 14-table schema and a collection of SQL scripts covering database operations, analytics, stored programs, and triggers.

Execution testing, validation of all database constraints, and integration with the application are part of the remaining verification work.

## Team Contribution

**Member 1 – Database Engineering and SQL**

Responsible for relational database design, schema creation, constraints, SQL queries, stored procedures, stored functions, triggers, and database testing.

