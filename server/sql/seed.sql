INSERT INTO categories (name) VALUES ('Electronics'), ('Clothing'), ('Books'), ('Home') ON CONFLICT (name) DO NOTHING;

INSERT INTO products (name, description, price, image_url, stock_quantity, category_id) VALUES
('Wireless Headphones', 'Bluetooth over-ear headphones', 1999.00, 'https://picsum.photos/seed/headphones/400/300', 25, (SELECT id FROM categories WHERE name='Electronics')),
('Smart Watch', 'Fitness tracking and notifications', 2999.00, 'https://picsum.photos/seed/watch/400/300', 15, (SELECT id FROM categories WHERE name='Electronics')),
('Power Bank 10000mAh', 'Fast-charging portable battery', 899.00, 'https://picsum.photos/seed/powerbank/400/300', 40, (SELECT id FROM categories WHERE name='Electronics')),
('Cotton T-Shirt', 'Soft everyday t-shirt', 499.00, 'https://picsum.photos/seed/tshirt/400/300', 60, (SELECT id FROM categories WHERE name='Clothing')),
('Denim Jacket', 'Classic blue denim jacket', 1799.00, 'https://picsum.photos/seed/jacket/400/300', 20, (SELECT id FROM categories WHERE name='Clothing')),
('Running Shoes', 'Lightweight and breathable', 2299.00, 'https://picsum.photos/seed/shoes/400/300', 30, (SELECT id FROM categories WHERE name='Clothing')),
('Clean Code', 'A handbook of software craftsmanship', 599.00, 'https://picsum.photos/seed/cleancode/400/300', 35, (SELECT id FROM categories WHERE name='Books')),
('Atomic Habits', 'Build good habits, break bad ones', 399.00, 'https://picsum.photos/seed/habits/400/300', 50, (SELECT id FROM categories WHERE name='Books')),
('Desk Lamp', 'LED lamp with adjustable brightness', 799.00, 'https://picsum.photos/seed/lamp/400/300', 22, (SELECT id FROM categories WHERE name='Home')),
('Water Bottle 1L', 'Insulated steel bottle', 449.00, 'https://picsum.photos/seed/bottle/400/300', 45, (SELECT id FROM categories WHERE name='Home'));
