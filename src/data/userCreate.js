import db from './dbConnection.js';
import bcrypt from 'bcrypt';
import { INSERT_USER } from './queries.js';
import log from '../utils/log.js';

export async function createUser(username, email, password) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return new Promise((resolve, reject) => {
    db.run(INSERT_USER, [username, email, hashedPassword], function (err) {
      if (err) {
        log('Error creating user', { isError: true });
        reject(err);
        return;
      }
      resolve(this.lastID);
    });
  });
}
