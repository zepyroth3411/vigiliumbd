const mysql = require('mysql2')
require('dotenv').config()

function verificarDispositivosConectados() {
  const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT || 3306
  })

  const sql = `
    UPDATE dispositivos d
    LEFT JOIN (
      SELECT id_dispositivo, MAX(fecha_hora) AS ultima_fecha
      FROM eventos
      GROUP BY id_dispositivo
    ) e ON d.id_dispositivo = e.id_dispositivo
    SET d.estado = 'desconectado'
    WHERE TIMESTAMPDIFF(MINUTE, e.ultima_fecha, NOW()) > 3
      OR e.ultima_fecha IS NULL
  `

  connection.query(sql, (err, result) => {
    if (err) {
      console.error('❌ Error actualizando estado de conexión:', err)
    } else {
      console.log(`🔄 Dispositivos actualizados: ${result.affectedRows}`)
    }
    connection.end() // 👈🏻 Muy importante para cerrar la conexión
  })
}

module.exports = verificarDispositivosConectados
