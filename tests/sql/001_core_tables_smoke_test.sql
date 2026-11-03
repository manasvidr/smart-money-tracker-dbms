-- Smoke tests for Migration 001.
-- Run against a disposable PostgreSQL database after applying
-- sql/001_core_tables.sql:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f tests/sql/001_core_tables_smoke_test.sql
--
-- All test data is rolled back. The migration itself is not modified.

BEGIN;

DO $$
DECLARE
    v_user_id BIGINT;
    v_role_id SMALLINT;
    v_company_id BIGINT;
    v_role_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_role_count
    FROM roles
    WHERE role_name IN ('Admin', 'Analyst', 'Viewer');

    IF v_role_count <> 3 THEN
        RAISE EXCEPTION 'Expected Admin, Analyst, and Viewer roles; found %', v_role_count;
    END IF;

    INSERT INTO users (username, email, password_hash)
    VALUES ('migration_smoke_user', 'migration-smoke@example.invalid', 'test-only-not-a-real-hash')
    RETURNING user_id INTO v_user_id;

    SELECT role_id INTO v_role_id FROM roles WHERE role_name = 'Viewer';

    INSERT INTO user_roles (user_id, role_id)
    VALUES (v_user_id, v_role_id);

    -- Composite PK must reject assigning the same role twice.
    BEGIN
        INSERT INTO user_roles (user_id, role_id)
        VALUES (v_user_id, v_role_id);
        RAISE EXCEPTION 'Expected duplicate USER_ROLES key to fail';
    EXCEPTION WHEN unique_violation THEN
        NULL;
    END;

    -- FK must reject a mapping to a nonexistent user and role.
    BEGIN
        INSERT INTO user_roles (user_id, role_id)
        VALUES (-900000001, -9);
        RAISE EXCEPTION 'Expected USER_ROLES foreign-key violation';
    EXCEPTION WHEN foreign_key_violation THEN
        NULL;
    END;

    INSERT INTO companies (cik, ticker, company_name, sector, industry)
    VALUES ('0000000001', 'SMTTEST', 'Migration Smoke Test Company', 'Unknown', 'Unknown')
    RETURNING company_id INTO v_company_id;

    IF NOT EXISTS (
        SELECT 1 FROM companies
        WHERE company_id = v_company_id
          AND sector = 'Unknown'
          AND industry = 'Unknown'
    ) THEN
        RAISE EXCEPTION 'Company insert/read-back failed';
    END IF;

    -- CIK format constraint must reject a non-10-digit identifier.
    BEGIN
        INSERT INTO companies (cik, ticker, company_name, sector, industry)
        VALUES ('123', 'BADCIK', 'Invalid CIK Company', 'Unknown', 'Unknown');
        RAISE EXCEPTION 'Expected invalid CIK format to fail';
    EXCEPTION WHEN check_violation THEN
        NULL;
    END;

    -- NOT NULL constraints must reject missing sector values.
    BEGIN
        INSERT INTO companies (cik, ticker, company_name, sector, industry)
        VALUES ('0000000002', 'NULLSECT', 'Null Sector Company', NULL, 'Unknown');
        RAISE EXCEPTION 'Expected NULL sector to fail';
    EXCEPTION WHEN not_null_violation THEN
        NULL;
    END;

    -- Canonical uppercase ticker constraint must reject lowercase tickers.
    BEGIN
        INSERT INTO companies (cik, ticker, company_name, sector, industry)
        VALUES ('0000000003', 'lower', 'Lowercase Ticker Company', 'Unknown', 'Unknown');
        RAISE EXCEPTION 'Expected lowercase ticker to fail';
    EXCEPTION WHEN check_violation THEN
        NULL;
    END;

    RAISE NOTICE 'Migration 001 smoke tests passed.';
END
$$;

ROLLBACK;
