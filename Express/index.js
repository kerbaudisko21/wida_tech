import express from 'express';
import mysql from 'mysql';
import dotenv from 'dotenv';
import invoiceRoute from './routes/invoice.js';

const app = express();
dotenv.config();
app.use(express.json());

const db = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    connectTimeout: 10000,
});

export {db};

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err.message);
        return;
    }
    console.log('Connected to MySQL');
});

app.use('/api/invoice', invoiceRoute);

app.listen(8800, () => {
    console.log('Connected to backend!');
});
