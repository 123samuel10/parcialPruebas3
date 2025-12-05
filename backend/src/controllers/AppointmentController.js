const AppointmentService = require('../services/AppointmentService');

class AppointmentController {
  async create(req, res) {
    try {
      const appointment = await AppointmentService.createAppointment(req.body);
      res.status(201).json({
        message: 'Cita agendada exitosamente',
        appointment
      });
    } catch (error) {
      res.status(error.status || 500).json({
        error: error.message || 'Error al crear cita',
        field: error.field,
        fields: error.fields
      });
    }
  }

  async getAll(req, res) {
    try {
      const filters = {};
      if (req.query.status) filters.status = req.query.status;
      if (req.query.patient_id) filters.patient_id = req.query.patient_id;
      if (req.query.doctor_id) filters.doctor_id = req.query.doctor_id;
      if (req.query.date) filters.date = req.query.date;

      const appointments = await AppointmentService.getAllAppointments(filters);
      res.json(appointments);
    } catch (error) {
      res.status(error.status || 500).json({
        error: error.message || 'Error al obtener citas'
      });
    }
  }

  async getById(req, res) {
    try {
      const appointment = await AppointmentService.getAppointmentById(req.params.id);
      res.json(appointment);
    } catch (error) {
      res.status(error.status || 500).json({
        error: error.message || 'Error al obtener cita'
      });
    }
  }

  async cancel(req, res) {
    try {
      const appointment = await AppointmentService.cancelAppointment(req.params.id);
      res.json({
        message: 'Cita cancelada exitosamente',
        appointment
      });
    } catch (error) {
      res.status(error.status || 500).json({
        error: error.message || 'Error al cancelar cita'
      });
    }
  }

  async deleteAll(req, res) {
    try {
      await AppointmentService.deleteAllAppointments();
      res.json({
        message: 'Todas las citas han sido eliminadas'
      });
    } catch (error) {
      res.status(error.status || 500).json({
        error: error.message || 'Error al eliminar citas'
      });
    }
  }
}

module.exports = new AppointmentController();
