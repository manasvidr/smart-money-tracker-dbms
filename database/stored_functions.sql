
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

-- TEST 1
SELECT fn_calculate_return(100, 110)
AS percentage_return;

-- TEST 2
SELECT fn_calculate_return(200, 180)
AS percentage_return;

-- TEST 3
SELECT fn_calculate_return(100, 100)
AS percentage_return;

-- TEST 4: Invalid base price
SELECT fn_calculate_return(0, 110)
AS percentage_return;
