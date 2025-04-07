// backend/db.js
const mysql = require('mysql2');
require('dotenv').config();

// ✅ Crear y exportar conexión única
const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT || 3306
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Error al conectar con MySQL:', err);
  } else {
    console.log('✅ Conexión a MySQL establecida correctamente');
  }
});

module.exports = connection;
