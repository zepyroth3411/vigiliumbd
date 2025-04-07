// middlewares/roleMiddleware.js
function permitirRoles(...rolesPermitidos) {
    return (req, res, next) => {
      const usuario = req.usuario
  
      if (!usuario || !rolesPermitidos.includes(usuario.rol)) {
        return res.status(403).json({ message: 'Acceso no autorizado para este rol' })
      }
  
      next()
    }
  }
  
  module.exports = permitirRoles