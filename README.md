# Sistema de Reserva de Citas Médicas

Sistema completo de reserva de citas médicas con API REST, frontend y pruebas E2E automatizadas.

## Arquitectura del Sistema

### Backend - API REST (Node.js/Express + MySQL)
- Arquitectura MVC (Model-View-Controller)
- Base de datos MySQL con 3 tablas: patients, doctors, appointments
- Validaciones: email formato válido, teléfono 10+ dígitos
- Prevención de conflictos: no permite citas en mismo horario para el mismo doctor
- Endpoints RESTful para CRUD completo

### Frontend (HTML/CSS/JavaScript)
- Interfaz responsive
- Formulario de registro de pacientes con validación
- Formulario de agendamiento de citas con selección de doctor, fecha y hora
- Lista de citas agendadas con filtros (activas/canceladas)
- Opción para cancelar citas

### Pruebas E2E (Playwright)
- 5 casos de prueba automatizados
- Cobertura de funcionalidades esenciales
- Workflow de GitHub Actions que ejecuta las pruebas automáticamente

## Requisitos Previos

- Node.js 18 o superior
- MySQL 8.0 o superior
- npm

## Instalación y Configuración

### 1. Instalar dependencias
```bash
npm install
cd backend && npm install && cd ..
```

### 2. Configurar base de datos

Crear archivo `backend/.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=medical_appointments
DB_PORT=3306
PORT=3000
NODE_ENV=development
```

### 3. Inicializar base de datos
```bash
cd backend
npm run init-db
```

### 4. Instalar Playwright
```bash
npx playwright install chromium
```

## Ejecución

### Iniciar el sistema completo
```bash
npm start
```

- Backend API: http://localhost:3000
- Frontend: http://localhost:8080

### Ejecutar pruebas E2E
```bash
npm run test:e2e
```

## API Endpoints

### Pacientes
- POST /api/patients - Registrar paciente (validaciones: email, teléfono)
- GET /api/patients - Listar pacientes
- GET /api/patients/:id - Obtener paciente
- PUT /api/patients/:id - Actualizar paciente
- DELETE /api/patients/:id - Eliminar paciente

### Doctores
- GET /api/doctors - Listar doctores
- POST /api/doctors - Crear doctor

### Citas
- POST /api/appointments - Crear cita (valida solapamiento de horarios)
- GET /api/appointments - Listar citas (filtros: status, patient_id, doctor_id, date)
- DELETE /api/appointments/:id - Cancelar cita

### Utilidad
- GET /api/health - Health check
- POST /api/appointments/reset - Limpiar citas (solo testing)

## Estructura del Proyecto

```
parcialpruebas3/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # Conexión MySQL
│   │   │   └── initDatabase.js      # Script de inicialización
│   │   ├── models/
│   │   │   ├── Patient.js
│   │   │   ├── Doctor.js
│   │   │   └── Appointment.js
│   │   ├── services/
│   │   │   ├── PatientService.js    # Lógica de negocio
│   │   │   ├── DoctorService.js
│   │   │   └── AppointmentService.js
│   │   ├── controllers/
│   │   │   ├── PatientController.js
│   │   │   ├── DoctorController.js
│   │   │   └── AppointmentController.js
│   │   ├── routes/
│   │   │   ├── patientRoutes.js
│   │   │   ├── doctorRoutes.js
│   │   │   ├── appointmentRoutes.js
│   │   │   └── index.js
│   │   ├── utils/
│   │   │   └── validators.js        # Validaciones de datos
│   │   └── server.js                # Servidor principal
│   ├── package.json
│   └── .env
├── frontend/
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   └── server.js
├── tests/
│   ├── helpers/
│   │   ├── testData.js              # Datos de prueba
│   │   └── testHelpers.js           # Funciones auxiliares
│   ├── basic-e2e.spec.js            # 5 casos de prueba esenciales
│   └── old-tests/                   # Tests anteriores (backup)
├── .github/
│   └── workflows/
│       └── e2e-tests.yml            # CI/CD workflow
├── playwright.config.js
├── package.json
├── .gitignore
└── README.md
```

## Técnicas de Selección de Datos de Prueba

### 1. Particiones de Equivalencia

División de datos en grupos que se espera sean tratados de manera similar.

**Emails:**
- Partición válida: usuario@dominio.com
- Particiones inválidas: sin @, sin dominio, sin usuario, vacío

**Teléfonos:**
- Partición válida: 10+ dígitos (formatos: 1234567890, (123) 456-7890, 123-456-7890)
- Particiones inválidas: menos de 10 dígitos, letras, vacío

**Horarios:**
- Partición válida: horarios disponibles
- Partición inválida: horarios ya ocupados

### 2. Valores Límite (Boundary Value Analysis)

Pruebas en los extremos de las particiones.

- Campos vacíos (límite inferior): "", nombre vacío, email vacío
- Longitud mínima teléfono: 3 dígitos (inválido) vs 10 dígitos (válido)
- Fechas: pasadas (inválidas) vs futuras (válidas)

### 3. Datos Válidos e Inválidos

Combinación de datos que deben ser aceptados y rechazados.

## Casos de Prueba Implementados

| ID | Caso de Prueba | Tipo |
|---|---|---|
| TC-001 | Registro exitoso de paciente | Registro |
| TC-002 | Conflicto de horario | Regla de negocio |
| TC-003 | Cancelar cita activa | Cancelación |
| TC-004 | Filtro de citas canceladas | Filtros |
| TC-005 | Flujo completo E2E | Integración |

## GitHub Actions Workflow

El workflow automatizado ejecuta:
1. Configuración de entorno (Node.js, MySQL)
2. Instalación de dependencias
3. Inicialización de base de datos
4. Ejecución de pruebas E2E
5. Si todas las pruebas pasan, imprime "OK" en consola
6. Genera y guarda reportes como artifacts

## Decisiones de Diseño

**Priorización basada en riesgo:**
1. Alta prioridad: Validaciones de datos - evita corrupción en BD
2. Media-Alta: Lógica de negocio - funcionalidad core (prevención de conflictos)
3. Media: Gestión de estados - importante para UX
4. Validación final: Flujos E2E - confirma integración correcta

**Selección de datos:**
- Emails válidos con diferentes dominios (.com, .test, .email)
- Emails inválidos cubriendo errores comunes
- Teléfonos en formatos comunes: simple, con guiones, con paréntesis
- Horarios laborales típicos: 09:00, 10:30, 14:00
- Fechas futuras válidas: mañana, +2 días, +3 días

## Tecnologías Utilizadas

**Backend:** Node.js, Express.js, MySQL2, dotenv, CORS

**Frontend:** HTML5, CSS3, JavaScript Vanilla

**Testing:** Playwright, Playwright Test Runner

**CI/CD:** GitHub Actions

## Comandos Útiles

```bash
# Instalación completa
npm run install:all

# Iniciar sistema
npm start

# Pruebas E2E
npm run test:e2e

# Pruebas con UI
npm run test:e2e:ui

# Ver reporte
npm run test:e2e:report

# Reinicializar BD
cd backend && npm run init-db
```

## Autor

Sistema desarrollado para examen de pruebas de software

## Licencia

MIT
