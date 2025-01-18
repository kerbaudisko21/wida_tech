CREATE TABLE IF NOT EXISTS Invoices (
    invoice_no VARCHAR(255) NOT NULL UNIQUE,
    DATE DATE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    salesperson_name VARCHAR(255) NOT NULL,
    payment_type ENUM('CASH', 'CREDIT') NOT NULL,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS Products (
    invoice_no VARCHAR(255) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    total_cost_of_goods_sold DECIMAL(10, 2) NOT NULL,
    total_price_sold DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (invoice_no) REFERENCES Invoices(invoice_no) ON DELETE CASCADE
);
