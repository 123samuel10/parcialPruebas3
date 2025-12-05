const { test, expect } = require('@playwright/test');
const {
  resetDatabase,
  registerPatientViaAPI,
  scheduleAppointmentViaUI,
  verifyAppointmentInList,
  cancelAppointment,
  verifyAppointmentCancelled,
  waitForFormReady
} = require('./helpers/testHelpers');
const { validPatients, validAppointments } = require('./helpers/testData');

test.describe('Cancelación de Citas', () => {
  test.beforeEach(async ({ page, request }) => {
    await resetDatabase(request);

    // Registrar pacientes de prueba
    for (const patient of validPatients) {
      await registerPatientViaAPI(request, patient);
    }

    await page.goto('/');
    await waitForFormReady(page);
  });

  test('TC-019: Cancelación exitosa de cita activa', async ({ page }) => {
    // Partición de equivalencia válida: cita activa
    const appointment = validAppointments[0];
    const patientName = validPatients[appointment.patientIndex].name;

    // Agendar cita
    await scheduleAppointmentViaUI(page, appointment);
    await page.waitForTimeout(1000);

    // Verificar que aparece en la lista
    await verifyAppointmentInList(page, patientName);

    // Cancelar cita
    await cancelAppointment(page, patientName);

    // Esperar el alert de confirmación
    await page.waitForTimeout(1000);

    // Verificar que la cita está cancelada
    await verifyAppointmentCancelled(page, patientName);

    // Verificar que no hay botón de cancelar
    const cancelledCard = page.locator('.appointment-card.cancelled', { hasText: patientName });
    const cancelButton = cancelledCard.locator('button.btn-danger');
    await expect(cancelButton).not.toBeVisible();
  });

  test('TC-020: Verificar filtro de citas activas', async ({ page }) => {
    // Agendar dos citas
    const appointment1 = validAppointments[0];
    const appointment2 = validAppointments[1];
    const patient1Name = validPatients[appointment1.patientIndex].name;
    const patient2Name = validPatients[appointment2.patientIndex].name;

    await scheduleAppointmentViaUI(page, appointment1);
    await page.waitForTimeout(3500);
    await scheduleAppointmentViaUI(page, appointment2);
    await page.waitForTimeout(1000);

    // Cancelar una cita
    await cancelAppointment(page, patient1Name);
    await page.waitForTimeout(1000);

    // Filtrar solo activas
    await page.selectOption('#filter-status', 'active');
    await page.waitForTimeout(500);

    // Verificar que solo aparece la cita activa
    await verifyAppointmentInList(page, patient2Name);

    // Verificar que la cita cancelada no aparece
    const cancelledCard = page.locator('.appointment-card', { hasText: patient1Name });
    await expect(cancelledCard).not.toBeVisible();
  });

  test('TC-021: Verificar filtro de citas canceladas', async ({ page }) => {
    // Agendar y cancelar una cita
    const appointment = validAppointments[0];
    const patientName = validPatients[appointment.patientIndex].name;

    await scheduleAppointmentViaUI(page, appointment);
    await page.waitForTimeout(1000);
    await cancelAppointment(page, patientName);
    await page.waitForTimeout(1000);

    // Filtrar solo canceladas
    await page.selectOption('#filter-status', 'cancelled');
    await page.waitForTimeout(500);

    // Verificar que aparece la cita cancelada
    await verifyAppointmentCancelled(page, patientName);
  });

  test('TC-022: Visualización de todas las citas (activas y canceladas)', async ({ page }) => {
    // Agendar dos citas
    const appointment1 = validAppointments[0];
    const appointment2 = validAppointments[1];
    const patient1Name = validPatients[appointment1.patientIndex].name;
    const patient2Name = validPatients[appointment2.patientIndex].name;

    await scheduleAppointmentViaUI(page, appointment1);
    await page.waitForTimeout(3500);
    await scheduleAppointmentViaUI(page, appointment2);
    await page.waitForTimeout(1000);

    // Cancelar una
    await cancelAppointment(page, patient1Name);
    await page.waitForTimeout(1000);

    // Filtrar todas
    await page.selectOption('#filter-status', '');
    await page.waitForTimeout(500);

    // Verificar que ambas aparecen
    await expect(page.locator('.appointment-card', { hasText: patient1Name })).toBeVisible();
    await expect(page.locator('.appointment-card', { hasText: patient2Name })).toBeVisible();
  });
});
