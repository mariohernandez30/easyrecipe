import log from '../utils/log.js';
import db from './dbConnection.js';
import { CREATE_USERS_TABLE } from './queries.js';

export function initDatabase() {
  try {
    // Ejecutar la creación de la tabla
    db.exec(CREATE_USERS_TABLE);
    log('Base de datos inicializada. Tabla de usuarios lista.');
  } catch (error) {
    log(`Error al inicializar la base de datos: ${error.message}`, {
      isError: true,
    });
  }
}
