const { test, expect } = require('@playwright/test');
const {
  resetDatabase,
  registerPatientViaUI,
  verifyErrorMessage,
  verifySuccessMessage,
  waitForFormReady
} = require('./helpers/testHelpers');
const { validPatients, invalidEmails, invalidPhones, emptyFields } = require('./helpers/testData');

test.describe('Registro de Pacientes', () => {
  test.beforeEach(async ({ page, request }) => {
    await resetDatabase(request);
    await page.goto('/');
    await waitForFormReady(page);
  });

  test('TC-001: Registro exitoso de paciente con datos válidos', async ({ page }) => {
    // Caso de prueba con partición de equivalencia válida
    const patient = validPatients[0];

    await registerPatientViaUI(page, patient);

    // Verificar mensaje de éxito
    await verifySuccessMessage(page, 'patient-success', 'registrado exitosamente');

    // Verificar que el formulario se limpió
    await expect(page.locator('#patient-name')).toHaveValue('');
    await expect(page.locator('#patient-email')).toHaveValue('');
    await expect(page.locator('#patient-phone')).toHaveValue('');

    // Verificar que el paciente aparece en el selector de citas
    await page.waitForTimeout(500);
    const option = page.locator('#appointment-patient option', { hasText: patient.name });
    await expect(option).toBeVisible();
  });

  test('TC-002: Validación de email inválido - sin @', async ({ page }) => {
    // Partición de equivalencia inválida: email sin @
    const invalidData = invalidEmails[0];

    await registerPatientViaUI(page, invalidData);

    // Verificar mensaje de error
    await verifyErrorMessage(page, 'email', invalidData.expectedError);

    // Verificar que el campo tiene clase de error
    await expect(page.locator('#patient-email')).toHaveClass(/error/);
  });

  test('TC-003: Validación de email inválido - sin dominio', async ({ page }) => {
    // Partición de equivalencia inválida: email sin dominio
    const invalidData = invalidEmails[1];

    await registerPatientViaUI(page, invalidData);

    await verifyErrorMessage(page, 'email', invalidData.expectedError);
  });

  test('TC-004: Validación de teléfono inválido - muy corto (valor límite)', async ({ page }) => {
    // Valor límite inferior: teléfono con menos de 10 caracteres
    const invalidData = invalidPhones[0];

    await registerPatientViaUI(page, invalidData);

    await verifyErrorMessage(page, 'phone', invalidData.expectedError);
    await expect(page.locator('#patient-phone')).toHaveClass(/error/);
  });

  test('TC-005: Validación de teléfono inválido - letras', async ({ page }) => {
    // Partición de equivalencia inválida: caracteres no numéricos
    const invalidData = invalidPhones[1];

    await registerPatientViaUI(page, invalidData);

    await verifyErrorMessage(page, 'phone', invalidData.expectedError);
  });

  test('TC-006: Validación de campos vacíos - nombre (valor límite)', async ({ page }) => {
    // Valor límite: campo vacío
    const invalidData = emptyFields[0];

    await registerPatientViaUI(page, invalidData);

    await verifyErrorMessage(page, 'name', 'obligatorio');
  });

  test('TC-007: Validación de campos vacíos - email (valor límite)', async ({ page }) => {
    // Valor límite: campo vacío
    const invalidData = emptyFields[1];

    await registerPatientViaUI(page, invalidData);

    await verifyErrorMessage(page, 'email', 'obligatorio');
  });

  test('TC-008: Validación de campos vacíos - teléfono (valor límite)', async ({ page }) => {
    // Valor límite: campo vacío
    const invalidData = emptyFields[2];

    await registerPatientViaUI(page, invalidData);

    await verifyErrorMessage(page, 'phone', 'obligatorio');
  });

  test('TC-009: Validación de email duplicado', async ({ page, request }) => {
    // Primero registrar un paciente
    const patient = validPatients[0];
    await registerPatientViaUI(page, patient);
    await verifySuccessMessage(page, 'patient-success', 'registrado');

    // Esperar que el mensaje desaparezca
    await page.waitForTimeout(3500);

    // Intentar registrar el mismo email nuevamente
    await registerPatientViaUI(page, patient);

    // Verificar error de email duplicado
    await verifyErrorMessage(page, 'email', 'ya está registrado');
  });

  test('TC-010: Registro de múltiples pacientes con diferentes formatos de teléfono', async ({ page }) => {
    // Partición de equivalencia: diferentes formatos válidos de teléfono
    for (let i = 0; i < 3; i++) {
      const patient = validPatients[i];
      await registerPatientViaUI(page, patient);
      await verifySuccessMessage(page, 'patient-success', 'registrado');
      await page.waitForTimeout(3500); // Esperar que desaparezca el mensaje
    }

    // Verificar que todos aparecen en el selector
    for (const patient of validPatients) {
      const option = page.locator('#appointment-patient option', { hasText: patient.name });
      await expect(option).toBeVisible();
    }
  });
});
