const jwt = require('jsonwebtoken')

function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' })
  }

  jwt.verify(token, process.env.JWT_SECRET || 'vigilium_secret_2025', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido o expirado' })
    }

    req.user = user // 👈🏼 AQUÍ es donde se debe asignar el usuario decodificado
    next()
  })
}

module.exports = verificarToken
