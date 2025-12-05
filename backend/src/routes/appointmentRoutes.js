const express = require('express');
const router = express.Router();
const AppointmentController = require('../controllers/AppointmentController');

router.post('/', AppointmentController.create);
router.get('/', AppointmentController.getAll);
router.get('/:id', AppointmentController.getById);
router.delete('/:id', AppointmentController.cancel);
router.post('/reset', AppointmentController.deleteAll);

module.exports = router;
