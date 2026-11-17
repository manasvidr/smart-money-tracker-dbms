# Member 2: Architecture & Implementation Notes

**Author:** Member 2 (NoSQL, Backend, Frontend & Authentication)  
**Project:** Smart Money Tracker — Academic DBMS Project

---

## 1. Technology Justification

### Why MySQL for Structured Relationships
The core domain of this project involves rigid entities and critical transactional guarantees:
- **ACID Transactions & Referential Integrity**: Transactions such as user watchlist additions, insider role assignments, and stock price histories require strict foreign key constraints (`ON DELETE CASCADE`, `ON DELETE RESTRICT`) and composite primary keys (e.g. `(user_id, company_id)` on `user_watchlist`).
- **Complex Relational Analytics**: Analyzing insider trades requires multi-table joins across `insider_transactions`, `transaction_owners`, `company_insider_roles`, `insiders`, and `companies`. MySQL handles these relational queries, CTEs, and window functions efficiently with index-backed join plans.
- **In-Engine Business Logic**: Triggers for automated auditing (`audit_logs`) and stored functions for quantitative signal calculations (`fn_calculate_return`) execute directly within MySQL, guaranteeing business rules remain enforced regardless of client implementation.

### Why MongoDB for Raw SEC Filings
SEC Form 4 filings present characteristics poorly suited to tabular relational schemas:
- **Variable-Schema & Nested Structures**: Form 4 documents contain unpredictable numbers of transaction line-items, non-derivative tables, derivative exercise schedules, and narrative footnotes that vary drastically from one issuer to another.
- **Large Text Payloads**: Storing the complete original XML submission text (`raw_xml`) inside relational tables bloats page caches and degrades index performance for standard analytical queries.
- **Document-Oriented Ingestion**: MongoDB enables ingesting the raw submission and its parsed representation as a single, self-contained BSON document with embedded arrays and nested objects. Schema validators enforce basic document cleanliness while maintaining polymorphic flexibility.

### Why Next.js API Routes (Unified Full-Stack)
- **Eliminates Architecture Fragmentation**: Rather than maintaining a detached Express or Flask microservice, Next.js API routes colocates the backend with the App Router frontend. Both run on a single Node.js runtime on port 3000.
- **Zero CORS Complexity**: Because the browser accesses both the web application and the `/api/*` endpoints from the same origin, cross-origin resource sharing (CORS) preflights and session leakage issues are avoided.
- **Secure Server-Side Execution**: Environment credentials (`MYSQL_PASSWORD`, `MONGO_URI`, `JWT_SECRET`) and database pools are isolated on the server; the client browser never interacts directly with either database.

---

## 2. Application Architecture

The system follows a strict layered architecture:

```
[ Browser / Client Components ]
              │  HTTP Fetch (Cookies included)
              ▼
    [ Next.js API Routes ]  (app/api/*)
              │  Calls Controller
              ▼
       [ Controllers ]      (lib/controllers/*)
              │  - Reads JWT Cookie via getUser()
              │  - Enforces Role-Based Access via checkAccess()
              │  - Validates Request Payload
              ▼
        [ Services ]        (lib/services/*)
              │  - Runs Parameterized Queries (? placeholders)
              │  - Invokes Stored Functions
              │  - Performs Mongo Aggregations
              ▼
   ┌──────────────────────┬──────────────────────┐
   ▼                      ▼                      ▼
[ MySQL 8 Connection ]  [ MongoDB Connection ]  [ JSON Web Token ]
(mysql2 connection pool) (MongoClient client)   (HS256 Cookies)
```

### Flow of a Request
1. **User Interaction**: An Analyst clicks "Add to Watchlist" on `/companies/1`.
2. **Route Layer**: `POST /api/watchlist` receives the request and delegates execution to `watchlistController.addWatchlist()`.
3. **Controller Layer**: The controller calls `getUser()`, which decodes and validates the `token` cookie using the server-side `JWT_SECRET`. It runs `checkAccess(user, ["ADMIN", "ANALYST"])`. If verified, it extracts `user.user_id`.
4. **Service Layer**: The controller invokes `watchlistService.addToWatchlist(user.user_id, company_id, notes)`.
5. **Database Execution**: The service issues an `INSERT INTO user_watchlist (user_id, company_id, notes) VALUES (?, ?, ?)` to the shared MySQL pool.

