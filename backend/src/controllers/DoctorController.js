const DoctorService = require('../services/DoctorService');

class DoctorController {
  async getAll(req, res) {
    try {
      const doctors = await DoctorService.getAllDoctors();
      res.json(doctors);
    } catch (error) {
      res.status(error.status || 500).json({
        error: error.message || 'Error al obtener doctores'
      });
    }
  }

  async getById(req, res) {
    try {
      const doctor = await DoctorService.getDoctorById(req.params.id);
      res.json(doctor);
    } catch (error) {
      res.status(error.status || 500).json({
        error: error.message || 'Error al obtener doctor'
      });
    }
  }

  async create(req, res) {
    try {
      const doctor = await DoctorService.createDoctor(req.body);
      res.status(201).json({
        message: 'Doctor creado exitosamente',
        doctor
      });
    } catch (error) {
      res.status(error.status || 500).json({
        error: error.message || 'Error al crear doctor'
      });
    }
  }
}

module.exports = new DoctorController();
