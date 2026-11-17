# Smart Money Tracker — Viva & Demonstration Script (Member 2)

This script is prepared for the project viva and demonstration. It presents the exact code, SQL queries, triggers, and stored function implemented and integrated by Member 2, alongside a rapid 2-minute demonstration walkthrough.

---

## 1. DML Operation 1: INSERT (Add to Watchlist)

### Implementation Code (`frontend/lib/services/watchlistService.js`)
```javascript
// DML 1: INSERT a company into the watchlist.
export async function addToWatchlist(userId, companyId, notes) {
  await pool.query(
    "INSERT INTO user_watchlist (user_id, company_id, notes) VALUES (?, ?, ?)",
    [userId, companyId, notes || null]
  );
}
```

### Raw SQL Statement
```sql
INSERT INTO user_watchlist (user_id, company_id, notes)
VALUES (?, ?, ?);
```

### Explanation for Viva
When a logged-in user clicks "+ Add to Watchlist" on a company page, the frontend issues a `POST /api/watchlist` request. The API controller extracts `user_id` securely from the verified JWT cookie (preventing impersonation) and invokes `addToWatchlist`. This executes an `INSERT` statement into the `user_watchlist` junction table with parameterized inputs to guard against SQL injection. If the user attempts to add the same company twice, MySQL raises an `ER_DUP_ENTRY` error due to the composite primary key `(user_id, company_id)`, which our controller catches and returns as an HTTP 409 Conflict.

---

## 2. DML Operation 2: UPDATE (Edit Watchlist Note)

### Implementation Code (`frontend/lib/services/watchlistService.js`)
```javascript
// DML 2: UPDATE the note on a watchlist entry.
export async function updateNote(userId, companyId, notes) {
  const [res] = await pool.query(
    "UPDATE user_watchlist SET notes = ? WHERE user_id = ? AND company_id = ?",
    [notes, userId, companyId]
  );
  return res.affectedRows;
}
```

### Raw SQL Statement
```sql
UPDATE user_watchlist
   SET notes = ?
 WHERE user_id = ? AND company_id = ?;
```

### Explanation for Viva
On the `/watchlist` page, each company entry displays an editable note input. When the user modifies their thesis or remark and clicks "Save", a `PUT /api/watchlist` request sends the updated note text. The service executes an `UPDATE` statement targeting the composite key `(user_id, company_id)`. The function inspects `res.affectedRows` to confirm that the row was modified, providing immediate visual feedback in the UI without needing a full page reload.

---

## 3. DML Operation 3: DELETE (Remove from Watchlist)

### Implementation Code (`frontend/lib/services/watchlistService.js`)
```javascript
// DML 3: DELETE a company from the watchlist.
export async function removeFromWatchlist(userId, companyId) {
  const [res] = await pool.query(
    "DELETE FROM user_watchlist WHERE user_id = ? AND company_id = ?",
    [userId, companyId]
  );
  return res.affectedRows;
}
```

### Raw SQL Statement
```sql
DELETE FROM user_watchlist
 WHERE user_id = ? AND company_id = ?;
```

### Explanation for Viva
When an analyst clicks the "Remove" button next to a company on `/watchlist`, the browser sends a `DELETE /api/watchlist?company_id=<id>` request. The service runs a parameterized `DELETE` query filtered by both `user_id` and `company_id`. This cleanly deletes the row from the relational database while leaving all core records (`users` and `companies`) completely intact due to the junction table architecture.

---

## 4. The Database Trigger (Audit Logging)

### Trigger Definition (`database/audit_update_delete_triggers.sql`)
```sql
USE smart_money_tracker;

DROP TRIGGER IF EXISTS trg_audit_insider_transactions_update;

DELIMITER $$

CREATE TRIGGER trg_audit_insider_transactions_update
AFTER UPDATE ON insider_transactions
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs
    (
        table_name,
        action_type,
        record_id,
        performed_by,
        action_timestamp,
        old_values,
        new_values
    )
    VALUES
    (
        'insider_transactions',
        'UPDATE',
        CAST(NEW.transaction_id AS CHAR),
        NULL,
        CURRENT_TIMESTAMP,
        JSON_OBJECT(
            'transaction_id', OLD.transaction_id,
            'company_id', OLD.company_id,
            'transaction_date', OLD.transaction_date,
            'transaction_code', OLD.transaction_code,
            'shares_traded', OLD.shares_traded,
            'price_per_share', OLD.price_per_share,
            'total_value', OLD.total_value
        ),
        JSON_OBJECT(
            'transaction_id', NEW.transaction_id,
            'company_id', NEW.company_id,
            'transaction_date', NEW.transaction_date,
            'transaction_code', NEW.transaction_code,
            'shares_traded', NEW.shares_traded,
            'price_per_share', NEW.price_per_share,
            'total_value', NEW.total_value
        )
    );
END$$

DELIMITER ;
```

