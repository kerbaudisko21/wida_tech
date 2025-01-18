import mysql from 'mysql2/promise';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
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

        console.log('Database schema initialized.');
        await connection.end();
    } catch (error) {
        console.error('Error initializing database:', error.message);
    }
};

initializeDatabase();
