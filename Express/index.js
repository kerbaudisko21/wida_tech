import express from 'express';
import mysql from 'mysql2/promise'; // Updated to use mysql2 for promises
import dotenv from 'dotenv';
import fs from 'fs';
import invoiceRoute from './routes/invoice.js';

dotenv.config();
const app = express();
app.use(express.json());

const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    connectTimeout: 10000,
};

const initializeDatabase = async () => {
    try {
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
        });

        console.log('Connected to MySQL server.');

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
        console.log(`Database "${dbConfig.database}" ensured.`);

        await connection.changeUser({ database: dbConfig.database });

        const schema = fs.readFileSync('schema.sql', 'utf8');
        const statements = schema.split(';').filter(statement => statement.trim());

        for (const statement of statements) {
            await connection.query(statement + ';');
        }

        await connection.end();
    } catch (error) {
        console.error('Error initializing database:', error.message);
    }
};

initializeDatabase().then(() => {
    app.listen(8800, () => {
        console.log('Connected to backend!');
    });
});

export const db = mysql.createPool(dbConfig);

app.use('/api/invoice', invoiceRoute);
