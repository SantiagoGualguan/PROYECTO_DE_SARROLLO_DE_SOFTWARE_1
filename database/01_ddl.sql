--------------- User ---------------
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    u_name VARCHAR(50)  NOT NULL,
    last_name VARCHAR(50)  NOT NULL,
    u_password VARCHAR(255) NOT NULL,
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, --- creation date
    u_type VARCHAR(25) CHECK (u_type IN ('admin', 'director', 'profesor', 'client')),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    validated BOOLEAN DEFAULT FALSE
);

----------------- contact relations ------------------------
CREATE TABLE user_email (
    email_id SERIAL PRIMARY KEY,
    u_id INT REFERENCES users(id),
    email VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE user_phone_number(
    p_number_id SERIAL PRIMARY KEY,
    u_id INT REFERENCES users(id),
    p_number VARCHAR(15) UNIQUE NOT NULL
);
---- one user can have many emails and phone numbers 
-------------- email & phone number ------------------------ used as logins for users

------------------- profesor ------------------------
CREATE TABLE profesor (
    id INT PRIMARY KEY REFERENCES users(id),
    biography VARCHAR(300),
    years_of_experience INT NOT NULL,
    billing_information VARCHAR(100)

);

-------------------- coreography ------------------------
CREATE TABLE coreography (

    coreography_id SERIAL PRIMARY KEY,
    c_name VARCHAR(100) NOT NULL,
    image_url VARCHAR(255),
    c_description VARCHAR(500),
    dificulty_level VARCHAR(30) CHECK (dificulty_level IN ('basic', 'intermediate', 'advanced')),
    song_name VARCHAR(100),
    song_genre VARCHAR(50),
    price DECIMAL(10, 2) NOT NULL,
    times_sold INT NOT NULL DEFAULT 0,
    profesor_id INT REFERENCES profesor(id),
    assistent_profesor_id INT REFERENCES profesor(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')), -- active, inactive (inactive if the coreography is deleted)
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

------------------- video ------------------------
CREATE TABLE video (
    video_id SERIAL PRIMARY KEY,
    video_name VARCHAR(100) NOT NULL,
    video_url VARCHAR(255) NOT NULL,
    coreography_id INT REFERENCES coreography(coreography_id),
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

------------------- shopping cart logic ------------------------
------------------- shopping cart ------------------------
CREATE TABLE shopping_cart (
    cart_id SERIAL PRIMARY KEY,
    u_id INT REFERENCES users(id),
    s_status VARCHAR(20) DEFAULT 'active' CHECK (s_status IN ('active', 'completed', 'cancelled')), -- active, completed, cancelled
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

------------------- cart item ------------------------
CREATE TABLE cart_item (
    cart_item_id SERIAL PRIMARY KEY,
    cart_id INT REFERENCES shopping_cart(cart_id),
    coreography_id INT REFERENCES coreography(coreography_id),
    unit_price DECIMAL(10, 2) NOT NULL,
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-------------------- purchase ------------------------
CREATE TABLE purchase (
    purchase_id SERIAL PRIMARY KEY,
    cart_id INT REFERENCES shopping_cart(cart_id),
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    transaction_id VARCHAR(100) UNIQUE -- for payment gateway reference (future use)
);

-------------------- user coreography ------------------------
CREATE TABLE user_coreography (
    u_id INT REFERENCES users(id),
    coreography_id INT REFERENCES coreography(coreography_id),
    purchase_id INT REFERENCES purchase(purchase_id),
    PRIMARY KEY (u_id, coreography_id)
);---- one user can have many coreography (helps to track which coreography a user has access to)

--------------------- bill ------------------------
CREATE TABLE bill (
    bill_id SERIAL PRIMARY KEY,
    purchase_id INT REFERENCES purchase(purchase_id),
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) CHECK (payment_method IN ('pse', 'card')),
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    email_address VARCHAR(100) NOT NULL,
    titular_name VARCHAR(100) NOT NULL,
    document_number VARCHAR(50) NOT NULL,
    details VARCHAR(300)
);
