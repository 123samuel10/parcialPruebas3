const express = require('express');
const router = express.Router();
const PatientController = require('../controllers/PatientController');

router.post('/', PatientController.create);
router.get('/', PatientController.getAll);
router.get('/:id', PatientController.getById);
router.put('/:id', PatientController.update);
router.delete('/:id', PatientController.delete);

module.exports = router;
