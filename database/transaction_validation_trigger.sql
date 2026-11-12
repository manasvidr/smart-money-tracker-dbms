
USE smart_money_tracker;

DROP TRIGGER IF EXISTS trg_validate_transaction_dates;

DELIMITER $$

CREATE TRIGGER trg_validate_transaction_dates

BEFORE INSERT ON insider_transactions

FOR EACH ROW

BEGIN

    DECLARE v_start_date DATE;
    DECLARE v_end_date DATE;

    SELECT
        r.start_date,
        r.end_date

    INTO
        v_start_date,
        v_end_date

    FROM transaction_owners o

    JOIN company_insider_roles r
        ON o.role_assignment_id = r.role_assignment_id
        AND o.company_id = r.company_id

    WHERE o.transaction_id = NEW.transaction_id
    AND o.company_id = NEW.company_id
    LIMIT 1;

    IF v_start_date IS NOT NULL
       AND (
           NEW.transaction_date < v_start_date
           OR (
               v_end_date IS NOT NULL
               AND NEW.transaction_date > v_end_date
           )
       )
    THEN

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT =
        'Transaction date is outside insider role tenure';

    END IF;

END$$

DELIMITER ;
