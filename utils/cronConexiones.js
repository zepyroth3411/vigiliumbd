// backend/utils/cronConexiones.js
const db = require('../db')

function verificarDispositivosConectados() {
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

  db.query(sql, (err, result) => {
    if (err) {
      console.error('❌ Error actualizando estado de conexión:', err)
    } else {
      console.log(`🔄 Dispositivos actualizados: ${result.affectedRows}`)
    }
  })
}

module.exports = verificarDispositivosConectados
