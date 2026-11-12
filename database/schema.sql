
-- ============================================================
-- SMART MONEY TRACKER
-- Relational Database Schema
-- DBMS: MySQL 8.0.46
-- Team Member 1: Database Engineering and SQL
-- Total relational tables: 14
-- ============================================================

USE smart_money_tracker;

-- ------------------------------------------------------------
-- TABLE 1: USERS
-- Stores application user information
-- ------------------------------------------------------------

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- ------------------------------------------------------------
-- TABLE 2: ROLES
-- Stores application roles such as ADMIN and ANALYST
-- ------------------------------------------------------------

CREATE TABLE roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
) ENGINE=InnoDB;


-- ------------------------------------------------------------
-- TABLE 3: COMPANIES
-- Stores publicly traded company information
-- ------------------------------------------------------------

CREATE TABLE companies (
    company_id INT AUTO_INCREMENT PRIMARY KEY,
    cik VARCHAR(10) NOT NULL UNIQUE,
    ticker VARCHAR(10) NOT NULL UNIQUE,
    company_name VARCHAR(255) NOT NULL,
    sector VARCHAR(100),
    industry VARCHAR(100)
) ENGINE=InnoDB;


-- ------------------------------------------------------------
-- TABLE 4: INSIDERS
-- Stores individual insider identities
-- ------------------------------------------------------------

CREATE TABLE insiders (
    insider_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    sec_person_cik VARCHAR(10) UNIQUE
) ENGINE=InnoDB;


-- ------------------------------------------------------------
-- TABLE 5: INSTITUTIONS
-- Stores institutional investors
-- ------------------------------------------------------------

CREATE TABLE institutions (
    institution_id INT AUTO_INCREMENT PRIMARY KEY,
    cik VARCHAR(10) NOT NULL UNIQUE,
    institution_name VARCHAR(255) NOT NULL,
    manager_name VARCHAR(255)
) ENGINE=InnoDB;


-- ------------------------------------------------------------
-- TABLE 6: USER_ROLES
-- Many-to-many relationship between users and roles
-- Composite primary key: user_id + role_id
-- ------------------------------------------------------------

