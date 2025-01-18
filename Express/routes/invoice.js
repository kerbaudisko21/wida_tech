import express from 'express';
import { validateInvoice, validateUpdateInvoice, validateUploadFile } from '../utils/validation.js';
import { createInvoice, deleteInvoice, getAllInvoices, getInvoice, updateInvoice, uploadInvoiceFile } from '../controllers/invoice.js';
import { uploadFile } from '../middleware/upload.js';

const router = express.Router();

router.post('/add', validateInvoice, createInvoice);

router.delete('/delete/:invoice_no', deleteInvoice);

router.post('/update/:invoice_no', validateUpdateInvoice, updateInvoice);

router.get('/', getAllInvoices);
router.get('/detail/:invoice_no', getInvoice);

router.post('/upload', uploadFile, validateUploadFile, uploadInvoiceFile);

export default router;