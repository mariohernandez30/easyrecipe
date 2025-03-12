import log from './utils/log.js';

// Configuraciones de la aplicación
export const config = {
  // Servidor
  port: Bun.env.PORT || 3000,

  // Base de datos
  dbPath: Bun.env.DB_PATH || 'db/easyrecipe.db',

  // Autenticación
  jwt: {
    secret: Bun.env.JWT_SECRET || 'easyrecipe_secret_key',
    expiresIn: '168h',
  },
};

// Inicializar configuraciones adicionales
export function setupApp() {
  // Aquí se pueden agregar otras inicializaciones si es necesario
  log(`Configuración cargada: Puerto ${config.port}`);

  return config;
}
