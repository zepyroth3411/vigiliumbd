// routes/faultReporting.js
const express = require('express')
const router = express.Router()
const db = require('../db')

// POST /api/fault-reporting - Registrar reporte de falla
router.post('/', (req, res) => {
  const { id_dispositivo, tecnico, tipo_falla, descripcion, urgente } = req.body

  if (!id_dispositivo || !tecnico || !tipo_falla || !descripcion) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' })
  }

  const sql = `
    INSERT INTO fallas_reportadas (id_dispositivo, tecnico, tipo_falla, descripcion, urgente)
    VALUES (?, ?, ?, ?, ?)
  `
  db.query(sql, [id_dispositivo, tecnico, tipo_falla, descripcion, urgente], (err, result) => {
    if (err) {
      console.error('❌ Error al registrar la falla:', err)
      return res.status(500).json({ error: 'Error al registrar la falla' })
    }

    const nuevaFalla = {
      id: result.insertId,
      id_dispositivo,
      tecnico,
      tipo_falla,
      descripcion,
      urgente,
      fecha: new Date()
    }

    // Emitir evento de nueva falla
    const io = req.app.get('io')
    io.emit('nueva-falla', nuevaFalla)

    res.status(201).json({ message: 'Falla reportada exitosamente', data: nuevaFalla })
  })
})

// GET /api/fault-reporting - Obtener todas las fallas no atendidas
router.get('/', (req, res) => {
  const sql = `SELECT * FROM fallas_reportadas WHERE atendida IS NULL OR atendida = 0 ORDER BY fecha DESC`

  db.query(sql, (err, rows) => {
    if (err) {
      console.error('❌ Error al obtener fallas:', err)
      return res.status(500).json({ error: 'Error al obtener fallas' })
    }
    res.json(rows)
  })
})

// GET /api/fault-reporting/pendientes
router.get('/pendientes', (req, res) => {
  const sql = `SELECT * FROM fallas_reportadas WHERE atendida IS NULL OR atendida = 0 ORDER BY fecha DESC`

  db.query(sql, (err, rows) => {
    if (err) {
      console.error('❌ Error al obtener fallas pendientes:', err)
      return res.status(500).json({ error: 'Error al obtener fallas pendientes' })
    }
    res.json(rows)
  })
})

// PUT /api/fault-reporting/:id/atender - Marcar falla como atendida
router.put('/:id/atender', (req, res) => {
  const { id } = req.params
  const { atendida_por, solucion } = req.body

  if (!atendida_por || !solucion) {
    return res.status(400).json({ error: 'Faltan datos para marcar como atendida' })
  }

  const sql = `
    UPDATE fallas_reportadas
    SET atendida = 1, atendida_por = ?, solucion = ?, fecha_atendida = NOW()
    WHERE id = ?
  `

  db.query(sql, [atendida_por, solucion, id], (err) => {
    if (err) {
      console.error('❌ Error al marcar como atendida:', err)
      return res.status(500).json({ error: 'Error al actualizar falla' })
    }

    const io = req.app.get('io')
    io.emit('falla-atendida', { id, atendida_por, solucion })

    res.json({ message: 'Falla marcada como atendida' })
  })
})

module.exports = router
