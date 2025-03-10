import db from './dbConnection.js';
import bcrypt from 'bcrypt';
import { INSERT_USER } from './queries.js';
import log from '../utils/log.js';

export async function createUser(username, email, password) {
  try {
    // Verificar si el usuario ya existe
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

    // Si no existe, crear el usuario
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
  } catch (error) {
    log(`Error al crear usuario: ${error.message}`, { isError: true });
    throw error;
  }
}