---

## 3. Authentication & Role-Based Access Control (RBAC)

### User Identity & Security
- **Bcrypt Password Hashing**: User passwords are never saved in plaintext. During registration (`/api/auth/register`) or admin provisioning (`create_admin.js`), passwords are salted and hashed using `bcryptjs` with a work factor of 10 (`$2b$10$...`).
- **Stateless JWT Sessions**: Upon successful login, the server signs an HMAC-SHA256 JSON Web Token containing `{ user_id, username, roles }` expiring in 2 hours.
- **HTTP-Only Cookies**: Tokens are issued via `Set-Cookie: token=...; HttpOnly; Path=/; Max-Age=7200`. Storing tokens in `httpOnly` cookies protects the session against Cross-Site Scripting (XSS) attacks, as JavaScript code running in the browser cannot read the cookie.

### Role Differentiation
Two application roles are stored in the MySQL `roles` table:
1. **ANALYST**:
   - Access to Dashboard, Company directory, historical prices, insider transactions, institutional holdings, and SEC filings.
   - Authorized to manage personal watchlist items (DML INSERT, UPDATE, DELETE).
   - **Forbidden** from modifying SEC filing documents or inspecting the system audit trail (returns HTTP 403 Forbidden).
2. **ADMIN**:
   - Holds all permissions of an Analyst.
   - Authorized to update filing status (`PATCH /api/filings/[accession]`) and remove filings (`DELETE /api/filings/[accession]`).
   - Authorized to access the Database Audit Trail (`GET /api/audit-logs`) and trigger manual database auditing actions.

Role authorization is strictly enforced at the API controller layer using `checkAccess(user, allowedRoles)`. Frontend UI hiding is merely a user-experience convenience; unauthorized direct HTTP API attempts are rejected with 401 or 403 status codes.

---

## 4. Cross-Database Key Linkage (`accession_number`)

The relational database (MySQL) and the document database (MongoDB) operate collaboratively through a shared natural key: **the SEC Accession Number**.

```
  MySQL (Relational)                            MongoDB (Document)
┌───────────────────────────────┐              ┌─────────────────────────────────┐
│ Table: sec_filings            │              │ Collection: raw_sec_filings     │
│ ----------------------------- │              │ ------------------------------- │
│ filing_id (PK)                │              │ _id (ObjectId)                  │
│ company_id (FK -> companies)  │              │ accession_number (Unique Index) ◄─── JOIN KEY
│ accession_number (UNIQUE) ────┼──────────────┼─► accession_number              │
│ filing_date                   │   Linked by  │ issuer_ticker                   │
│ report_period                 │   Accession  │ issuer_cik                      │
└───────────────────────────────┘     Number   │ raw_xml (<ownershipDocument>)   │
                                               │ parsed ({ transactions: [...] })│
                                               │ parsed_status (PENDING, PARSED) │
                                               └─────────────────────────────────┘
```

### Why this design is effective:
1. **Zero Redundancy for High-Volume Text**: Large XML strings remain exclusively inside MongoDB, keeping the MySQL InnoDB buffer pool lean for rapid indexing and analytical joins.
2. **ACID Referential Integrity**: Relational tables (`insider_transactions`, `transaction_owners`) maintain foreign keys back to `sec_filings(filing_id)`, ensuring referential integrity across trades and issuers.
3. **Unified Cross-Database Inspection**: The application endpoint `GET /api/filings/[accession]` performs an asynchronous coordinated fetch:
   - Queries MongoDB by `{ accession_number: accession }` using the unique index.
   - Queries MySQL with `SELECT ... FROM sec_filings JOIN companies ... WHERE accession_number = ?`.
   - Combines both results into a unified inspection view (`/filings/[accession]`), proving seamless hybrid polyglot persistence.
