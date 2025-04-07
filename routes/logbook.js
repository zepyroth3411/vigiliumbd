const express = require('express')
const router = express.Router()
const db = require('../db')

// GET /api/logbook/clientes
router.get('/clientes', (req, res) => {
  db.query('SELECT id_cliente, nombre FROM clientes', (err, rows) => {
    if (err) {
      console.error('❌ Error al obtener clientes:', err)
      return res.status(500).json({ error: 'Error al obtener clientes' })
    }
    res.json(rows)
  })
})

// GET /api/logbook/dispositivos
router.get('/dispositivos', (req, res) => {
  db.query('SELECT id_dispositivo, nombre_dispositivo FROM dispositivos', (err, rows) => {
    if (err) {
      console.error('❌ Error al obtener dispositivos:', err)
      return res.status(500).json({ error: 'Error al obtener dispositivos' })
    }
    res.json(rows)
  })
})

// POST /api/logbook/clientes
router.post('/clientes', (req, res) => {
  const { nombre, direccion, telefono, correo } = req.body

  if (!nombre || !correo) {
    return res.status(400).json({ error: 'Nombre y correo son obligatorios' })
  }

  const sql = 'INSERT INTO clientes (nombre, direccion, telefono, correo) VALUES (?, ?, ?, ?)'
  db.query(sql, [nombre, direccion, telefono, correo], (err, result) => {
    if (err) {
      console.error('❌ Error al crear cliente:', err)
      return res.status(500).json({ error: 'Error al crear cliente' })
    }

    res.status(201).json({ message: 'Cliente creado', id_cliente: result.insertId, nombre })
  })
})

// POST /api/logbook/dispositivos
router.post('/dispositivos', (req, res) => {
  const { id_dispositivo, nombre_dispositivo, id_cliente } = req.body

  if (!id_dispositivo || !nombre_dispositivo || !id_cliente) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' })
  }

  const sql = `INSERT INTO dispositivos (id_dispositivo, nombre_dispositivo, id_cliente) VALUES (?, ?, ?)`
  db.query(sql, [id_dispositivo, nombre_dispositivo, id_cliente], (err, result) => {
    if (err) {
      console.error('❌ Error al crear dispositivo:', err)
      return res.status(500).json({ error: 'Error al crear dispositivo' })
    }

    res.status(201).json({ message: 'Dispositivo creado', id_dispositivo })
  })
})

// POST /api/logbook/bitacora
router.post('/bitacora', (req, res) => {
  const {
    id_cliente,
    id_dispositivo,
    tecnico,
    diagnostico,
    recomendaciones,
    finalizado
  } = req.body

  if (!id_cliente || !id_dispositivo || !tecnico) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' })
  }

  const sql = `INSERT INTO bitacoras 
    (id_cliente, id_dispositivo, tecnico, diagnostico, recomendaciones, finalizado) 
    VALUES (?, ?, ?, ?, ?, ?)`

  db.query(sql, [id_cliente, id_dispositivo, tecnico, diagnostico, recomendaciones, finalizado], (err) => {
    if (err) {
      console.error('❌ Error al registrar bitácora:', err)
      return res.status(500).json({ error: 'Error al registrar bitácora' })
    }

    res.status(201).json({ message: 'Bitácora registrada exitosamente' })
  })
})

// GET /api/logbook/tecnicos - obtener usuarios con rol 'tecnico'
router.get('/tecnicos', (req, res) => {
  const sql = 'SELECT id_usuario, nombre FROM usuarios WHERE rol_id = 3'

  db.query(sql, (err, rows) => {
    if (err) {
      console.error('❌ Error al obtener técnicos:', err)
      return res.status(500).json({ error: 'Error al obtener técnicos' })
    }

    res.json(rows)
  })
})

module.exports = router
