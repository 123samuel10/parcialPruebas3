const PatientService = require('../services/PatientService');

class PatientController {
  async create(req, res) {
    try {
      const patient = await PatientService.createPatient(req.body);
      res.status(201).json({
        message: 'Paciente registrado exitosamente',
        patient
      });
    } catch (error) {
      res.status(error.status || 500).json({
        error: error.message || 'Error al crear paciente',
        field: error.field,
        fields: error.fields
      });
    }
  }

  async getAll(req, res) {
    try {
      const patients = await PatientService.getAllPatients();
      res.json(patients);
    } catch (error) {
      res.status(error.status || 500).json({
        error: error.message || 'Error al obtener pacientes'
      });
    }
  }

  async getById(req, res) {
    try {
      const patient = await PatientService.getPatientById(req.params.id);
      res.json(patient);
    } catch (error) {
      res.status(error.status || 500).json({
        error: error.message || 'Error al obtener paciente'
      });
    }
  }

  async update(req, res) {
    try {
      const patient = await PatientService.updatePatient(req.params.id, req.body);
      res.json({
        message: 'Paciente actualizado exitosamente',
        patient
      });
    } catch (error) {
      res.status(error.status || 500).json({
        error: error.message || 'Error al actualizar paciente',
        field: error.field
      });
    }
  }

  async delete(req, res) {
    try {
      const result = await PatientService.deletePatient(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({
        error: error.message || 'Error al eliminar paciente'
      });
    }
  }
}

module.exports = new PatientController();
