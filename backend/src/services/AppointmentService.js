const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Validators = require('../utils/validators');

class AppointmentService {
  async createAppointment(appointmentData) {
    const { patient_id, doctor_id, date, time, reason } = appointmentData;

    // Validar campos requeridos
    const missingFields = Validators.validateRequiredFields(
      { patient_id, doctor_id, date, time },
      ['patient_id', 'doctor_id', 'date', 'time']
    );

    if (missingFields) {
      throw {
        status: 400,
        message: 'Todos los campos son obligatorios',
        fields: missingFields
      };
    }

    // Validar formato de fecha
    if (!Validators.validateDate(date)) {
      throw {
        status: 400,
        message: 'Formato de fecha inválido',
        field: 'date'
      };
    }

    // Validar formato de hora
    if (!Validators.validateTime(time)) {
      throw {
        status: 400,
        message: 'Formato de hora inválido (use HH:MM)',
        field: 'time'
      };
    }

    // Validar que el paciente existe
    const patient = await Patient.findById(patient_id);
    if (!patient) {
      throw {
        status: 404,
        message: 'Paciente no encontrado',
        field: 'patient_id'
      };
    }

    // Validar que el doctor existe
    const doctor = await Doctor.findById(doctor_id);
    if (!doctor) {
      throw {
        status: 404,
        message: 'Doctor no encontrado',
        field: 'doctor_id'
      };
    }

    // Validar que no haya conflicto de horarios
    const existingAppointment = await Appointment.findByDoctorDateTime(
      doctor_id,
      date,
      time
    );

    if (existingAppointment) {
      throw {
        status: 409,
        message: 'El horario ya está ocupado para este doctor',
        field: 'time'
      };
    }

    // Crear la cita
    const appointmentId = await Appointment.create({
      patient_id,
      doctor_id,
      date,
      time,
      reason: reason || ''
    });

    return await Appointment.findById(appointmentId);
  }

  async getAppointmentById(id) {
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      throw {
        status: 404,
        message: 'Cita no encontrada'
      };
    }
    return appointment;
  }

  async getAllAppointments(filters = {}) {
    return await Appointment.findAll(filters);
  }

  async cancelAppointment(id) {
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      throw {
        status: 404,
        message: 'Cita no encontrada'
      };
    }

    if (appointment.status === 'cancelled') {
      throw {
        status: 400,
        message: 'La cita ya está cancelada'
      };
    }

    const cancelled = await Appointment.cancel(id);
    if (!cancelled) {
      throw {
        status: 500,
        message: 'Error al cancelar la cita'
      };
    }

    return await Appointment.findById(id);
  }

  async deleteAllAppointments() {
    return await Appointment.deleteAll();
  }
}

module.exports = new AppointmentService();
