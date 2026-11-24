INSERT INTO categories (name) VALUES ('Electronics'), ('Clothing'), ('Books'), ('Home') ON CONFLICT (name) DO NOTHING;

INSERT INTO products (name, description, price, image_url, stock_quantity, category_id) VALUES
('Wireless Headphones', 'Bluetooth over-ear headphones', 1999.00, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80', 25, (SELECT id FROM categories WHERE name='Electronics')),
('Smart Watch', 'Fitness tracking and notifications', 2999.00, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80', 15, (SELECT id FROM categories WHERE name='Electronics')),
('Power Bank 10000mAh', 'Fast-charging portable battery', 899.00, 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&q=80', 40, (SELECT id FROM categories WHERE name='Electronics')),
('Cotton T-Shirt', 'Soft everyday t-shirt', 499.00, 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&q=80', 60, (SELECT id FROM categories WHERE name='Clothing')),
('Denim Jacket', 'Classic blue denim jacket', 1799.00, 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=500&q=80', 20, (SELECT id FROM categories WHERE name='Clothing')),
('Running Shoes', 'Lightweight and breathable', 2299.00, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80', 30, (SELECT id FROM categories WHERE name='Clothing')),
('Clean Code', 'A handbook of software craftsmanship', 599.00, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&q=80', 35, (SELECT id FROM categories WHERE name='Books')),
('Atomic Habits', 'Build good habits, break bad ones', 399.00, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&q=80', 50, (SELECT id FROM categories WHERE name='Books')),
('Desk Lamp', 'LED lamp with adjustable brightness', 799.00, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80', 22, (SELECT id FROM categories WHERE name='Home')),
('Water Bottle 1L', 'Insulated steel bottle', 449.00, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&q=80', 45, (SELECT id FROM categories WHERE name='Home'));

INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount) VALUES
('WELCOME10', '10% off your order', 'percent', 10.00, 0.00),
('FREESHIP', 'Free express shipping on any order', 'shipping', 0.00, 0.00),
('SAVE200', 'Flat Rs.200 off orders Rs.1499+', 'fixed', 200.00, 1499.00)
ON CONFLICT (code) DO NOTHING;
