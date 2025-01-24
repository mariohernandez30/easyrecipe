import db from './dbConnection.js';
import { CREATE_USERS_TABLE } from './queries.js';
import log from '../utils/log.js';

export function initDatabase() {
  db.run(CREATE_USERS_TABLE, (err) => {
    if (err) {
      log('Error creating users table', { isError: true });
      return;
    }
    log('Users table ready');
  });
}
