const Patient = require('../models/Patient');
const Validators = require('../utils/validators');

class PatientService {
  async createPatient(patientData) {
    const { name, email, phone } = patientData;

    // Validar campos requeridos
    const missingFields = Validators.validateRequiredFields(
      { name, email, phone },
      ['name', 'email', 'phone']
    );

    if (missingFields) {
      throw {
        status: 400,
        message: 'Todos los campos son obligatorios',
        fields: missingFields
      };
    }

    // Validar email
    if (!Validators.validateEmail(email)) {
      throw {
        status: 400,
        message: 'Email inválido',
        field: 'email'
      };
    }

    // Validar teléfono
    if (!Validators.validatePhone(phone)) {
      throw {
        status: 400,
        message: 'Teléfono inválido',
        field: 'phone'
      };
    }

    // Verificar si el email ya existe
    const existingPatient = await Patient.findByEmail(email);
    if (existingPatient) {
      throw {
        status: 400,
        message: 'El email ya está registrado',
        field: 'email'
      };
    }

    // Crear paciente
    const patientId = await Patient.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim()
    });

    const patient = await Patient.findById(patientId);
    return patient;
  }

  async getPatientById(id) {
    const patient = await Patient.findById(id);
    if (!patient) {
      throw {
        status: 404,
        message: 'Paciente no encontrado'
      };
    }
    return patient;
  }

  async getAllPatients() {
    return await Patient.findAll();
  }

  async updatePatient(id, patientData) {
    const patient = await Patient.findById(id);
    if (!patient) {
      throw {
        status: 404,
        message: 'Paciente no encontrado'
      };
    }

    const { name, email, phone } = patientData;

    // Validar email si se proporciona
    if (email && !Validators.validateEmail(email)) {
      throw {
        status: 400,
        message: 'Email inválido',
        field: 'email'
      };
    }

    // Validar teléfono si se proporciona
    if (phone && !Validators.validatePhone(phone)) {
      throw {
        status: 400,
        message: 'Teléfono inválido',
        field: 'phone'
      };
    }

    // Verificar email duplicado si se está cambiando
    if (email && email !== patient.email) {
      const existingPatient = await Patient.findByEmail(email);
      if (existingPatient) {
        throw {
          status: 400,
          message: 'El email ya está registrado',
          field: 'email'
        };
      }
    }

    await Patient.update(id, {
      name: name || patient.name,
      email: email || patient.email,
      phone: phone || patient.phone
    });

    return await Patient.findById(id);
  }

  async deletePatient(id) {
    const patient = await Patient.findById(id);
    if (!patient) {
      throw {
        status: 404,
        message: 'Paciente no encontrado'
      };
    }

    await Patient.delete(id);
    return { message: 'Paciente eliminado exitosamente' };
  }
}

module.exports = new PatientService();
