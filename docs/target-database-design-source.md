# Supplied Target Design — Source Notes

This document summarizes the supplied *database_schema_and_er_diagram_v2.pdf* and October 31 composite-key verification screenshot. Retain the original PDF and screenshot as the visual source records.

The target ER model contains 13 entities:
USERS, ROLES, USER_ROLES, COMPANIES, INSIDERS, COMPANY_INSIDER_ROLES, SEC_FILINGS, INSIDER_TRANSACTIONS, DAILY_PRICES, INSTITUTIONS, INSTITUTIONAL_HOLDINGS, USER_WATCHLIST and AUDIT_LOGS.

The supplied verification matrix identifies these composite keys:
- DAILY_PRICES: (company_id, price_date)
- INSTITUTIONAL_HOLDINGS: (institution_id, company_id, report_date)
- USER_ROLES: (user_id, role_id)
- USER_WATCHLIST: (user_id, company_id)

The target includes user/role assignments, user watchlists, company/insider role assignments with tenure, SEC filing records and parsed transactions, company daily OHLCV prices, institutional holdings at report dates, and audit logs.

The target integrity trigger is intended to ensure that an insider transaction's filing company and role-assignment company agree, and that the transaction date is within the role assignment's tenure.

**Important:** this target design is separate from the existing four-table prototype DDL in `sql/schema.sql`.
