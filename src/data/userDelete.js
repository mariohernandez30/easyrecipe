import log from '../utils/log.js';
import db from './dbConnection.js';

export async function deleteUser(userId) {
  try {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM users WHERE id = ?', [userId], function (err) {
        if (err) {
          log(`Error al eliminar usuario: ${err.message}`, { isError: true });
          reject(err);
          return;
        }

        if (this.changes === 0) {
          const error = new Error('Usuario no encontrado');
          log(`Error al eliminar usuario: ${error.message}`, { isError: true });
          reject(error);
          return;
        }

        log('Usuario eliminado exitosamente');
        resolve(true);
      });
    });
  } catch (error) {
    log(`Error al eliminar usuario: ${error.message}`, { isError: true });
    throw error;
  }
}
