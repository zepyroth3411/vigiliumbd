const mysql = require('mysql2')

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',      // cambia esto
  password: 'root', // cambia esto
  database: 'vigilium'  // o el nombre que le hayas puesto
})

connection.connect(err => {
  if (err) {
    console.error('Error de conexión a MySQL:', err)
    return
  }
  console.log('✅ Conexión MySQL exitosa')
})

module.exports = connection