const mysql = require('mysql2/promise');

(async () => {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    multipleStatements: false,
  };

  try {
    const conn = await mysql.createConnection(config);

    await conn.query('CREATE DATABASE IF NOT EXISTS nagp_db');
    await conn.changeUser({ database: 'nagp_db' });

    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const [rows] = await conn.query('SELECT COUNT(*) AS cnt FROM users');
    if (rows[0].cnt === 0) {
      await conn.query('INSERT INTO users (name, email) VALUES (?, ?), (?, ?)', ['Alice', 'alice@example.com', 'Bob', 'bob@example.com']);
      console.log('Inserted sample users');
    } else {
      console.log('Users table already has data; skipping seed');
    }

    await conn.end();
    console.log('✅ Database initialized (nagp_db)');
  } catch (err) {
    console.error('❌ Failed to initialize DB:', err.message || err);
    process.exit(1);
  }
})();
