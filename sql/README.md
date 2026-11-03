# PostgreSQL migrations

Migrations are numbered and applied in order to the PostgreSQL target database.

## Current status

- `001_core_tables.sql`: creates `users`, `roles`, `user_roles`, and `companies`; seeds Admin, Analyst, Viewer.
- `tests/sql/001_core_tables_smoke_test.sql`: verifies role seeds, PK/FK behaviour, CIK format, required sector/industry, and ticker normalization. Test data is rolled back.

## Apply

Use a PostgreSQL 15+ database:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f sql/001_core_tables.sql
```

## Test

Run against a disposable database after applying the migration:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f tests/sql/001_core_tables_smoke_test.sql
```

The migration is a one-time DDL migration. Do not use `CREATE TABLE IF NOT EXISTS` to hide drift in an existing schema. Back up any non-disposable database before applying migrations.

## Conventions

- PostgreSQL identifiers are lowercase snake_case.
- Surrogate IDs use identity columns; `user_roles` uses its agreed composite primary key.
- SEC CIK values are stored as zero-padded 10-character strings.
- Tickers are stored uppercase.
- Sector and industry are required; ingestion must explicitly map unavailable values to `Unknown`.
- Store only a secure password hash in `users.password_hash`.
- Backend authorization must enforce Admin, Analyst, and Viewer permissions.
