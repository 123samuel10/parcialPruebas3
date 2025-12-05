const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDatabase() {
  let connection;

  try {
    // Conectar sin especificar base de datos
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });

    console.log('Conectado a MySQL');

    // Crear base de datos si no existe
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'medical_appointments'}`);
    console.log(`Base de datos '${process.env.DB_NAME || 'medical_appointments'}' creada o ya existe`);

    // Usar la base de datos
    await connection.query(`USE ${process.env.DB_NAME || 'medical_appointments'}`);

    // Crear tabla de pacientes
    await connection.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Tabla patients creada');

    // Crear tabla de doctores
    await connection.query(`
      CREATE TABLE IF NOT EXISTS doctors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        specialty VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Tabla doctors creada');

    // Crear tabla de citas
    await connection.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        doctor_id INT NOT NULL,
        date DATE NOT NULL,
        time TIME NOT NULL,
        reason TEXT,
        status ENUM('active', 'cancelled') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        cancelled_at TIMESTAMP NULL,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
        FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
        INDEX idx_doctor_date_time (doctor_id, date, time),
        INDEX idx_patient (patient_id),
        INDEX idx_status (status),
        UNIQUE KEY unique_doctor_datetime (doctor_id, date, time, status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Tabla appointments creada');

    // Insertar doctores de ejemplo si no existen
    const [doctors] = await connection.query('SELECT COUNT(*) as count FROM doctors');
    if (doctors[0].count === 0) {
      await connection.query(`
        INSERT INTO doctors (name, specialty) VALUES
        ('Dr. García', 'Medicina General'),
        ('Dra. Martínez', 'Pediatría'),
        ('Dr. López', 'Cardiología')
      `);
      console.log('Doctores de ejemplo insertados');
    }

    console.log('\n✓ Base de datos inicializada correctamente');

  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;
