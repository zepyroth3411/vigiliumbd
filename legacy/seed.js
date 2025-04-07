const db = require('./db')
const bcrypt = require('bcryptjs')
const fs = require('fs')

const usuarios = JSON.parse(fs.readFileSync('./usuarios.json', 'utf-8'))

async function insertarUsuarios() {
  for (const usuario of usuarios) {
    const hashedPassword = await bcrypt.hash(usuario.password, 10)

    db.query(
      'INSERT INTO usuarios (id_usuario, nombre, password, rol) VALUES (?, ?, ?, ?)',
      [usuario.id_usuario, usuario.nombre, hashedPassword, usuario.rol],
      (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            console.log(`⚠️ Usuario '${usuario.id_usuario}' ya existe. Omitido.`)
          } else {
            console.error(`❌ Error insertando '${usuario.id_usuario}':`, err)
          }
        } else {
          console.log(`✅ Usuario '${usuario.id_usuario}' insertado.`)
        }
      }
    )
  }
}

insertarUsuarios()
