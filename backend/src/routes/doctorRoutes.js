const express = require('express');
const router = express.Router();
const DoctorController = require('../controllers/DoctorController');

router.get('/', DoctorController.getAll);
router.get('/:id', DoctorController.getById);
router.post('/', DoctorController.create);

module.exports = router;
