
USE smart_money_tracker;

-- =========================================
-- TRIGGER 2: AFTER UPDATE
-- =========================================

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


-- =========================================
-- TRIGGER 3: AFTER DELETE
-- =========================================

DROP TRIGGER IF EXISTS trg_audit_insider_transactions_delete;

DELIMITER $$

CREATE TRIGGER trg_audit_insider_transactions_delete

AFTER DELETE ON insider_transactions

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
        'DELETE',
        CAST(OLD.transaction_id AS CHAR),
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

        NULL
    );

END$$

DELIMITER ;
