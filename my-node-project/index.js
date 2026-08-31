const express = require('express');

const app = express();

app.get('/api/get', (req, res) => {
    res.json({
        message: 'This is a GET request!'
    });
});

app.post('/api/post', (req, res) => {
    res.json({
        message: 'This is a POST request!'
    });
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});