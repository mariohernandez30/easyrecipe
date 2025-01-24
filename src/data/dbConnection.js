import sqlite3 from 'sqlite3';
import log from '../utils/log.js';

const db = new sqlite3.Database('./db/users.sqlite', (err) => {
  if (err) {
    log('Error connecting to database', { isError: true });
  }
  log('Connected to the SQLite database');
});

export default db;
