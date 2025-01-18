import { validationResult } from 'express-validator';
import { db } from '../index.js';
import xlsx from 'xlsx';
import { excelDateToJsDate, convertDateFormat, formatDateToDDMMYYYY } from '../utils/dateFormat.js';

const executeQuery = (query, values) => {
    return new Promise((resolve, reject) => {
        db.query(query, values, (err, result) => {
            if (err) {
                reject({ success: false, message: err.message });
            }
            resolve(result);
        });
    });
};

const checkInvoiceExistsInDb = async (invoiceNoFormatted) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT COUNT(*) AS count FROM invoices WHERE invoice_no = ?';
        db.query(query, [invoiceNoFormatted], (err, results) => {
            if (err) {
                reject('Error executing query');
            } else {
                resolve(results[0].count > 0);
            }
        });
    });
};

export const createInvoice = async (req, res = null, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res?.status(400).json({
            success: false,
            errors: errors.array().map(err => err.msg),
        });
    }

    let { invoice_no, date, customer_name, salesperson_name, payment_type, notes, products_sold } = req.body;

    date = convertDateFormat(date);

    try {
        const query = 'INSERT INTO invoices (invoice_no, date, customer_name, salesperson_name, payment_type, notes) VALUES (?, ?, ?, ?, ?, ?)';
        await executeQuery(query, [invoice_no, date, customer_name, salesperson_name, payment_type, notes]);

        if (products_sold && products_sold.length > 0) {
            const productQuery = 'INSERT INTO products (invoice_no, item_name, quantity, total_cost_of_goods_sold, total_price_sold) VALUES ?';
            const productValues = products_sold.map(product => [
                invoice_no,
                product.item_name,
                product.quantity,
                product.total_cost_of_goods_sold,
                product.total_price_sold,
            ]);
            await executeQuery(productQuery, [productValues]);
        }

        const response = {
            success: true,
            message: 'Invoice and products created successfully.',
            invoice_no,
        };

        return res?.status(200).json(response) || response;
    } catch (err) {
        const errorMsg = { success: false, message: 'Error creating invoice and products.', error: err.message };
        return res?.status(500).json(errorMsg) || Promise.reject(errorMsg);
    }
};

export const getAllInvoices = async (req, res, next) => {
    try {
        const invoices = await executeQuery('SELECT * FROM Invoices', []);
        if (invoices.length === 0) return res.status(404).json({ success: false, message: 'No invoices found' });

        const invoicesWithProducts = await Promise.all(invoices.map(async (invoice) => {
            const products = await executeQuery('SELECT * FROM Products WHERE invoice_no = ?', [invoice.invoice_no]);
            return {
                invoice: invoice,
                products: products,
            };
        }));

        return res.status(200).json({ success: true, data: invoicesWithProducts });
    } catch (err) {
        next(err);
    }
};

export const getInvoice = async (req, res, next) => {
    const { invoice_no } = req.params;

    try {
        const invoiceResult = await executeQuery('SELECT * FROM Invoices WHERE invoice_no = ?', [invoice_no]);
        if (invoiceResult.length === 0) return res.status(404).json({ success: false, message: 'Invoice not found.' });

        const productsResult = await executeQuery('SELECT * FROM Products WHERE invoice_no = ?', [invoice_no]);

        return res.status(200).json({
            success: true,
            message: 'Invoice fetched successfully',
            data: {
                invoice: invoiceResult[0],
                products: productsResult,
            },
        });
    } catch (err) {
        next(err);
    }
};

