const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'studentreg.db');
const sqlPath = path.join(__dirname, 'STUDENTREG.sql');

// Delete old database file for a clean start on initialization
if (fs.existsSync(dbPath)) {
    try {
        fs.unlinkSync(dbPath);
        console.log('Deleted existing database file to reinitialize.');
    } catch (err) {
        console.warn('Could not delete existing db file, proceeding anyway:', err.message);
    }
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('Connected to SQLite database.');
});

// Read and execute the SQL file
const sql = fs.readFileSync(sqlPath, 'utf8');

db.exec(sql, (err) => {
    if (err) {
        console.error('Error executing SQL script:', err.message);
        db.close();
        process.exit(1);
    }
    console.log('Database schema and seed data initialized successfully.');
    db.close((closeErr) => {
        if (closeErr) {
            console.error('Error closing database:', closeErr.message);
        } else {
            console.log('Database connection closed.');
        }
    });
});
