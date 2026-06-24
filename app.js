const express = require("express");
const mysql = require("mysql2");

const app = express();
const port = process.env.APP_PORT;

// DB connection
// Use a pool (safer for concurrent requests).
// DB credentials and configuration are injected via ConfigMap and Secret.
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.get('/health', (req, res) => {
  res.status(200).send("OK");
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
  console.log(`Server running at http://8.232.9.138`);
});