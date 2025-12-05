const API_URL = 'http://localhost:3000/api';

// Utility functions
function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.querySelectorAll('input, select, textarea').forEach(el => el.classList.remove('error'));
}

function showError(fieldId, message) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    const inputElement = document.getElementById(fieldId) || document.querySelector(`[name="${fieldId}"]`);

    if (errorElement) {
        errorElement.textContent = message;
    }
    if (inputElement) {
        inputElement.classList.add('error');
    }
}

function showSuccess(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.classList.add('show');
    setTimeout(() => {
        element.classList.remove('show');
    }, 3000);
}

// Patient Form
document.getElementById('patient-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const formData = {
        name: document.getElementById('patient-name').value.trim(),
        email: document.getElementById('patient-email').value.trim(),
        phone: document.getElementById('patient-phone').value.trim()
    };

    try {
        const response = await fetch(`${API_URL}/patients`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok) {
            if (data.field) {
                // Map backend field names to frontend field IDs
                const fieldMap = {
                    'name': 'patient-name',
                    'email': 'patient-email',
                    'phone': 'patient-phone'
                };
                showError(fieldMap[data.field] || data.field, data.error);
            } else if (data.fields) {
                data.fields.forEach(field => {
                    const fieldMap = {
                        'name': 'patient-name',
                        'email': 'patient-email',
                        'phone': 'patient-phone'
                    };
                    showError(fieldMap[field] || field, `Este campo es obligatorio`);
                });
            } else {
                alert(data.error);
            }
            return;
        }

        showSuccess('patient-success', data.message);
        document.getElementById('patient-form').reset();
        loadPatients();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al registrar paciente. Por favor, intente nuevamente.');
    }
});

// Appointment Form
document.getElementById('appointment-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const formData = {
        patient_id: parseInt(document.getElementById('appointment-patient').value),
        doctor_id: parseInt(document.getElementById('appointment-doctor').value),
        date: document.getElementById('appointment-date').value,
        time: document.getElementById('appointment-time').value,
        reason: document.getElementById('appointment-reason').value.trim()
    };

    try {
        const response = await fetch(`${API_URL}/appointments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok) {
            if (data.field) {
                const fieldMap = {
                    'patient_id': 'appointment-patient',
                    'doctor_id': 'appointment-doctor',
                    'date': 'appointment-date',
                    'time': 'appointment-time'
                };
                showError(fieldMap[data.field] || data.field, data.error);
            } else if (data.fields) {
                data.fields.forEach(field => {
                    const fieldMap = {
                        'patient_id': 'appointment-patient',
                        'doctor_id': 'appointment-doctor',
                        'date': 'appointment-date',
                        'time': 'appointment-time'
                    };
                    showError(fieldMap[field] || field, 'Este campo es obligatorio');
                });
            } else {
                alert(data.error);
            }
            return;
        }

        showSuccess('appointment-success', data.message);
        document.getElementById('appointment-form').reset();
        loadAppointments();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al agendar cita. Por favor, intente nuevamente.');
    }
});

// Load Patients
async function loadPatients() {
    try {
        const response = await fetch(`${API_URL}/patients`);
        const patients = await response.json();

        const select = document.getElementById('appointment-patient');
        select.innerHTML = '<option value="">Seleccione un paciente</option>';

        patients.forEach(patient => {
            const option = document.createElement('option');
            option.value = patient.id;
            option.textContent = `${patient.name} (${patient.email})`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading patients:', error);
    }
}

// Load Doctors
async function loadDoctors() {
    try {
        const response = await fetch(`${API_URL}/doctors`);
        const doctors = await response.json();

        const select = document.getElementById('appointment-doctor');
        select.innerHTML = '<option value="">Seleccione un doctor</option>';

        doctors.forEach(doctor => {
            const option = document.createElement('option');
            option.value = doctor.id;
            option.textContent = `${doctor.name} - ${doctor.specialty}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading doctors:', error);
    }
}

// Load Appointments
async function loadAppointments() {
    try {
        const status = document.getElementById('filter-status').value;
        let url = `${API_URL}/appointments`;
        if (status) {
            url += `?status=${status}`;
        }

        const response = await fetch(url);
        const appointments = await response.json();

        const container = document.getElementById('appointments-list');

        if (appointments.length === 0) {
            container.innerHTML = '<p class="no-appointments">No hay citas registradas</p>';
            return;
        }

        container.innerHTML = appointments.map(apt => `
            <div class="appointment-card ${apt.status}">
                <div class="appointment-header">
                    <div class="appointment-info">
                        <h3>${apt.patient_name}</h3>
                        <p><strong>Doctor:</strong> ${apt.doctor_name} - ${apt.doctor_specialty}</p>
                        <p><strong>Fecha:</strong> ${formatDate(apt.date)} a las ${apt.time}</p>
                        ${apt.reason ? `<p><strong>Motivo:</strong> ${apt.reason}</p>` : ''}
                    </div>
                    <div>
                        <span class="appointment-status ${apt.status}">${apt.status === 'active' ? 'Activa' : 'Cancelada'}</span>
                    </div>
                </div>
                ${apt.status === 'active' ? `
                    <button class="btn btn-danger" onclick="cancelAppointment(${apt.id})">
                        Cancelar Cita
                    </button>
                ` : ''}
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading appointments:', error);
        document.getElementById('appointments-list').innerHTML =
            '<p class="loading">Error al cargar las citas</p>';
    }
}

// Cancel Appointment
async function cancelAppointment(id) {
    if (!confirm('¿Está seguro de que desea cancelar esta cita?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/appointments/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error);
            return;
        }

        alert(data.message);
        loadAppointments();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cancelar la cita. Por favor, intente nuevamente.');
    }
}

// Format Date
function formatDate(dateString) {
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Set minimum date to today
document.getElementById('appointment-date').min = new Date().toISOString().split('T')[0];

// Filter appointments
document.getElementById('filter-status').addEventListener('change', loadAppointments);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadPatients();
    loadDoctors();
    loadAppointments();
});