export const updateInvoice = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => err.msg),
        });
    }

    const { invoice_no } = req.params;
    const { date, customer_name, salesperson_name, payment_type, notes, products_sold } = req.body;
    const formattedDate = date ? convertDateFormat(date) : undefined;

    try {
        const invoiceExists = await executeQuery('SELECT * FROM Invoices WHERE invoice_no = ?', [invoice_no]);
        if (invoiceExists.length === 0) return res.status(404).json({ success: false, message: 'Invoice not found.' });

        const updates = [];
        if (formattedDate) updates.push(`date = '${formattedDate}'`);
        if (customer_name) updates.push(`customer_name = '${customer_name}'`);
        if (salesperson_name) updates.push(`salesperson_name = '${salesperson_name}'`);
        if (payment_type) updates.push(`payment_type = '${payment_type}'`);
        if (notes) updates.push(`notes = '${notes}'`);

        if (updates.length > 0) {
            const updateInvoiceQuery = `UPDATE Invoices SET ${updates.join(', ')} WHERE invoice_no = ?`;
            await executeQuery(updateInvoiceQuery, [invoice_no]);

            if (products_sold) {
                await executeQuery('DELETE FROM Products WHERE invoice_no = ?', [invoice_no]);

                const insertProductQuery = 'INSERT INTO Products (invoice_no, item_name, quantity, total_cost_of_goods_sold, total_price_sold) VALUES (?, ?, ?, ?, ?)';
                for (const product of products_sold) {
                    await executeQuery(insertProductQuery, [invoice_no, product.item_name, product.quantity, product.total_cost_of_goods_sold, product.total_price_sold]);
                }
            }

            return res.status(200).json({ success: true, message: 'Invoice and products updated successfully.' });
        } else {
            return res.status(400).json({ success: false, message: 'No changes detected.' });
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error updating invoice', error: err.message });
    }
};

