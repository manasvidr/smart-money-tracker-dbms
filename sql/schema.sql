-- Prototype v1 schema only. The final 13-table PostgreSQL target is in docs/ and will replace this in Phase 1.
CREATE TABLE IF NOT EXISTS companies (
    cik VARCHAR(10) PRIMARY KEY,
    ticker VARCHAR(10) NOT NULL UNIQUE,
    company_name VARCHAR(255) NOT NULL,
    sector VARCHAR(100),
    industry VARCHAR(100)
);
CREATE TABLE IF NOT EXISTS sec_filings (
    accession_number VARCHAR(25) PRIMARY KEY,
    cik VARCHAR(10) NOT NULL,
    ticker VARCHAR(10) NOT NULL,
    filing_date DATE NOT NULL,
    raw_document_xml TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cik) REFERENCES companies(cik)
);
CREATE INDEX IF NOT EXISTS idx_filings_ticker_date ON sec_filings(ticker, filing_date);
CREATE TABLE IF NOT EXISTS insider_transactions (
    id INTEGER PRIMARY KEY,
    accession_number VARCHAR(25),
    cik VARCHAR(10),
    ticker VARCHAR(10) NOT NULL,
    insider_name VARCHAR(255) NOT NULL,
    insider_title VARCHAR(100) NOT NULL,
    is_board_director BOOLEAN DEFAULT FALSE,
    is_officer BOOLEAN DEFAULT FALSE,
    transaction_date DATE NOT NULL,
    transaction_code CHAR(1) NOT NULL CHECK(transaction_code IN ('P','S')),
    shares_traded NUMERIC(15, 4) NOT NULL,
    price_per_share NUMERIC(12, 4),
    total_transaction_value NUMERIC(18, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cik) REFERENCES companies(cik),
    FOREIGN KEY (accession_number) REFERENCES sec_filings(accession_number)
);
CREATE INDEX IF NOT EXISTS idx_insider_ticker_date ON insider_transactions(ticker, transaction_date);
CREATE INDEX IF NOT EXISTS idx_insider_code ON insider_transactions(transaction_code);
CREATE INDEX IF NOT EXISTS idx_insider_title ON insider_transactions(insider_title);
CREATE TABLE IF NOT EXISTS daily_prices (
    ticker VARCHAR(10) NOT NULL,
    price_date DATE NOT NULL,
    open_price NUMERIC(12,4),
    high_price NUMERIC(12,4),
    low_price NUMERIC(12,4),
    close_price NUMERIC(12,4),
    adj_close NUMERIC(12,4) NOT NULL,
    volume BIGINT,
    PRIMARY KEY (ticker, price_date)
);
CREATE INDEX IF NOT EXISTS idx_prices_ticker_date ON daily_prices(ticker, price_date DESC);
