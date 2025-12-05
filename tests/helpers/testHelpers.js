const { expect } = require('@playwright/test');

/**
 * Helper para limpiar la base de datos antes de cada test
 */
async function resetDatabase(request) {
  try {
    await request.post('http://localhost:3000/api/appointments/reset');
  } catch (error) {
    console.log('Error resetting database:', error.message);
  }
}

/**
 * Helper para registrar un paciente a través de la API
 */
async function registerPatientViaAPI(request, patientData) {
  const response = await request.post('http://localhost:3000/api/patients', {
    data: patientData
  });
  const data = await response.json();
  return data.patient;
}

/**
 * Helper para registrar un paciente a través de la UI
 */
async function registerPatientViaUI(page, patientData) {
  await page.fill('#patient-name', patientData.name);
  await page.fill('#patient-email', patientData.email);
  await page.fill('#patient-phone', patientData.phone);
  await page.click('#patient-form button[type="submit"]');
  await page.waitForTimeout(500);
}

/**
 * Helper para verificar mensaje de error
 */
async function verifyErrorMessage(page, fieldId, expectedMessage) {
  const errorElement = page.locator(`#${fieldId}-error`);
  await expect(errorElement).toBeVisible({ timeout: 10000 });
  const errorText = await errorElement.textContent();
  if (errorText.trim() === '') {
    throw new Error(`Error element is visible but empty for field: ${fieldId}`);
  }
  expect(errorText.toLowerCase()).toContain(expectedMessage.toLowerCase());
}

/**
 * Helper para verificar mensaje de éxito
 */
async function verifySuccessMessage(page, successId, expectedMessage) {
  const successElement = page.locator(`#${successId}.show`);
  await expect(successElement).toBeVisible({ timeout: 10000 });
  const successText = await successElement.textContent();
  expect(successText.toLowerCase()).toContain(expectedMessage.toLowerCase());
}

/**
 * Helper para agendar una cita a través de la UI
 */
async function scheduleAppointmentViaUI(page, appointmentData) {
  // Seleccionar paciente
  await page.selectOption('#appointment-patient', { index: appointmentData.patientIndex + 1 });

  // Seleccionar doctor
  await page.selectOption('#appointment-doctor', { index: appointmentData.doctorIndex + 1 });

  // Ingresar fecha
  await page.fill('#appointment-date', appointmentData.date);

  // Ingresar hora
  await page.fill('#appointment-time', appointmentData.time);

  // Ingresar motivo (opcional)
  if (appointmentData.reason) {
    await page.fill('#appointment-reason', appointmentData.reason);
  }

  // Enviar formulario
  await page.click('#appointment-form button[type="submit"]');
}

/**
 * Helper para verificar que una cita aparece en la lista
 */
async function verifyAppointmentInList(page, patientName) {
  const appointmentCard = page.locator('.appointment-card', { hasText: patientName });
  await expect(appointmentCard).toBeVisible();
  return appointmentCard;
}

/**
 * Helper para cancelar una cita
 */
async function cancelAppointment(page, patientName) {
  const appointmentCard = await verifyAppointmentInList(page, patientName);

  // Click en el botón de cancelar
  page.once('dialog', dialog => dialog.accept());
  await appointmentCard.locator('button.btn-danger').click();
}

/**
 * Helper para verificar que una cita está cancelada
 */
async function verifyAppointmentCancelled(page, patientName) {
  const appointmentCard = page.locator('.appointment-card.cancelled', { hasText: patientName });
  await expect(appointmentCard).toBeVisible();

  const status = appointmentCard.locator('.appointment-status.cancelled');
  await expect(status).toBeVisible();
}

/**
 * Helper para esperar que el formulario esté listo
 */
async function waitForFormReady(page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500); // Pequeña espera adicional
}

/**
 * Helper para limpiar formulario
 */
async function clearForm(page, formId) {
  const form = page.locator(`#${formId}`);
  await form.evaluate(form => form.reset());
}

module.exports = {
  resetDatabase,
  registerPatientViaAPI,
  registerPatientViaUI,
  verifyErrorMessage,
  verifySuccessMessage,
  scheduleAppointmentViaUI,
  verifyAppointmentInList,
  cancelAppointment,
  verifyAppointmentCancelled,
  waitForFormReady,
  clearForm
};
