const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'studentreg.db');

// Open connection to SQLite file database
const connection = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to local SQLite database:', err.message);
    } else {
        // Enable foreign key constraints in SQLite
        connection.run('PRAGMA foreign_keys = ON;', (pragmaErr) => {
            if (pragmaErr) {
                console.error('Error enabling foreign keys:', pragmaErr.message);
            }
        });
    }
});

const establishConnection = (conn) => {
    console.log('Database connection established!');
};

const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        // db.all executes query and returns all matching rows (for SELECT)
        // or executes writing queries (for INSERT/UPDATE/DELETE)
        connection.all(sql, params, (error, rows) => {
            if (error) {
                return reject(error);
            }
            resolve(rows);
        });
    });
};

const commitQuery = (sql, params = []) => {
    return query(sql, params);
};

const endConnection = () => {
    connection.close((err) => {
        if (err) {
            console.error('Error ending the connection: ' + err.stack);
            return;
        }
        console.log('Connection ended successfully.');
    });
};

module.exports = {
    connection,
    establishConnection,
    query,
    commitQuery,
    endConnection,
};
