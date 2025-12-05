const { test, expect } = require('@playwright/test');
const {
  resetDatabase,
  registerPatientViaAPI,
  scheduleAppointmentViaUI,
  verifySuccessMessage,
  verifyErrorMessage,
  waitForFormReady
} = require('./helpers/testHelpers');
const { validPatients, validAppointments, conflictingAppointments } = require('./helpers/testData');

test.describe('Agendamiento de Citas', () => {
  test.beforeEach(async ({ page, request }) => {
    await resetDatabase(request);

    // Registrar pacientes de prueba vía API para acelerar tests
    for (const patient of validPatients) {
      await registerPatientViaAPI(request, patient);
    }

    await page.goto('/');
    await waitForFormReady(page);
  });

  test('TC-011: Agendamiento exitoso de cita con datos válidos', async ({ page }) => {
    // Partición de equivalencia válida: todos los campos correctos
    const appointment = validAppointments[0];

    await scheduleAppointmentViaUI(page, appointment);

    // Verificar mensaje de éxito
    await verifySuccessMessage(page, 'appointment-success', 'agendada exitosamente');

    // Verificar que el formulario se limpió
    await expect(page.locator('#appointment-patient')).toHaveValue('');
    await expect(page.locator('#appointment-doctor')).toHaveValue('');
  });

  test('TC-012: Validación de campos obligatorios - sin seleccionar paciente', async ({ page }) => {
    // Valor límite: campo vacío
    await page.selectOption('#appointment-doctor', { index: 1 });
    await page.fill('#appointment-date', validAppointments[0].date);
    await page.fill('#appointment-time', validAppointments[0].time);
    await page.click('#appointment-form button[type="submit"]');

    // Verificar error de validación HTML5
    const patientSelect = page.locator('#appointment-patient');
    const isInvalid = await patientSelect.evaluate(el => !el.checkValidity());
    expect(isInvalid).toBe(true);
  });

  test('TC-013: Validación de campos obligatorios - sin seleccionar doctor', async ({ page }) => {
    // Valor límite: campo vacío
    await page.selectOption('#appointment-patient', { index: 1 });
    await page.fill('#appointment-date', validAppointments[0].date);
    await page.fill('#appointment-time', validAppointments[0].time);
    await page.click('#appointment-form button[type="submit"]');

    const doctorSelect = page.locator('#appointment-doctor');
    const isInvalid = await doctorSelect.evaluate(el => !el.checkValidity());
    expect(isInvalid).toBe(true);
  });

  test('TC-014: Validación de campos obligatorios - sin fecha', async ({ page }) => {
    // Valor límite: campo vacío
    await page.selectOption('#appointment-patient', { index: 1 });
    await page.selectOption('#appointment-doctor', { index: 1 });
    await page.fill('#appointment-time', validAppointments[0].time);
    await page.click('#appointment-form button[type="submit"]');

    const dateInput = page.locator('#appointment-date');
    const isInvalid = await dateInput.evaluate(el => !el.checkValidity());
    expect(isInvalid).toBe(true);
  });

  test('TC-015: Validación de campos obligatorios - sin hora', async ({ page }) => {
    // Valor límite: campo vacío
    await page.selectOption('#appointment-patient', { index: 1 });
    await page.selectOption('#appointment-doctor', { index: 1 });
    await page.fill('#appointment-date', validAppointments[0].date);
    await page.click('#appointment-form button[type="submit"]');

    const timeInput = page.locator('#appointment-time');
    const isInvalid = await timeInput.evaluate(el => !el.checkValidity());
    expect(isInvalid).toBe(true);
  });

  test('TC-016: Intento de agendar cita en horario ocupado (conflicto)', async ({ page }) => {
    // Partición de equivalencia inválida: horario ya ocupado
    const conflictData = conflictingAppointments;

    // Agendar primera cita
    await scheduleAppointmentViaUI(page, {
      patientIndex: 0,
      doctorIndex: 0,
      date: conflictData.first.date,
      time: conflictData.first.time,
      reason: conflictData.first.reason
    });

    await verifySuccessMessage(page, 'appointment-success', 'agendada');
    await page.waitForTimeout(3500);

    // Intentar agendar segunda cita en el mismo horario y doctor
    await scheduleAppointmentViaUI(page, {
      patientIndex: 1,
      doctorIndex: 0,  // Mismo doctor
      date: conflictData.second.date,  // Misma fecha
      time: conflictData.second.time,  // Misma hora
      reason: conflictData.second.reason
    });

    // Verificar mensaje de error
    await verifyErrorMessage(page, 'time', 'horario ya está ocupado');
  });

  test('TC-017: Agendamiento exitoso de citas para el mismo paciente en diferentes horarios', async ({ page }) => {
    // Partición de equivalencia válida: diferentes horarios
    const appointment1 = validAppointments[0];
    const appointment2 = validAppointments[1];

    // Primera cita
    await scheduleAppointmentViaUI(page, appointment1);
    await verifySuccessMessage(page, 'appointment-success', 'agendada');
    await page.waitForTimeout(3500);

    // Segunda cita (mismo paciente, diferente horario)
    await scheduleAppointmentViaUI(page, {
      ...appointment2,
      patientIndex: appointment1.patientIndex  // Mismo paciente
    });
    await verifySuccessMessage(page, 'appointment-success', 'agendada');
  });

  test('TC-018: Agendamiento de cita en el mismo horario pero con diferente doctor', async ({ page }) => {
    // Partición de equivalencia válida: mismo horario, diferente doctor
    const conflictData = conflictingAppointments;

    // Primera cita con doctor 1
    await scheduleAppointmentViaUI(page, {
      patientIndex: 0,
      doctorIndex: 0,
      date: conflictData.first.date,
      time: conflictData.first.time,
      reason: conflictData.first.reason
    });
    await verifySuccessMessage(page, 'appointment-success', 'agendada');
    await page.waitForTimeout(3500);

    // Segunda cita con doctor 2 (diferente) en el mismo horario
    await scheduleAppointmentViaUI(page, {
      patientIndex: 1,
      doctorIndex: 1,  // Doctor diferente
      date: conflictData.second.date,
      time: conflictData.second.time,
      reason: conflictData.second.reason
    });

    // Debe agendar exitosamente
    await verifySuccessMessage(page, 'appointment-success', 'agendada');
  });
});
