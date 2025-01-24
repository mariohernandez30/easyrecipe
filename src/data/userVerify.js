import db from './dbConnection.js';
import bcrypt from 'bcrypt';
import { SELECT_USER_BY_EMAIL } from './queries.js';

export async function verifyUser(email, password) {
  return new Promise((resolve, reject) => {
    db.get(SELECT_USER_BY_EMAIL, [email], async (err, user) => {
      if (err) {
        reject(err);
        return;
      }
      if (!user) {
        resolve(null);
        return;
      }
      const match = await bcrypt.compare(password, user.password);
      resolve(match ? user : null);
    });
  });
}
