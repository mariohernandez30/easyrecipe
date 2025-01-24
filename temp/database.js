import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';
import log from '../utils/log.js';

const db = new sqlite3.Database('./db/users.sqlite', (err) => {
  if (err) {
    log('Error connecting to database', { isError: true });
  }
  log('Connected to the SQLite database');
});

// Initialize database with users table
export function initDatabase() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.run(createTableSQL, (err) => {
    if (err) {
      log('Error creating users table', { isError: true });
      return;
    }
    log('Users table ready');
  });
}

// Create new user
export async function createUser(username, email, password) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword],
      function (err) {
        if (err) {
          log('Error creating user', { isError: true });
          reject(err);
          return;
        }
        resolve(this.lastID);
      }
    );
  });
}

// Verify user login
export async function verifyUser(email, password) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM users WHERE email = ?',
      [email],
      async (err, user) => {
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
      }
    );
  });
}
