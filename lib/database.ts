import mysql from 'mysql2/promise';

declare global {
  var __mysqlPool: mysql.Pool | undefined;
}

let pool: mysql.Pool;

if (process.env.DATABASE_URL) {
  pool = mysql.createPool(process.env.DATABASE_URL);
} else {
  pool = mysql.createPool({
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "rootpassword",
    database: process.env.MYSQL_DATABASE || "employee_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL Database connected successfully');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });

export default pool;
