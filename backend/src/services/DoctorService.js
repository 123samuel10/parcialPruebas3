const Doctor = require('../models/Doctor');

class DoctorService {
  async getAllDoctors() {
    return await Doctor.findAll();
  }

  async getDoctorById(id) {
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      throw {
        status: 404,
        message: 'Doctor no encontrado'
      };
    }
    return doctor;
  }

  async createDoctor(doctorData) {
    const { name, specialty } = doctorData;

    if (!name || !specialty) {
      throw {
        status: 400,
        message: 'Nombre y especialidad son obligatorios'
      };
    }

    const doctorId = await Doctor.create({
      name: name.trim(),
      specialty: specialty.trim()
    });

    return await Doctor.findById(doctorId);
  }
}

module.exports = new DoctorService();