### Explanation for Viva
- **When it fires**: It is an `AFTER UPDATE` row-level trigger that executes automatically inside the MySQL database engine immediately following any successful update to a record in `insider_transactions`.
- **What it writes into `audit_logs`**: It inserts a complete audit record containing the table name (`insider_transactions`), action type (`UPDATE`), the record's primary key, a timestamp, and two JSON columns capturing the full before-and-after row states.
- **Meaning of `OLD` and `NEW`**: In MySQL triggers, `OLD` refers to the column values prior to the UPDATE operation, while `NEW` contains the values after modification. Using `JSON_OBJECT`, the trigger serializes both snapshots into structured JSON.
- **Trigger demonstration in UI**: From the Insider Trades page, an administrator can edit the shares traded on a transaction. Saving the change fires this trigger, immediately surfacing the audit event on the Admin Audit Log page.

### Sample Row Produced During Testing (from `audit_logs`)
| Field | Recorded Value |
|---|---|
| `log_id` | `1` |
| `table_name` | `insider_transactions` |
| `action_type` | `UPDATE` |
| `record_id` | `1` |
| `action_timestamp` | `2026-11-13 03:09:48` |
| `old_values` | `{"company_id": 1, "price_per_share": 153.3300, "shares_traded": 500.0000, "total_value": 76665.00, "transaction_code": "P", "transaction_date": "2026-01-12", "transaction_id": 1}` |
| `new_values` | `{"company_id": 1, "price_per_share": 153.3300, "shares_traded": 600.0000, "total_value": 91998.00, "transaction_code": "P", "transaction_date": "2026-01-12", "transaction_id": 1}` |

---

## 5. The Stored Function (Signal Calculation)

### Function Definition (`database/stored_functions.sql`)
```sql
USE smart_money_tracker;

DROP FUNCTION IF EXISTS fn_calculate_return;

DELIMITER $$

CREATE FUNCTION fn_calculate_return(
    p_base_price DECIMAL(12,4),
    p_future_price DECIMAL(12,4)
)
RETURNS DECIMAL(10,2)
DETERMINISTIC
NO SQL
BEGIN
    IF p_base_price IS NULL
       OR p_future_price IS NULL
       OR p_base_price <= 0 THEN
        RETURN NULL;
    END IF;

    RETURN ROUND(
        ((p_future_price - p_base_price)
        / p_base_price) * 100,
        2
    );
END$$

DELIMITER ;
```

### Explanation for Viva
- **Parameters**: `p_base_price` (starting price) and `p_future_price` (ending price), both defined as `DECIMAL(12,4)`.
- **Return value**: Returns a `DECIMAL(10,2)` representing the percentage return between the two price points rounded to two decimal places, or `NULL` if prices are missing or invalid.
- **Application integration**: In `frontend/lib/services/companyService.js`, the company endpoint computes a 30-day price momentum signal by querying:
```javascript
const [sigRows] = await pool.query(
  "SELECT fn_calculate_return(?, ?) AS signal_value",
  [baseClose, latestClose]
);
signal = sigRows[0]?.signal_value ?? null;
```
This return signal (e.g. `+0.79%`) is prominently displayed inside the "Computed Financial Signal" card on the company details page.

---

## 6. Two-Minute Viva Demonstration Order

Follow this exact sequence to demonstrate all required project marks in 2 minutes:

1. **Register**: Navigate to `http://localhost:3000/register`. Create a new analyst account (`demo_analyst`, `demo@smt.local`, password `demo123`). Show that all newly registered users default to the **ANALYST** role.
2. **Login**: Log in at `/login`. The system sets an `httpOnly` JWT session cookie. Point out that the Navbar reflects the user's role and conceals the "Audit Log" link from analysts.
3. **Company Page & Stored Function**: Open `/companies` and click **Apple Inc. (AAPL)**. Point to the **Computed Financial Signal** card displaying `+0.79%` — this proves real-time invocation of the MySQL stored function `fn_calculate_return`.
4. **DML 1 (INSERT)**: In the "Track in Watchlist" box on the company page, type note *"Breakout candidate"* and click **"+ Add to Watchlist"**. Show the success message. Try clicking again to demonstrate constraint handling (409 Conflict: *"Already in your watchlist"*).
5. **DML 2 (UPDATE)**: Go to `/watchlist`. Notice Apple Inc. is listed. Change the note to *"Q3 earnings upside"* and click **"Save"**. Show the instant confirmation ("Saved!").
6. **DML 3 (DELETE)**: Click **"Remove"** on the watchlist item and confirm. The item disappears from the table, completing all 3 DML operations.
7. **Admin Login**: Click **Logout**. Log in as `admin` (password `admin123`). The Navbar now displays `admin (ADMIN)` and reveals the **Audit Log** navigation link.
8. **Trigger Demonstration**: Go to `/insider-transactions`. Find Transaction #1, click **"Edit Shares"**, change `500` to `650`, and click **"Save & Fire Trigger"**. Navigate to `/audit-logs` to reveal the newly generated row in `audit_logs` with before-and-after JSON — proving the `AFTER UPDATE` trigger fired automatically.
9. **NoSQL MongoDB & MySQL Match**: Navigate to `/filings`. Click **"Inspect Document"** on filing `0000320193-26-000001`. Point to the split-screen view:
   - **Left**: Raw SEC XML and parsed JSON from MongoDB `raw_sec_filings`.
   - **Right**: Normalized relational metadata from MySQL `sec_filings`.
   - Point out that both databases are joined on `accession_number`.
   - As Admin, click **"Mark as PARSED"** to demonstrate MongoDB `updateOne`.
