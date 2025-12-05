const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0, // Reducido de 2 a 1
  workers: 1,
  timeout: 30000, // 30 segundos por test (reducido del default de 30s)
  expect: {
    timeout: 5000 // 5 segundos para assertions (reducido de 10s)
  },
  reporter: [
    ['html'],
    ['list']
  ],
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'retain-on-failure', // Solo guardar trace en fallo final
    screenshot: 'only-on-failure',
    video: 'off', // Desactivar video para acelerar
    actionTimeout: 10000 // 10 segundos para acciones (reducido de 30s)
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: [
    {
      command: 'cd backend && npm start',
      url: 'http://localhost:3000/api/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
    {
      command: 'cd frontend && node server.js',
      url: 'http://localhost:8080',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    }
  ],
});
