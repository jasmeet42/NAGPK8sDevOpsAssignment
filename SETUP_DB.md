Setup MySQL database locally

Options:

1) Using MySQL CLI (requires MySQL server installed)

- Start MySQL server (Windows: use Services.msc or MySQL Workbench).
- Run the SQL file:

```bash
mysql -u root -p < db/init_db.sql
```

2) Using the included Node script (requires Node and `mysql2` installed)

- Install dependencies if you haven't:

```bash
npm install mysql2
```

- Run the init script (you can set env vars to override defaults):

```bash
# Linux/macOS
DB_HOST=localhost DB_USER=root DB_PASSWORD=root node scripts/init-db.js

# Windows (PowerShell)
$env:DB_HOST='localhost'; $env:DB_USER='root'; $env:DB_PASSWORD='root'; node scripts/init-db.js
```

3) After DB is created

- Start the server:

```bash
node app.js
```

- Verify endpoint:

```bash
curl http://localhost:8080/users
```

Notes:
- The Node script will create the `nagp_db` database, the `users` table, and seed two sample users if the table is empty.
- For production, store credentials in environment variables and use a secure password.
