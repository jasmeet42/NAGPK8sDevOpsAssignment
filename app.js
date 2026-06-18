const express = require("express");
const mysql = require("mysql2");

const app = express();
const port = 8080;

// DB connection
// Use a pool (safer for concurrent requests). Credentials come from env vars when available.
const db = mysql.createPool({
  host: '34.59.64.121' ,
  user: 'root',
  password: 'my-secret-pw',
  database: 'users_db',
 });

// API endpoint
app.get('/users', (req, res) => {
  console.log('Fetching users from the database...');
  // For demonstration, we return a static list of users. In production, you'd query the database.
  
  db.query('SELECT * FROM users', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});