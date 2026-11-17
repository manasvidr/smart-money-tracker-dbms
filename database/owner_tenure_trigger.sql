USE smart_money_tracker;

DROP TRIGGER IF EXISTS trg_validate_owner_tenure;

DELIMITER $$

CREATE TRIGGER trg_validate_owner_tenure
BEFORE INSERT ON transaction_owners
FOR EACH ROW
BEGIN
    DECLARE d DATE;
    DECLARE s DATE;
    DECLARE e DATE;

    SELECT transaction_date INTO d
    FROM insider_transactions
    WHERE transaction_id = NEW.transaction_id;

    SELECT start_date, end_date INTO s, e
    FROM company_insider_roles
    WHERE role_assignment_id = NEW.role_assignment_id;

    IF d < s OR (e IS NOT NULL AND d > e) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Transaction date is outside insider role tenure';
    END IF;
END$$

DELIMITER ;
