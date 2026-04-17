----------------- transactions -----------------
--------------------- user creation related ------------------------
-- manages the types of users: student, admin, director
CREATE OR REPLACE FUNCTION create_user(
    p_u_name VARCHAR,
    p_last_name VARCHAR,
    p_password VARCHAR,
    p_type VARCHAR,
    p_email VARCHAR,
    p_phone VARCHAR
)
RETURNS VOID AS $$
DECLARE
    new_user_id INT;
BEGIN
    INSERT INTO users (u_name, last_name, u_password, u_type)
    VALUES (p_u_name, p_last_name, p_password, p_type)
    RETURNING id INTO new_user_id;

    INSERT INTO user_email (u_id, email)
    VALUES (new_user_id, p_email);

    INSERT INTO user_phone_number (u_id, p_number)
    VALUES (new_user_id, p_phone);

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;
-------------------------------------------------------------------------------------------

--------------------- transaction for the creation of the professor ------------------------
-- manages the creation of professors, which are a specific type of user with additional attributes

CREATE OR REPLACE FUNCTION create_profesor(
    p_u_name VARCHAR,
    p_last_name VARCHAR,
    p_password VARCHAR,
    p_email VARCHAR,
    p_phone VARCHAR,
    p_biography VARCHAR,
    p_years_of_experience INT,
    p_billing_information VARCHAR
)
RETURNS VOID AS $$
DECLARE
    new_user_id INT;
BEGIN
    INSERT INTO users (u_name, last_name, u_password, u_type)
    VALUES (p_u_name, p_last_name, p_password, 'profesor')
    RETURNING id INTO new_user_id;

    INSERT INTO user_email (u_id, email)
    VALUES (new_user_id, p_email);

    INSERT INTO user_phone_number (u_id, p_number)
    VALUES (new_user_id, p_phone);

    INSERT INTO profesor (id, biography, years_of_experience, billing_information)
    VALUES (new_user_id, p_biography, p_years_of_experience, p_billing_information);

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;
-------------------------------------------------------------------------------------------

---------------------- transaction for the creation of the coreography ------------------------

CREATE OR REPLACE FUNCTION create_coreography(
    p_c_name VARCHAR,
    p_image_url VARCHAR,
    p_c_description VARCHAR,
    p_dificulty_level VARCHAR,
    p_song_name VARCHAR,
    p_song_genre VARCHAR,
    p_price DECIMAL(10, 2),
    p_profesor_id INT,
    p_assistent_profesor_id INT,
    p_video_names VARCHAR[],
    p_video_urls VARCHAR[]
)
RETURNS VOID AS $$
DECLARE
    new_coreography_id INT;
    i INT;
BEGIN
    INSERT INTO coreography (c_name, image_url, c_description, dificulty_level, song_name, song_genre, price, profesor_id, assistent_profesor_id)
    VALUES (p_c_name, p_image_url, p_c_description, p_dificulty_level, p_song_name, p_song_genre, p_price, p_profesor_id, p_assistent_profesor_id)
    RETURNING coreography_id INTO new_coreography_id;

    FOR i IN 1..array_length(p_video_names, 1) LOOP
        INSERT INTO video (video_name, video_url, coreography_id)
        VALUES (p_video_names[i], p_video_urls[i], new_coreography_id);
    END LOOP;

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;
-------------------------------------------------------------------------------------------

----------------------- transaction for the cart ------------------------
-- manages the addition of coreographies to the cart, which is a temporary state before purchase
CREATE OR REPLACE FUNCTION add_to_cart(
    p_u_id INT,
    p_coreography_id INT,
    p_unit_price DECIMAL(10,2)
)
RETURNS VOID AS $$
DECLARE
    existing_cart_id INT;
BEGIN
    SELECT cart_id INTO existing_cart_id
    FROM shopping_cart
    WHERE u_id = p_u_id AND s_status = 'active'
    LIMIT 1;

    IF existing_cart_id IS NULL THEN
        INSERT INTO shopping_cart (u_id)
        VALUES (p_u_id)
        RETURNING cart_id INTO existing_cart_id;
    END IF;

    INSERT INTO cart_item (cart_id, coreography_id, unit_price)
    VALUES (existing_cart_id, p_coreography_id, p_unit_price);

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;
-------------------------------------------------------------------------------------------

----------------------- transaction for the purchase ------------------------

CREATE OR REPLACE FUNCTION create_purchase(
    p_u_id INT,
    p_cart_id INT,
    p_payment_method VARCHAR,
    p_email_address VARCHAR,
    p_titular_name VARCHAR,
    p_document_number VARCHAR,
    p_details VARCHAR
)
RETURNS VOID AS $$
DECLARE
    new_purchase_id INT;
    total DECIMAL(10, 2);
    item RECORD;
BEGIN
    -- calculate total from cart items
    SELECT SUM(unit_price) INTO total
    FROM cart_item
    WHERE cart_id = p_cart_id;

    -- create the purchase
    INSERT INTO purchase (cart_id)
    VALUES (p_cart_id)
    RETURNING purchase_id INTO new_purchase_id;

    -- create the bill
    INSERT INTO bill (purchase_id, total_amount, payment_method, email_address, titular_name, document_number, details)
    VALUES (new_purchase_id, total, p_payment_method, p_email_address, p_titular_name, p_document_number, p_details);

    -- give the user access to each coreography in the cart
    FOR item IN
        SELECT coreography_id FROM cart_item WHERE cart_id = p_cart_id
    LOOP
        INSERT INTO user_coreography (u_id, coreography_id, purchase_id)
        VALUES (p_u_id, item.coreography_id, new_purchase_id);

        -- increment times_sold
        UPDATE coreography
        SET times_sold = times_sold + 1
        WHERE coreography_id = item.coreography_id;
    END LOOP;

    -- mark cart as completed
    UPDATE shopping_cart
    SET s_status = 'completed'
    WHERE cart_id = p_cart_id;

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;
-------------------------------------------------------------------------------------------