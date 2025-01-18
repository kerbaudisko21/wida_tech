import { body } from 'express-validator';
import { db } from '../index.js';

export const validateInvoice = [
    body('invoice_no')
        .isString()
        .trim()
        .isLength({ min: 1 })
        .withMessage('Invoice number is required.')
        .custom((value) => {
            return new Promise((resolve, reject) => {
                const query = 'SELECT COUNT(*) AS count FROM invoices WHERE invoice_no = ?';

                db.query(query, [value], (err, result) => {
                    if (err) {
                        return reject(new Error('Database connection error. Please try again later.'));
                    }
                    if (result[0].count > 0) {
                        return reject(new Error('Invoice number already exists.'));
                    }
                    resolve(true);
                });
            });
        }),

    body('date')
        .matches(/^\d{2}\/\d{2}\/\d{4}$/)
        .withMessage('Date must be in dd/mm/yyyy format.')
        .bail()
        .custom((value) => {
            const [day, month, year] = value.split('/').map(Number);
            const isValidDate = !isNaN(Date.parse(`${year}-${month}-${day}`)) &&
                month >= 1 && month <= 12 &&
                day >= 1 && day <= 31;
            if (!isValidDate) {
                throw new Error('Invalid date value.');
            }
            return true;
        }),

    body('customer_name')
        .isString()
        .trim()
        .isLength({ min: 2 })
        .withMessage('Customer name must be at least 2 characters.'),

    body('salesperson_name')
        .isString()
        .trim()
        .isLength({ min: 2 })
        .withMessage('Salesperson name must be at least 2 characters.'),

    body('payment_type')
        .isIn(['CASH', 'CREDIT'])
        .withMessage('Payment type must be CASH or CREDIT.'),

    body('notes')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 5 })
        .withMessage('Notes must be at least 5 characters if provided.'),

    body('products_sold')
        .isArray({ min: 1 })
        .withMessage('Products must not be empty')
        .bail()
        .custom((products) => {
            products.forEach((product, index) => {
                if (!product.item_name || typeof product.item_name !== 'string' || product.item_name.length < 5) {
                    throw new Error(`Product at index ${index} must have an item_name of at least 5 characters.`);
                }

                if (!Number.isInteger(product.quantity) || product.quantity < 1) {
                    throw new Error(`Product at index ${index} must have a quantity of at least 1.`);
                }

                if (typeof product.total_cost_of_goods_sold !== 'number' || product.total_cost_of_goods_sold < 0) {
                    throw new Error(`Product at index ${index} must have a total cost of goods sold greater than or equal to 0.`);
                }

                if (typeof product.total_price_sold !== 'number' || product.total_price_sold < 0) {
                    throw new Error(`Product at index ${index} must have a total price sold greater than or equal to 0.`);
                }
            });
            return true;
        }),
];

export const validateUpdateInvoice = [
    body('date')
        .optional()
        .matches(/^\d{2}\/\d{2}\/\d{4}$/)
        .withMessage('Date must be in dd/mm/yyyy format.')
        .bail()
        .custom((value) => {
            if (value) {
                const [day, month, year] = value.split('/').map(Number);
                const isValidDate = !isNaN(Date.parse(`${year}-${month}-${day}`)) &&
                    month >= 1 && month <= 12 &&
                    day >= 1 && day <= 31;
                if (!isValidDate) {
                    throw new Error('Invalid date value.');
                }
            }
            return true;
        }),

    body('customer_name')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 2 })
        .withMessage('Customer name must be at least 2 characters.'),

    body('salesperson_name')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 2 })
        .withMessage('Salesperson name must be at least 2 characters.'),

    body('payment_type')
        .optional()
        .isIn(['CASH', 'CREDIT'])
        .withMessage('Payment type must be CASH or CREDIT.'),

    body('notes')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 5 })
        .withMessage('Notes must be at least 5 characters if provided.'),

    body('products_sold')
        .optional()
        .isArray()
        .withMessage('Products must be an array if provided.')
        .bail()
        .custom((products) => {
            if (products) {
                products.forEach((product, index) => {
                    if (!product.item_name || typeof product.item_name !== 'string' || product.item_name.length < 5) {
                        throw new Error(`Product at index ${index} must have an item_name of at least 5 characters.`);
                    }

                    if (!Number.isInteger(product.quantity) || product.quantity < 1) {
                        throw new Error(`Product at index ${index} must have a quantity of at least 1.`);
                    }

                    if (typeof product.total_cost_of_goods_sold !== 'number' || product.total_cost_of_goods_sold < 0) {
                        throw new Error(`Product at index ${index} must have a total cost of goods sold greater than or equal to 0.`);
                    }

                    if (typeof product.total_price_sold !== 'number' || product.total_price_sold < 0) {
                        throw new Error(`Product at index ${index} must have a total price sold greater than or equal to 0.`);
                    }
                });
            }
            return true;
        }),
];

export const validateUploadFile = [
    body()
        .custom((_, { req }) => {
            if (!req.file) {
                throw new Error('No file uploaded.');
            }
            const validMimeTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
            if (!validMimeTypes.includes(req.file.mimetype)) {
                throw new Error('Invalid file type. Only .xlsx files are allowed.');
            }
            return true;
        }),
];
