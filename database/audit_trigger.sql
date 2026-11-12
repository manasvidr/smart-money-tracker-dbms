
USE smart_money_tracker;

DROP TRIGGER IF EXISTS trg_audit_insider_transactions;

DELIMITER $$

CREATE TRIGGER trg_audit_insider_transactions

AFTER INSERT ON insider_transactions

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
        'INSERT',
        CAST(NEW.transaction_id AS CHAR),
        NULL,
        CURRENT_TIMESTAMP,
        NULL,

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
