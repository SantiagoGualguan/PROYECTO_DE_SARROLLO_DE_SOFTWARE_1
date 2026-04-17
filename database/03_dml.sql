-- ============================================
-- DML - Test Data
-- ============================================

-- Users (one of each type)
INSERT INTO users (u_name, last_name, u_password, u_type, validated) VALUES
--- The password is the same for all users: "admin123"
('Carlos', 'Ramirez', 'pbkdf2_sha256$600000$46oZgIiNjIAoFKR71Ca9wz$BwOK1/IFhRncJAwz8PyUQbY0hmZCRserE55oOJc4T30=', 'admin', TRUE),
('Maria', 'Lopez', 'pbkdf2_sha256$600000$46oZgIiNjIAoFKR71Ca9wz$BwOK1/IFhRncJAwz8PyUQbY0hmZCRserE55oOJc4T30=', 'director', TRUE),
('Juan', 'Torres', 'pbkdf2_sha256$600000$46oZgIiNjIAoFKR71Ca9wz$BwOK1/IFhRncJAwz8PyUQbY0hmZCRserE55oOJc4T30=', 'profesor', TRUE),
('Ana', 'Garcia', 'pbkdf2_sha256$600000$46oZgIiNjIAoFKR71Ca9wz$BwOK1/IFhRncJAwz8PyUQbY0hmZCRserE55oOJc4T30=', 'profesor', TRUE),
('Luis', 'Martinez', 'pbkdf2_sha256$600000$46oZgIiNjIAoFKR71Ca9wz$BwOK1/IFhRncJAwz8PyUQbY0hmZCRserE55oOJc4T30=', 'client', TRUE),
('Sofia', 'Herrera', 'pbkdf2_sha256$600000$46oZgIiNjIAoFKR71Ca9wz$BwOK1/IFhRncJAwz8PyUQbY0hmZCRserE55oOJc4T30=', 'client', FALSE);

-- Emails
INSERT INTO user_email (u_id, email) VALUES
(1, 'carlos.admin@dancelearn.com'),
(2, 'maria.director@dancelearn.com'),
(3, 'juan.profesor@dancelearn.com'),
(4, 'ana.profesor@dancelearn.com'),
(5, 'luis.client@dancelearn.com'),
(6, 'sofia.client@dancelearn.com');

-- Phone numbers
INSERT INTO user_phone_number (u_id, p_number) VALUES
(1, '3001234567'),
(2, '3007654321'),
(3, '3009876543'),
(4, '3001112233'),
(5, '3004445566'),
(6, '3007778899');

-- Profesors (users 3 and 4 are profesors)
INSERT INTO profesor (id, biography, years_of_experience, billing_information) VALUES
(3, 'Especialista en salsa y bachata con 10 años de experiencia.', 10, 'Bancolombia 123456789'),
(4, 'Bailarina profesional de hip-hop y pop.', 7, 'Nequi 987654321');

-- Coreographies
INSERT INTO coreography (c_name, image_url, c_description, dificulty_level, song_name, song_genre, price, profesor_id, assistent_profesor_id) VALUES
('Salsa Básica', 'https://example.com/salsa.jpg', 'Aprende los pasos básicos de salsa.', 'basic', 'La Bicicleta', 'salsa', 25000.00, 3, NULL),
('Bachata Romántica', 'https://example.com/bachata.jpg', 'Coreografía romántica de bachata.', 'intermediate', 'Propuesta Indecente', 'bachata', 35000.00, 4, 3),
('Hip-Hop Urbano', 'https://example.com/hiphop.jpg', 'Pasos avanzados de hip-hop urbano.', 'advanced', 'Con Calma', 'hip_hop', 45000.00, 3, 4);

-- Videos
INSERT INTO video (video_name, video_url, coreography_id) VALUES
('Intro Salsa', 'https://youtube.com/embed/salsa1', 1),
('Pasos Básicos Salsa', 'https://youtube.com/embed/salsa2', 1),
('Intro Bachata', 'https://youtube.com/embed/bachata1', 2),
('Giros Bachata', 'https://youtube.com/embed/bachata2', 2),
('Intro Hip-Hop', 'https://youtube.com/embed/hiphop1', 3);

-- Shopping cart for client Luis
INSERT INTO shopping_cart (u_id) VALUES (5);

-- Cart items
INSERT INTO cart_item (cart_id, coreography_id, unit_price) VALUES
(1, 1, 25000.00),
(1, 2, 35000.00);

-- Purchase
INSERT INTO purchase (cart_id) VALUES (1);

-- Bill
INSERT INTO bill (purchase_id, total_amount, payment_method, email_address, titular_name, document_number, details) VALUES
(1, 60000.00, 'pse', 'luis.client@dancelearn.com', 'Luis Martinez', '1234567890', 'Compra de coreografías salsa y bachata');

-- User coreography access
INSERT INTO user_coreography (u_id, coreography_id, purchase_id) VALUES
(5, 1, 1),
(5, 2, 1);

-- Update cart to completed
UPDATE shopping_cart SET s_status = 'completed' WHERE cart_id = 1;

-- Update times_sold
UPDATE coreography SET times_sold = 1 WHERE coreography_id IN (1, 2);