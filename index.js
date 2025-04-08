const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const cors = require('cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const passwordRoutes = require('./routes/password');
const deviceRoutes = require('./routes/device');
const clienteRoutes = require('./routes/client');
const eventRoutes = require('./routes/event');
const dashboardRoutes = require('./routes/dashboard');
const verificarDispositivosConectados = require('./utils/cronConexiones');
const bitacoraRoutes = require('./routes/logbook');
const faultReportingRoutes = require('./routes/faultReporting');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }
});

app.set('io', io);

const PORT = process.env.PORT;

// 🔁 Ejecutar verificación de conexión cada 5 minutos
setInterval(() => {
  console.log('⏱️ Verificando conexiones de dispositivos...');
  verificarDispositivosConectados();
}, 5 * 60 * 1000);

// 🛡️ CORS configurado con origen permitido

const corsOptions = {
  origin: process.env.FRONTEND_URL || "*",  // permite tu frontend o todo durante pruebas
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));  // Responde a las peticiones OPTIONS
app.use(express.json());

// 📦 Rutas del backend
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', passwordRoutes);
app.use('/api', deviceRoutes);
app.use('/api', clienteRoutes);
app.use('/api', eventRoutes);
app.use('/api', dashboardRoutes);
app.use('/api/logbook', bitacoraRoutes);
app.use('/api/fault-reporting', faultReportingRoutes);

// 🔌 WebSocket
io.on('connection', (socket) => {
  console.log('🟢 Cliente conectado:', socket.id);

  socket.on('marcarAtendido', (data) => {
    console.log('📡 Evento atendido:', data);
    socket.broadcast.emit('eventoAtendido', data);
  });

  socket.on('disconnect', () => {
    console.log('🔴 Cliente desconectado:', socket.id);
  });
});

// 🚀 Iniciar servidor
server.listen(PORT, () => {
  console.log(`🚀 Backend con Socket.IO en http://localhost:${PORT}`);
});
