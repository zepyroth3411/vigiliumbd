const express = require('express')
const router = express.Router()
const db = require('../db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')



// POST /login
router.post('/login', (req, res) => {
  const { id_usuario, password } = req.body

  if (!id_usuario || !password) {
    return res.status(400).json({ message: 'Faltan datos' })
  }

  const query = `
    SELECT u.*, r.nombre AS rol_nombre
    FROM usuarios u
    LEFT JOIN roles r ON u.rol_id = r.id
    WHERE u.id_usuario = ?
  `

  db.query(query, [id_usuario], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Error de base de datos' })
  
    if (results.length === 0) {
      console.log('❌ Usuario no encontrado')
      return res.status(401).json({ message: 'Usuario no encontrado' })
    }
  
    const usuario = results[0]
    console.log('🔍 Usuario encontrado:', usuario)
  
    // Validar contraseña
    console.log('🔑 Comparando:', password, 'vs', usuario.password)
    const isMatch = await bcrypt.compare(password.trim(), usuario.password)
  
    if (!isMatch) {
      console.log('❌ Contraseña incorrecta')
      return res.status(401).json({ message: 'Contraseña incorrecta' })
    }
  
    const token = jwt.sign(
      {
        id: usuario.id,
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        rol: usuario.rol_nombre,
      },
      process.env.JWT_SECRET || 'vigilium_secret_2025',
      { expiresIn: '2h' }
    )
  
    console.log('✅ Token generado:', token)
  
    res.json({ token })
  })
  
})

module.exports = router
