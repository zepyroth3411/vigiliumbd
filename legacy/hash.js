const bcrypt = require('bcryptjs')

bcrypt.hash('admin123', 10)
  .then(hash => {
    console.log('🔐 Hash generado:', hash)
  })
  .catch(err => {
    console.error('❌ Error generando el hash:', err)
  })