export const uploadInvoiceFile = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    try {
        const file = req.file.buffer;
        const workbook = xlsx.read(file, { type: 'buffer' });
        const invoiceSheet = workbook.Sheets['invoice'];
        const productSheet = workbook.Sheets['product sold'];

        const invoiceData = xlsx.utils.sheet_to_json(invoiceSheet);
        const productData = xlsx.utils.sheet_to_json(productSheet);

        const validInvoices = [];
        const errorMessages = [];

        const invoiceNumbers = new Set(invoiceData.map(invoice => invoice['invoice no'].toString().trim()));
        const processedInvoiceNumbers = new Set();

        for (let index = 0; index < invoiceData.length; index++) {
            const invoice = invoiceData[index];
            const { 'invoice no': invoice_no, date, customer, salesperson, 'payment type': payment_type, notes } = invoice;

            let formattedDate;

            if (!date) {
                errorMessages.push(`Invoice No ${invoice_no}: Missing date (dd/mm/yyyy format required).`);
            } else {
                if (typeof date === 'number') {
                    const jsDate = excelDateToJsDate(date);
                    formattedDate = formatDateToDDMMYYYY(jsDate);
                } else if (typeof date === 'string') {
                    formattedDate = validateAndFormatDate(date);
                } else {
                    formattedDate = new Date(date);
                    formattedDate = formatDateToDDMMYYYY(formattedDate);
                }

                if (!formattedDate) {
                    errorMessages.push(`Invoice No ${invoice_no}: Invalid date (dd/mm/yyyy format required).`);
                }
            }

            const invoiceNoFormatted = invoice_no ? String(invoice_no).trim() : null;

            if (!invoiceNoFormatted || invoiceNoFormatted.length < 1) {
                errorMessages.push(`Invoice No ${invoice_no}: Invoice number is required and should be a valid text.`);
            } else {
                if (processedInvoiceNumbers.has(invoiceNoFormatted)) {
                    errorMessages.push(`Invoice No ${invoice_no}: Duplicate invoice number.`);
                } else {
                    processedInvoiceNumbers.add(invoiceNoFormatted);

                    const invoiceExistsInDb = await checkInvoiceExistsInDb(invoiceNoFormatted);
                    if (invoiceExistsInDb) {
                        errorMessages.push(`Invoice No ${invoice_no}: Invoice number exists in the database.`);
                    }

                    if (!invoiceNumbers.has(invoiceNoFormatted)) {
                        errorMessages.push(`Invoice No ${invoice_no}: Invoice number not found in the invoice data.`);
                    }
                }
            }

            if (!customer || typeof customer !== 'string' || customer.trim().length < 2) {
                errorMessages.push(`Invoice No ${invoice_no}: Customer name is required and should be at least 2 characters.`);
            }

            if (!salesperson || typeof salesperson !== 'string' || salesperson.trim().length < 2) {
                errorMessages.push(`Invoice No ${invoice_no}: Salesperson name is required and should be at least 2 characters.`);
            }

            if (!['CASH', 'CREDIT'].includes(payment_type)) {
                errorMessages.push(`Invoice No ${invoice_no}: Payment type must be either "CASH" or "CREDIT".`);
            }

            if (notes && typeof notes === 'string' && notes.trim().length < 5) {
                errorMessages.push(`Invoice No ${invoice_no}: Notes should be at least 5 characters long.`);
            }

            if (errorMessages.length === 0) {
                const productsForInvoice = productData
                    .filter(product => product['Invoice no'] && String(product['Invoice no']).trim() === invoiceNoFormatted)
                    .map(product => {
                        const productErrors = [];

                        if (!product.item || typeof product.item !== 'string' || product.item.length < 5) {
                            productErrors.push('Item name must be a string with at least 5 characters.');
                        }

                        if (!product.quantity || typeof product.quantity !== 'number' || product.quantity < 1) {
                            productErrors.push('Quantity must be a number greater than or equal to 1.');
                        }

                        if (!product['total cogs'] || typeof product['total cogs'] !== 'number' || product['total cogs'] < 0) {
                            productErrors.push('Total cost of goods sold must be a number greater than or equal to 0.');
                        }

                        if (!product['total price'] || typeof product['total price'] !== 'number' || product['total price'] < 0) {
                            productErrors.push('Total price sold must be a number greater than or equal to 0.');
                        }

                        if (productErrors.length > 0) {
                            errorMessages.push(`Invoice No ${invoice_no}, Product: ${product.item} - Errors: ${productErrors.join(', ')}`);
                        }

                        return {
                            item_name: product.item,
                            quantity: product.quantity,
                            total_cost_of_goods_sold: product['total cogs'],
                            total_price_sold: product['total price'],
                        };
                    });

                if (productsForInvoice.length === 0) {
                    errorMessages.push(`Invoice No ${invoice_no}: No products found for this invoice number.`);
                } else {
                    validInvoices.push({
                        invoice_no: invoiceNoFormatted,
                        date: formattedDate,
                        customer_name: customer,
                        salesperson_name: salesperson,
                        payment_type,
                        notes,
                        products_sold: productsForInvoice,
                    });
                }
            }
        }

        productData.forEach(product => {
            const productInvoiceNo = product['Invoice no'] ? product['Invoice no'].toString().trim() : null;
            if (productInvoiceNo && !invoiceNumbers.has(productInvoiceNo)) {
                errorMessages.push(`Invoice No ${productInvoiceNo}: Product can not be inserted due to non-existent invoice number.`);
            }
        });

        if (errorMessages.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Some rows failed validation.',
                errors: errorMessages,
            });
        }

        const results = await Promise.all(
            validInvoices.map(data => createInvoice({ body: data }))
        );

        return res.status(200).json({
            success: true,
            message: 'File processed and invoices created successfully.',
            results,
        });
    } catch (error) {
        console.error('Error processing file:', error);
        return res.status(500).json({
            success: false,
            message: 'Error processing file.',
            error: error.message,
        });
    }
};

export const deleteInvoice = async (req, res, next) => {
    const { invoice_no } = req.params;

    try {
        const invoiceResult = await executeQuery('SELECT * FROM Invoices WHERE invoice_no = ?', invoice_no);
        if (invoiceResult.length === 0) {
            return res.status(404).json({ success: false, message: 'Invoice not found.' });
        }

        await executeQuery('DELETE FROM Products WHERE invoice_no = ?', invoice_no);
        await executeQuery('DELETE FROM Invoices WHERE invoice_no = ?', invoice_no);

        return res.status(200).json({
            success: true,
            message: `Invoice ${invoice_no} and its associated products deleted successfully.`,
        });
    } catch (err) {
        next(err);
    }
};