# Vigilium Backend

Este repositorio contiene el backend de **Vigilium**, un sistema inteligente de monitoreo y gestión de dispositivos de seguridad, eventos críticos y fallas técnicas.

Desarrollado en **Node.js** con **Express**, 
utiliza una base de datos **MySQL** y proporciona una API robusta para manejar usuarios,
roles, eventos, dispositivos, bitácoras, reportes de fallas, 
y comunicación en tiempo real con **Socket.IO**.

## 🚀 Tecnologías Utilizadas

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MySQL](https://www.mysql.com/)
- [JWT](https://jwt.io/) – Autenticación
- [Socket.IO](https://socket.io/) – Comunicación en tiempo real
- [Railway](https://railway.app/) – Despliegue del backend
- [dotenv](https://www.npmjs.com/package/dotenv) – Configuración de entorno
- [CORS](https://expressjs.com/en/resources/middleware/cors.html)

## 📁 Estructura del Proyecto
- ├── index.js # Punto de entrada del servidor 
- ├── /routes # Rutas API (auth, devices, events, etc.) 
- │ 
- ├── auth.js │ 
- ├── users.js │ 
- ├── password.js │ 
- ├── device.js │ 
- ├── client.js │ 
- ├── event.js │ 
- ├── dashboard.js │ 
- ├── logbook.js │ 
- └── faultReporting.js 
- ├── /utils # Funciones auxiliares (ej. JWT, tareas programadas) │
- ├── authMiddleware.js │ 
- └── cronConexiones.js 
- ├── /db # Conexión MySQL │ 
- └── index.js 
- ├── .env # Variables de entorno 
 -└── package.json

## 🔐 Variables de Entorno
- Archivo `.env`:
- JWT
- JWT_SECRET=
- JWT_EXPIRES_IN=
- MySQL
- MYSQL_HOST=
- MYSQL_PORT=
- MYSQL_USER=
- MYSQL_PASSWORD=
- MYSQL_DATABASE=
- CORS
- FRONTEND_URL=
- Puerto
- PORT=

## ⚙️ Comandos Básicos
- npm install	Instala dependencias
- npm run dev	Inicia servidor con nodemon
- node index.js	Inicia servidor (modo producción)

## 🔌 Endpoints Principales
- POST /api/login	Autenticación de usuarios
- GET /api/dashboard	KPIs dinámicos por rol
- GET /api/eventos	Lista y recepción de eventos
- POST /api/eventos	Registro de nuevos eventos
- GET /api/devices	Gestión de dispositivos
- PATCH /api/devices/:id/estado	Activar/desactivar recepción
- POST /api/logbook/bitacora	Registro de bitácora técnica
- POST /api/fault-reporting	Reporte de fallas

## 📡 Comunicación en Tiempo Real
- Socket.IO habilitado para:
- Actualización de eventos en vivo
- Sincronización de fallas técnicas entre usuarios

## 🛡️ Seguridad
- Autenticación con JWT
- Middleware de autorización por rol
- Validación de endpoints
- CORS configurado para producción

## 🌍 Despliegue
- Este backend está desplegado en:
- https://vigiliumbd-production.up.railway.app
- Puerto por defecto: 8080 (Railway)

## 🧠 Autores
- Backend desarrollado por el equipo de desarrollo de Vigilium.
- Colaboracion: Sensei @KiraBelak 

## ✅ Estado del Proyecto
🟢 Estable y en producción
🛠️ Se aceptan mejoras para endpoints, documentación, y optimización del socket

