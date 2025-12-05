const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Algo salió mal!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║  Sistema de Citas Médicas - Backend API                  ║
╚═══════════════════════════════════════════════════════════╝

  Servidor ejecutándose en: http://localhost:${PORT}
  Entorno: ${process.env.NODE_ENV || 'development'}

  Endpoints disponibles:
  - POST   /api/patients           Registrar paciente
  - GET    /api/patients           Listar pacientes
  - GET    /api/doctors            Listar doctores
  - POST   /api/appointments       Crear cita
  - GET    /api/appointments       Listar citas
  - DELETE /api/appointments/:id   Cancelar cita
  - GET    /api/health             Health check

  Presiona Ctrl+C para detener el servidor
  `);
});

module.exports = app;
