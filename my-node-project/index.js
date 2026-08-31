const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3000;

// Enable parsing of JSON bodies and serve static client files
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ----------------------------------------------------
// STUDENTS API (CRUD)
// ----------------------------------------------------

// 1. READ: Fetch all students
app.get('/api/students', (req, res) => {
    db.query('SELECT * FROM STUDENT ORDER BY SID DESC')
        .then(results => {
            res.json(results);
        })
        .catch(error => {
            console.error('Error fetching students:', error);
            res.status(500).json({ error: 'Failed to fetch students' });
        });
});

// 2. CREATE: Add a new student
app.post('/api/students', (req, res) => {
    const { SName, Gender, Birthday, Major } = req.body;
    if (!SName) {
        return res.status(400).json({ error: 'Student name is required' });
    }

    const sql = 'INSERT INTO STUDENT (SName, Gender, Birthday, Major) VALUES (?, ?, ?, ?)';
    db.query(sql, [SName, Gender, Birthday, Major])
        .then(() => {
            // Get the inserted ID
            return db.query('SELECT last_insert_rowid() as id');
        })
        .then(results => {
            const newId = results[0].id;
            res.status(201).json({ message: 'Student added successfully', id: newId });
        })
        .catch(error => {
            console.error('Error adding student:', error);
            res.status(500).json({ error: 'Failed to add student' });
        });
});

// 3. UPDATE: Update an existing student's details
app.put('/api/students/:id', (req, res) => {
    const { id } = req.params;
    const { SName, Gender, Birthday, Major } = req.body;
    if (!SName) {
        return res.status(400).json({ error: 'Student name is required' });
    }

    const sql = 'UPDATE STUDENT SET SName = ?, Gender = ?, Birthday = ?, Major = ? WHERE SID = ?';
    db.query(sql, [SName, Gender, Birthday, Major, id])
        .then(results => {
            res.json({ message: 'Student updated successfully' });
        })
        .catch(error => {
            console.error('Error updating student:', error);
            res.status(500).json({ error: 'Failed to update student' });
        });
});

// 4. DELETE: Remove a student
app.delete('/api/students/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM STUDENT WHERE SID = ?';
    db.query(sql, [id])
        .then(() => {
            res.json({ message: 'Student deleted successfully' });
        })
        .catch(error => {
            console.error('Error deleting student:', error);
            res.status(500).json({ error: 'Failed to delete student' });
        });
});


// ----------------------------------------------------
// MODULES API
// ----------------------------------------------------

// READ: Fetch all available modules
app.get('/api/modules', (req, res) => {
    db.query('SELECT * FROM MODULE ORDER BY MName ASC')
        .then(results => {
            res.json(results);
        })
        .catch(error => {
            console.error('Error fetching modules:', error);
            res.status(500).json({ error: 'Failed to fetch modules' });
        });
});


// ----------------------------------------------------
// ENROLLMENTS API (CRUD)
// ----------------------------------------------------

// 1. READ: Fetch all student enrollments
app.get('/api/enrollments', (req, res) => {
    const sql = `
        SELECT E.SID, E.MID, E.EnrollDate, S.SName, M.MName, M.Credits
        FROM STUDENT_ENROLEMENT E
        JOIN STUDENT S ON E.SID = S.SID
        JOIN MODULE M ON E.MID = M.MID
        ORDER BY E.EnrollDate DESC
    `;
    db.query(sql)
        .then(results => {
            res.json(results);
        })
        .catch(error => {
            console.error('Error fetching enrollments:', error);
            res.status(500).json({ error: 'Failed to fetch enrollments' });
        });
});

// 2. CREATE: Enroll a student in a module
app.post('/api/enrollments', (req, res) => {
    const { SID, MID, EnrollDate } = req.body;
    if (!SID || !MID) {
        return res.status(400).json({ error: 'Student ID and Module ID are required' });
    }

    const dateStr = EnrollDate || new Date().toISOString().split('T')[0];
    const sql = 'INSERT INTO STUDENT_ENROLEMENT (SID, MID, EnrollDate) VALUES (?, ?, ?)';
    db.query(sql, [SID, MID, dateStr])
        .then(() => {
            res.status(201).json({ message: 'Student enrolled successfully' });
        })
        .catch(error => {
            console.error('Error enrolling student:', error);
            if (error.message && error.message.includes('UNIQUE constraint failed')) {
                res.status(409).json({ error: 'Student is already enrolled in this module.' });
            } else {
                res.status(500).json({ error: 'Failed to enroll student' });
            }
        });
});

// 3. UPDATE: Change enrollment module ID (like the slide's example)
app.put('/api/enrollments/:sid/:mid', (req, res) => {
    const { sid, mid } = req.params;
    const { newMID } = req.body;
    if (!newMID) {
        return res.status(400).json({ error: 'New Module ID is required' });
    }

    const sql = 'UPDATE STUDENT_ENROLEMENT SET MID = ? WHERE SID = ? AND MID = ?';
    db.query(sql, [newMID, sid, mid])
        .then(() => {
            res.json({ message: 'Enrollment updated successfully' });
        })
        .catch(error => {
            console.error('Error updating enrollment:', error);
            if (error.message && error.message.includes('UNIQUE constraint failed')) {
                res.status(409).json({ error: 'Student is already enrolled in the new module.' });
            } else {
                res.status(500).json({ error: 'Failed to update enrollment' });
            }
        });
});

// 4. DELETE: Cancel student enrollment
app.delete('/api/enrollments/:sid/:mid', (req, res) => {
    const { sid, mid } = req.params;
    const sql = 'DELETE FROM STUDENT_ENROLEMENT WHERE SID = ? AND MID = ?';
    db.query(sql, [sid, mid])
        .then(() => {
            res.json({ message: 'Enrollment cancelled successfully' });
        })
        .catch(error => {
            console.error('Error cancelling enrollment:', error);
            res.status(500).json({ error: 'Failed to cancel enrollment' });
        });
});


// Start server
app.listen(PORT, () => {
    console.log(`Express server running on http://localhost:${PORT}`);
});