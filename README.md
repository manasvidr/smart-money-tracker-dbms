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

**Member 2 – NoSQL, Backend, Frontend and Authentication**

Responsible for:
- **NoSQL / MongoDB Layer**: Implemented Python automation (`mongodb/`) for collection initialization with JSON Schema validation and compound indexes. Ingested raw SEC Form 4 XML/JSON filings linked to MySQL via unique `accession_number`. Built and tested CRUD operations script.
- **Backend Architecture**: Built layered Next.js 16 API routes (`routes -> controllers -> services -> config`) with parameterized SQL queries (`mysql2/promise`) and connection pooling.
- **Authentication & Roles**: Implemented secure registration and login using `bcryptjs` password hashing and stateless HMAC-SHA256 JWT tokens stored in `httpOnly` cookies. Enforced Role-Based Access Control (RBAC) with `ADMIN` and `ANALYST` roles.
- **DML Operations**: Built user Watchlist feature demonstrating all 3 core DML operations: `INSERT` (add company), `UPDATE` (modify thesis note), and `DELETE` (remove company).
- **Trigger Integration**: Connected and demonstrated the `AFTER UPDATE` audit trigger on `insider_transactions`, populating before-and-after JSON snapshots into `audit_logs` viewable on an Admin-only audit page.
- **Stored Function Integration**: Integrated MySQL stored function `fn_calculate_return` to compute and display a 30-day percentage return market signal on company profiles.
- **Frontend User Interface**: Built clean, plain CSS client components for Dashboard, Companies Directory, Company Details, Insider Trades Ledger, Institutional Holdings (13F), Watchlist, and Cross-Database SEC Filing Inspector.

---

## Setup & Running Instructions

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v26)
- **Python**: v3.9+ (tested on Python 3.15)
- **MySQL**: 8.0+
- **MongoDB**: 6.0+

### 2. MySQL Database Setup
Start the MySQL service and load the relational database schema and seed files:

```bash
# Create database and tables
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS smart_money_tracker;"
mysql -u root -p smart_money_tracker < database/schema.sql
mysql -u root -p smart_money_tracker < database/sample_data.sql

# Load auxiliary data, stored functions and triggers
mysql -u root -p smart_money_tracker < database/daily_prices.sql
mysql -u root -p smart_money_tracker < database/insider_transactions.sql
mysql -u root -p smart_money_tracker < database/institutional_holdings.sql
mysql -u root -p smart_money_tracker < database/transaction_owners.sql
mysql -u root -p smart_money_tracker < database/stored_functions.sql
mysql -u root -p smart_money_tracker < database/audit_trigger.sql
mysql -u root -p smart_money_tracker < database/audit_update_delete_triggers.sql
mysql -u root -p smart_money_tracker < database/transaction_validation_trigger.sql
```

### 3. MongoDB Setup & Ingestion
Start the MongoDB daemon, set up the Python virtual environment, create the collection with schema validator, and ingest filings:

```bash
cd mongodb
python3 -m venv venv
source venv/bin/activate    # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment credentials (copy and edit if password needed)
cp .env.example .env

# Create collection with JSON schema validator & indexes
python create_collection.py

# Ingest SEC filings matched to MySQL accession numbers
python insert_filings.py

# (Optional) Verify CRUD operations
python crud_operations.py
```

### 4. Frontend & Backend Application
From the repository root:

```bash
cd frontend
npm install

# Configure environment variables
cp .env.example .env.local

# Provision an administrator account (arg: password)
node scripts/create_admin.js admin123

# Start development server
npm run dev
```

Visit **`http://localhost:3000`** in your browser.

- **Admin Account**: Username `admin`, Password `admin123`
- **Analyst Registration**: Navigate to `/register` to create a new analyst account.


