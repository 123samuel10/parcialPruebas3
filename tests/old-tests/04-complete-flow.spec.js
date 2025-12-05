const { test, expect } = require('@playwright/test');
const {
  resetDatabase,
  registerPatientViaUI,
  scheduleAppointmentViaUI,
  verifySuccessMessage,
  verifyAppointmentInList,
  cancelAppointment,
  verifyAppointmentCancelled,
  waitForFormReady
} = require('./helpers/testHelpers');
const { validPatients, validAppointments } = require('./helpers/testData');

test.describe('Flujo Completo E2E', () => {
  test.beforeEach(async ({ page, request }) => {
    await resetDatabase(request);
    await page.goto('/');
    await waitForFormReady(page);
  });

  test('TC-023: Flujo completo - Registro de paciente, agendamiento y cancelación de cita', async ({ page }) => {
    /**
     * Este test cubre el flujo completo del sistema:
     * 1. Registro de paciente con datos válidos
     * 2. Agendamiento de cita exitoso
     * 3. Visualización de cita en la lista
     * 4. Cancelación de cita
     * 5. Verificación de estado cancelado
     */

    const patient = validPatients[0];
    const appointment = validAppointments[0];

    // PASO 1: Registrar paciente
    console.log('Paso 1: Registrando paciente...');
    await registerPatientViaUI(page, patient);
    await verifySuccessMessage(page, 'patient-success', 'registrado exitosamente');
    await page.waitForTimeout(3500);

    // Verificar que el paciente aparece en el selector
    const option = page.locator('#appointment-patient option', { hasText: patient.name });
    await expect(option).toBeVisible();

    // PASO 2: Agendar cita
    console.log('Paso 2: Agendando cita...');
    await scheduleAppointmentViaUI(page, {
      ...appointment,
      patientIndex: 0  // Usar el primer paciente (recién registrado)
    });
    await verifySuccessMessage(page, 'appointment-success', 'agendada exitosamente');
    await page.waitForTimeout(1000);

    // PASO 3: Verificar cita en la lista
    console.log('Paso 3: Verificando cita en la lista...');
    const appointmentCard = await verifyAppointmentInList(page, patient.name);

    // Verificar detalles de la cita
    await expect(appointmentCard).toContainText(patient.name);
    await expect(appointmentCard).toContainText('Activa');

    // Verificar que el botón de cancelar está visible
    const cancelButton = appointmentCard.locator('button.btn-danger');
    await expect(cancelButton).toBeVisible();

    // PASO 4: Cancelar cita
    console.log('Paso 4: Cancelando cita...');
    await cancelAppointment(page, patient.name);
    await page.waitForTimeout(1000);

    // PASO 5: Verificar estado cancelado
    console.log('Paso 5: Verificando estado cancelado...');
    await verifyAppointmentCancelled(page, patient.name);

    // Verificar que no se puede cancelar nuevamente
    const cancelledCard = page.locator('.appointment-card.cancelled', { hasText: patient.name });
    const cancelBtn = cancelledCard.locator('button.btn-danger');
    await expect(cancelBtn).not.toBeVisible();

    console.log('✓ Flujo completo ejecutado exitosamente');
  });

  test('TC-024: Flujo completo con múltiples pacientes y citas', async ({ page }) => {
    /**
     * Flujo más complejo con múltiples pacientes y citas
     */

    // Registrar múltiples pacientes
    for (let i = 0; i < 2; i++) {
      const patient = validPatients[i];
      await registerPatientViaUI(page, patient);
      await verifySuccessMessage(page, 'patient-success', 'registrado');
      await page.waitForTimeout(3500);
    }

    // Agendar múltiples citas
    for (let i = 0; i < 2; i++) {
      const appointment = validAppointments[i];
      await scheduleAppointmentViaUI(page, appointment);
      await verifySuccessMessage(page, 'appointment-success', 'agendada');
      await page.waitForTimeout(3500);
    }

    // Verificar que todas las citas aparecen
    for (let i = 0; i < 2; i++) {
      const patientName = validPatients[validAppointments[i].patientIndex].name;
      await verifyAppointmentInList(page, patientName);
    }

    // Cancelar una cita
    const patient1Name = validPatients[validAppointments[0].patientIndex].name;
    await cancelAppointment(page, patient1Name);
    await page.waitForTimeout(1000);

    // Verificar estados
    await verifyAppointmentCancelled(page, patient1Name);

    const patient2Name = validPatients[validAppointments[1].patientIndex].name;
    const activeCard = page.locator('.appointment-card:not(.cancelled)', { hasText: patient2Name });
    await expect(activeCard).toBeVisible();
  });

  test('TC-025: Flujo con validaciones - Intento de agendar sin registrar paciente', async ({ page }) => {
    /**
     * Test que verifica que no se puede agendar cita sin paciente
     */

    // Intentar agendar sin pacientes registrados
    await page.waitForTimeout(1000);

    // Verificar que no hay pacientes en el selector
    const options = await page.locator('#appointment-patient option').count();
    expect(options).toBe(1);  // Solo la opción "Seleccione un paciente"

    // Intentar agendar cita
    const appointment = validAppointments[0];
    await page.selectOption('#appointment-doctor', { index: 1 });
    await page.fill('#appointment-date', appointment.date);
    await page.fill('#appointment-time', appointment.time);
    await page.click('#appointment-form button[type="submit"]');

    // Verificar que falla la validación
    const patientSelect = page.locator('#appointment-patient');
    const isInvalid = await patientSelect.evaluate(el => !el.checkValidity());
    expect(isInvalid).toBe(true);
  });
});
