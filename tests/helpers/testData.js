// Técnicas de selección de datos de prueba

/**
 * PARTICIONES DE EQUIVALENCIA Y VALORES LÍMITE
 *
 * Para emails:
 * - Partición válida: formato correcto con @ y dominio
 * - Partición inválida: sin @, sin dominio, vacío
 *
 * Para teléfonos:
 * - Partición válida: 10+ dígitos
 * - Partición inválida: menos de 10 dígitos, letras
 *
 * Para horarios:
 * - Partición válida: horarios disponibles
 * - Partición inválida: horarios ya ocupados
 */

module.exports = {
  // Datos válidos (Partición de equivalencia válida)
  validPatients: [
    {
      name: 'Juan Pérez',
      email: 'juan.perez@example.com',
      phone: '1234567890'
    },
    {
      name: 'María García',
      email: 'maria.garcia@test.com',
      phone: '(123) 456-7890'
    },
    {
      name: 'Pedro López',
      email: 'pedro.lopez@email.com',
      phone: '123-456-7890'
    }
  ],

  // Datos inválidos - Emails (Partición de equivalencia inválida)
  invalidEmails: [
    {
      name: 'Test Usuario',
      email: 'emailsindominio',  // Sin @ ni dominio
      phone: '1234567890',
      expectedError: 'Email inválido'
    },
    {
      name: 'Test Usuario',
      email: 'email@sindominio',  // Sin dominio completo
      phone: '1234567890',
      expectedError: 'Email inválido'
    },
    {
      name: 'Test Usuario',
      email: '@sinusuario.com',  // Sin usuario
      phone: '1234567890',
      expectedError: 'Email inválido'
    },
    {
      name: 'Test Usuario',
      email: '',  // Vacío (valor límite)
      phone: '1234567890',
      expectedError: 'Todos los campos son obligatorios'
    }
  ],

  // Datos inválidos - Teléfonos (Valores límite)
  invalidPhones: [
    {
      name: 'Test Usuario',
      email: 'test@example.com',
      phone: '123',  // Muy corto (valor límite inferior)
      expectedError: 'Teléfono inválido'
    },
    {
      name: 'Test Usuario',
      email: 'test2@example.com',
      phone: 'abcdefghij',  // Letras en lugar de números
      expectedError: 'Teléfono inválido'
    },
    {
      name: 'Test Usuario',
      email: 'test3@example.com',
      phone: '',  // Vacío (valor límite)
      expectedError: 'Todos los campos son obligatorios'
    }
  ],

  // Campos vacíos (Valores límite)
  emptyFields: [
    {
      name: '',
      email: 'test@example.com',
      phone: '1234567890',
      expectedError: 'Todos los campos son obligatorios'
    },
    {
      name: 'Test Usuario',
      email: '',
      phone: '1234567890',
      expectedError: 'Todos los campos son obligatorios'
    },
    {
      name: 'Test Usuario',
      email: 'test@example.com',
      phone: '',
      expectedError: 'Todos los campos son obligatorios'
    }
  ],

  // Datos para citas
  validAppointments: [
    {
      patientIndex: 0,
      doctorIndex: 0,
      date: getDateOffset(1),  // Mañana
      time: '09:00',
      reason: 'Consulta general'
    },
    {
      patientIndex: 1,
      doctorIndex: 1,
      date: getDateOffset(2),  // Pasado mañana
      time: '10:30',
      reason: 'Revisión pediátrica'
    }
  ],

  // Horarios para pruebas de conflicto
  conflictingAppointments: {
    first: {
      date: getDateOffset(3),
      time: '14:00',
      reason: 'Primera cita'
    },
    second: {
      date: getDateOffset(3),
      time: '14:00',  // Mismo horario
      reason: 'Cita en conflicto'
    }
  },

  // Fechas inválidas (Valores límite y particiones inválidas)
  invalidDates: [
    {
      date: getDateOffset(-1),  // Fecha pasada
      time: '10:00',
      expectedError: 'fecha'
    }
  ]
};

// Función auxiliar para obtener fechas relativas
function getDateOffset(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

// Función para obtener fecha de hoy
function getToday() {
  return new Date().toISOString().split('T')[0];
}

module.exports.getDateOffset = getDateOffset;
module.exports.getToday = getToday;
