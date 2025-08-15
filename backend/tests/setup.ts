import { config } from 'dotenv';

// Configurar variables de entorno para testing
config({ path: '../.env' });

// Aumentar timeout para tests de integración
jest.setTimeout(30000);

// Setup global para tests
beforeAll(async () => {
  // Aquí podríamos configurar datos globales de test si fuera necesario
});

afterAll(async () => {
  // Cleanup global si fuera necesario
});
