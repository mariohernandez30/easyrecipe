import bcrypt from 'bcrypt';
import { $try, log } from '../lib/utils.js';
import db from './dbConnection.js';
import { INSERT_USER } from './queries.js';

export async function createUser(username, email, password) {
  const [error, result] = await $try(async () => {
    const userExists = await new Promise((resolve, reject) => {
      db.get(
        'SELECT username, email FROM users WHERE username = ? OR email = ?',
        [username, email],
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        }
      );
    });

    if (userExists) {
      if (userExists.username === username) {
        throw new Error('El nombre de usuario ya está en uso');
      }
      if (userExists.email === email) {
        throw new Error('El correo electrónico ya está registrado');
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    return new Promise((resolve, reject) => {
      db.run(INSERT_USER, [username, email, hashedPassword], function (err) {
        if (err) {
          log('Error al crear usuario en la base de datos', { isError: true });
          reject(err);
          return;
        }
        log('Usuario creado exitosamente');
        resolve(this.lastID);
      });
    });
  });

  if (error) {
    log(`Error al crear usuario: ${error.message}`, { isError: true });
    throw error;
  }

  return result;
}
