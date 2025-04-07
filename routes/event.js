const express = require('express')
const router = express.Router()
const db = require('../db')

// POST /api/eventos
router.post('/eventos', (req, res) => {
  const { id_dispositivo, codigo } = req.body

  if (!id_dispositivo || !codigo) {
    return res.status(400).json({ message: 'Faltan datos: id_dispositivo o codigo' })
  }

  // Verificar si el dispositivo existe y puede recibir eventos
  const sqlDispositivo = `
    SELECT recibir_eventos 
    FROM dispositivos 
    WHERE id_dispositivo = ? LIMIT 1
  `
  db.query(sqlDispositivo, [id_dispositivo], (err, rows) => {
    if (err) return res.status(500).json({ message: '❌ Error al buscar dispositivo', error: err })

    if (rows.length === 0) {
      return res.status(404).json({ message: `⚠️ El dispositivo con ID ${id_dispositivo} no está registrado.` })
    }

    const puedeRecibir = rows[0].recibir_eventos
    if (!puedeRecibir) {
      return res.status(403).json({ message: `🚫 El dispositivo ${id_dispositivo} tiene desactivado el envío de eventos.` })
    }

    // Buscar el código Contact ID
    const sqlBuscar = `
      SELECT descripcion, tipo_evento, nivel_critico 
      FROM eventos_contact_id 
      WHERE codigo = ? LIMIT 1
    `
    db.query(sqlBuscar, [codigo], (err, rowsCodigo) => {
      if (err) return res.status(500).json({ message: '❌ Error al buscar código Contact ID', error: err })

      if (rowsCodigo.length === 0) {
        return res.status(404).json({ message: `⚠️ El código Contact ID ${codigo} no está registrado.` })
      }

      const { descripcion, tipo_evento, nivel_critico } = rowsCodigo[0]

      // Insertar evento en la base de datos
      const sqlInsertar = `
        INSERT INTO eventos (id_dispositivo, codigo_contact_id, descripcion, tipo_evento, nivel_critico)
        VALUES (?, ?, ?, ?, ?)
      `
      db.query(sqlInsertar, [id_dispositivo, codigo, descripcion, tipo_evento, nivel_critico], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al registrar evento', error: err })

        // ✅ Actualizar estado y última señal
        const sqlActualizarEstado = `
          UPDATE dispositivos 
          SET estado = 'conectado', ultima_senal = NOW()
          WHERE id_dispositivo = ?
        `
        db.query(sqlActualizarEstado, [id_dispositivo], (err2) => {
          if (err2) {
            console.error('❌ Error al actualizar estado del dispositivo:', err2)
          } else {
            console.log(`📡 Dispositivo ${id_dispositivo} marcado como CONECTADO`)
            console.log(`📥 Evento recibido: Código ${codigo} (${descripcion}), tipo ${tipo_evento}, nivel ${nivel_critico}`)
          }

          // ⚡ Emitir evento a los clientes
          const nuevoEvento = {
            id: result.insertId,
            id_dispositivo,
            codigo_contact_id: codigo,
            descripcion,
            tipo_evento,
            nivel_critico,
            fecha_hora: new Date()
          }

          req.app.get('io').emit('nuevoEvento', nuevoEvento)

          res.status(201).json({ message: '✅ Evento registrado correctamente', id_evento: result.insertId })
        })
      })
    })
  })
})

// GET /api/eventos/activos
router.get('/eventos/activos', (req, res) => {
  const sql = `
    SELECT * FROM eventos 
    WHERE atendido = FALSE 
    ORDER BY fecha_hora DESC
  `
  db.query(sql, (err, rows) => {
    if (err) {
      console.error('❌ Error al obtener eventos activos:', err)
      return res.status(500).json({ message: 'Error al obtener eventos activos' })
    }
    res.json(rows)
  })
})

// GET /api/eventos/recientes
router.get('/eventos/recientes', (req, res) => {
  const sql = `
    SELECT * FROM eventos 
    WHERE atendido = TRUE 
    ORDER BY fecha_atencion DESC 
    LIMIT 5
  `
  db.query(sql, (err, rows) => {
    if (err) {
      console.error('❌ Error al obtener eventos recientes:', err)
      return res.status(500).json({ message: 'Error al obtener eventos recientes' })
    }
    res.json(rows)
  })
})

// PUT /api/eventos/:id/atender
router.put('/eventos/:id/atender', (req, res) => {
  const { id } = req.params
  const { atendido_por, detalle_atencion } = req.body

  if (!atendido_por || !detalle_atencion) {
    return res.status(400).json({ message: 'Faltan datos: atendido_por o detalle_atencion' })
  }

  const sql = `
    UPDATE eventos 
    SET atendido = TRUE, 
        atendido_por = ?, 
        detalle_atencion = ?, 
        fecha_atencion = NOW() 
    WHERE id_evento = ?
  `

  db.query(sql, [atendido_por, detalle_atencion, id], (err) => {
    if (err) {
      console.error('❌ Error al marcar evento como atendido:', err)
      return res.status(500).json({ message: 'Error al actualizar evento' })
    }

    req.app.get('io').emit('eventoAtendido', { id_evento: id })
    res.json({ message: '✅ Evento marcado como atendido' })
  })
})

// GET /api/eventos/recientes-dashboard
router.get('/eventos/recientes-dashboard', (req, res) => {
  const sql = `
    SELECT id_evento, id_dispositivo, tipo_evento, fecha_atencion 
    FROM eventos 
    WHERE atendido = TRUE 
    ORDER BY fecha_atencion DESC 
    LIMIT 5
  `

  db.query(sql, (err, rows) => {
    if (err) {
      console.error('❌ Error al obtener eventos recientes para dashboard:', err)
      return res.status(500).json({ message: 'Error al obtener eventos recientes' })
    }

    // Formatear fecha y hora en frontend, aquí solo pasamos los datos
    res.json(rows)
  })
})



module.exports = router
