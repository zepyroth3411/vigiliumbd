const express = require('express')
const router = express.Router()
const db = require('../db')
const verifyToken = require('../middlewares/authMiddleware')

// GET /api/dashboard
router.get('/dashboard', verifyToken, (req, res) => {
  const usuario = req.user

  if (!usuario || !usuario.rol) {
    console.error('❌ No se pudo obtener el rol del usuario')
    return res.status(400).json({ message: 'Rol no definido en el token' })
  }

  const rol = usuario.rol.toLowerCase()
  console.log(`📊 Consultando dashboard para el rol: ${rol}`)

  if (rol === 'admin') {
    const sql = `
    SELECT
        (SELECT COUNT(*) FROM usuarios) AS total_usuarios,
        (SELECT COUNT(*) FROM dispositivos) AS total_dispositivos,
        (SELECT COUNT(*) FROM eventos) AS total_eventos,
        (SELECT id_usuario FROM usuarios ORDER BY fecha_creacion DESC LIMIT 1) AS ultimo_usuario_id,
        (SELECT nombre FROM usuarios ORDER BY fecha_creacion DESC LIMIT 1) AS ultimo_usuario_nombre,
        (SELECT fecha_creacion FROM usuarios ORDER BY fecha_creacion DESC LIMIT 1) AS ultimo_usuario_fecha,
        (SELECT id_dispositivo FROM eventos ORDER BY fecha_hora DESC LIMIT 1) AS ultimo_evento_id,
        (SELECT descripcion FROM eventos ORDER BY fecha_hora DESC LIMIT 1) AS ultimo_evento_desc,
        (SELECT fecha_hora FROM eventos ORDER BY fecha_hora DESC LIMIT 1) AS ultimo_evento_fecha,
        (SELECT COUNT(*) FROM dispositivos WHERE estado = 'conectado') AS dispositivos_conectados
        `

    db.query(sql, (err, results) => {
      if (err) {
        console.error('❌ Error al consultar dashboard admin:', err)
        return res.status(500).json({ message: 'Error al consultar dashboard', error: err })
      }
      console.log('✅ Dashboard admin listo:', results[0])
      res.json({ rol: 'admin', ...results[0] })
    })

  } else if (rol === 'tecnico') {
    const sql = `
      SELECT
        (SELECT COUNT(*) FROM dispositivos) AS total_dispositivos,
        (SELECT COUNT(*) FROM clientes) AS total_clientes,
        (SELECT COUNT(*) FROM dispositivos WHERE estado = 'conectado') AS dispositivos_conectados,
        (SELECT COUNT(*) FROM dispositivos WHERE estado = 'desconectado') AS dispositivos_desconectados
    `

    db.query(sql, (err, results) => {
      if (err) {
        console.error('❌ Error al consultar dashboard técnico:', err)
        return res.status(500).json({ message: 'Error al consultar dashboard técnico', error: err })
      }

      console.log('✅ Dashboard técnico listo:', results[0])
      res.json({ rol: 'tecnico', ...results[0] })
    })

  } else if (rol === 'monitorista') {
    const sql = `
      SELECT
        (SELECT COUNT(*) FROM eventos WHERE nivel_critico = 'crítico') AS alertas_criticas,
        (SELECT COUNT(*) FROM eventos) AS total_eventos,
        (SELECT COUNT(*) FROM eventos WHERE nivel_critico = 'crítico' AND atendido = FALSE) AS eventos_activos,
        (
          SELECT CONCAT(
            'Dispositivo ', id_dispositivo, 
            ' - Atendido por ', IFNULL(atendido_por, 'N/D'), 
            ' a las ', DATE_FORMAT(fecha_atencion, '%H:%i:%s')
          )
          FROM eventos 
          WHERE atendido = TRUE 
          ORDER BY fecha_atencion DESC 
          LIMIT 1
        ) AS ultimo_evento_atendido
    `
    db.query(sql, (err, results) => {
      if (err) {
        console.error('❌ Error al consultar dashboard monitorista:', err)
        return res.status(500).json({ message: 'Error al consultar dashboard monitorista', error: err })
      }
      console.log('✅ Dashboard monitorista listo:', results[0])
      res.json({ rol: 'monitorista', ...results[0] })
    })

  } else {
    console.warn(`⚠️ Rol no autorizado: ${rol}`)
    return res.status(403).json({ message: 'Rol no autorizado para dashboard' })
  }
})

module.exports = router
