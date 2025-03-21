import { $try, log } from '../lib/utils.js';
import db from './dbConnection.js';
import { CREATE_USERS_TABLE } from './queries.js';

export async function initDatabase() {
  const [error] = await $try(async () => {
    db.exec(CREATE_USERS_TABLE);
    log('Base de datos inicializada. Tabla de usuarios lista.');
  });

  if (error) {
    log(`Error al inicializar la base de datos: ${error.message}`, {
      isError: true,
    });
  }
}
