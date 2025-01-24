export const CREATE_USERS_TABLE = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

export const INSERT_USER =
  'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';

export const SELECT_USER_BY_EMAIL = 'SELECT * FROM users WHERE email = ?';