CREATE TABLE user_roles (
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id, role_id),

    CONSTRAINT fk_user_roles_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_user_roles_role
        FOREIGN KEY (role_id)
        REFERENCES roles(role_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;


-- ------------------------------------------------------------
-- TABLE 7: USER_WATCHLIST
-- Many-to-many relationship between users and companies
-- Composite primary key: user_id + company_id
-- ------------------------------------------------------------

CREATE TABLE user_watchlist (
    user_id INT NOT NULL,
    company_id INT NOT NULL,
    added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes VARCHAR(255),

    PRIMARY KEY (user_id, company_id),

    CONSTRAINT fk_watchlist_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_watchlist_company
        FOREIGN KEY (company_id)
        REFERENCES companies(company_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;


-- ------------------------------------------------------------
-- TABLE 8: COMPANY_INSIDER_ROLES
-- Connects insiders with companies and their positions
-- A person can hold multiple company roles over time
-- ------------------------------------------------------------

CREATE TABLE company_insider_roles (
    role_assignment_id INT AUTO_INCREMENT PRIMARY KEY,

    insider_id INT NOT NULL,
    company_id INT NOT NULL,

    title VARCHAR(100) NOT NULL,
    is_officer BOOLEAN NOT NULL DEFAULT FALSE,
    is_board_director BOOLEAN NOT NULL DEFAULT FALSE,

    start_date DATE NOT NULL,
    end_date DATE,

    CONSTRAINT uq_insider_role
        UNIQUE (insider_id, company_id, title, start_date),

    CONSTRAINT uq_role_company
        UNIQUE (role_assignment_id, company_id),

    CONSTRAINT chk_role_dates
        CHECK (end_date IS NULL OR end_date >= start_date),

    CONSTRAINT fk_company_role_insider
        FOREIGN KEY (insider_id)
        REFERENCES insiders(insider_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_company_role_company
        FOREIGN KEY (company_id)
        REFERENCES companies(company_id)
        ON DELETE RESTRICT
) ENGINE=InnoDB;


-- ------------------------------------------------------------
-- TABLE 9: SEC_FILINGS
-- Stores relational metadata about SEC Form 4 filings
-- Raw XML/JSON will be stored separately in MongoDB
-- ------------------------------------------------------------

CREATE TABLE sec_filings (
    filing_id INT AUTO_INCREMENT PRIMARY KEY,

    company_id INT NOT NULL,

    accession_number VARCHAR(25) NOT NULL UNIQUE,

    filing_date DATE NOT NULL,
    report_period DATE,

    CONSTRAINT uq_filing_company
        UNIQUE (filing_id, company_id),

    CONSTRAINT fk_filing_company
        FOREIGN KEY (company_id)
        REFERENCES companies(company_id)
        ON DELETE RESTRICT
) ENGINE=InnoDB;


-- ------------------------------------------------------------
-- TABLE 10: DAILY_PRICES
-- Stores historical daily stock prices
-- Composite primary key: company_id + price_date
-- ------------------------------------------------------------

CREATE TABLE daily_prices (
    company_id INT NOT NULL,
    price_date DATE NOT NULL,

    open_price DECIMAL(12,4) NOT NULL,
    high_price DECIMAL(12,4) NOT NULL,
    low_price DECIMAL(12,4) NOT NULL,
    close_price DECIMAL(12,4) NOT NULL,
    adj_close DECIMAL(12,4) NOT NULL,
    volume BIGINT NOT NULL,

    PRIMARY KEY (company_id, price_date),

    CONSTRAINT chk_open_price
        CHECK (open_price >= 0),

    CONSTRAINT chk_high_price
        CHECK (high_price >= 0),

    CONSTRAINT chk_low_price
        CHECK (low_price >= 0),

    CONSTRAINT chk_close_price
        CHECK (close_price >= 0),

    CONSTRAINT chk_adj_close
        CHECK (adj_close >= 0),

    CONSTRAINT chk_volume
        CHECK (volume >= 0),

    CONSTRAINT chk_price_range
        CHECK (
            high_price >= low_price
            AND high_price >= open_price
            AND high_price >= close_price
            AND low_price <= open_price
            AND low_price <= close_price
        ),

    CONSTRAINT fk_daily_prices_company
        FOREIGN KEY (company_id)
        REFERENCES companies(company_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;


-- ------------------------------------------------------------
-- TABLE 11: INSTITUTIONAL_HOLDINGS
-- Stores quarterly institutional ownership information
-- Composite PK: institution_id + company_id + report_date
-- ------------------------------------------------------------

CREATE TABLE institutional_holdings (
    institution_id INT NOT NULL,
    company_id INT NOT NULL,
    report_date DATE NOT NULL,

    shares_held DECIMAL(18,4) NOT NULL,
    market_value DECIMAL(20,2) NOT NULL,
    percentage_held DECIMAL(5,2),

    PRIMARY KEY (institution_id, company_id, report_date),

    CONSTRAINT chk_shares_held
        CHECK (shares_held >= 0),

    CONSTRAINT chk_market_value
        CHECK (market_value >= 0),

    CONSTRAINT chk_percentage_held
        CHECK (
            percentage_held IS NULL
            OR percentage_held BETWEEN 0 AND 100
        ),

    CONSTRAINT fk_holdings_institution
        FOREIGN KEY (institution_id)
        REFERENCES institutions(institution_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_holdings_company
        FOREIGN KEY (company_id)
        REFERENCES companies(company_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;


-- ------------------------------------------------------------
-- TABLE 12: INSIDER_TRANSACTIONS
-- Stores individual insider purchase/sale transactions
-- Filing and company-specific role integrity is enforced
-- using composite foreign keys.
-- ------------------------------------------------------------

CREATE TABLE insider_transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,

    filing_id INT NOT NULL,
    company_id INT NOT NULL,

    transaction_date DATE NOT NULL,

    transaction_code CHAR(1) NOT NULL,

    shares_traded DECIMAL(15,4) NOT NULL,
    price_per_share DECIMAL(12,4) NOT NULL,

    total_value DECIMAL(18,2)
        GENERATED ALWAYS AS (
            ROUND(shares_traded * price_per_share, 2)
        ) STORED,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_transaction_company
        UNIQUE (transaction_id, company_id),

    CONSTRAINT chk_transaction_code
        CHECK (transaction_code IN ('P', 'S')),

    CONSTRAINT chk_shares_traded
        CHECK (shares_traded > 0),

    CONSTRAINT chk_price_per_share
        CHECK (price_per_share >= 0),

    CONSTRAINT fk_transaction_filing_company
        FOREIGN KEY (filing_id, company_id)
        REFERENCES sec_filings(filing_id, company_id)
        ON DELETE RESTRICT
) ENGINE=InnoDB;


-- ------------------------------------------------------------
-- TABLE 13: TRANSACTION_OWNERS
-- Associates one transaction with one or more reporting owners
-- Composite primary key: transaction_id + role_assignment_id
-- company_id ensures both relationships refer to same company
-- ------------------------------------------------------------

CREATE TABLE transaction_owners (
    transaction_id INT NOT NULL,
    role_assignment_id INT NOT NULL,
    company_id INT NOT NULL,

    owner_role VARCHAR(30),
    nature_of_ownership VARCHAR(255),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (transaction_id, role_assignment_id),

    CONSTRAINT fk_owner_transaction_company
        FOREIGN KEY (transaction_id, company_id)
        REFERENCES insider_transactions(transaction_id, company_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_owner_role_company
        FOREIGN KEY (role_assignment_id, company_id)
        REFERENCES company_insider_roles(role_assignment_id, company_id)
        ON DELETE RESTRICT
) ENGINE=InnoDB;


-- ------------------------------------------------------------
-- TABLE 14: AUDIT_LOGS
-- Stores database change history
-- JSON columns capture old and new row values
-- ------------------------------------------------------------

CREATE TABLE audit_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,

    table_name VARCHAR(50) NOT NULL,

    action_type VARCHAR(10) NOT NULL,

    record_id VARCHAR(100) NOT NULL,

    performed_by INT,

    action_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    old_values JSON,
    new_values JSON,

    CONSTRAINT chk_audit_action
        CHECK (action_type IN ('INSERT', 'UPDATE', 'DELETE')),

    CONSTRAINT fk_audit_user
        FOREIGN KEY (performed_by)
        REFERENCES users(user_id)
        ON DELETE SET NULL
) ENGINE=InnoDB;


-- ============================================================
-- END OF SMART MONEY TRACKER SCHEMA
-- 14 TABLES CREATED
-- ============================================================
