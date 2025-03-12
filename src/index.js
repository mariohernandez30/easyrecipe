import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './data/initDb.js';
import { authRoutes } from './routes/auth.js';
import { recipeRoutes } from './routes/recipes.js';
import { config } from './setup.js';
import { log } from './utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '..', 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);

// Cliente SPA (Single Page Application) routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'dashboard.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'register.html'));
});

app.get('/recipe-assistant', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'recipe-assistant.html'));
});

initDatabase();
app.listen(config.port, () => {
  log(`Servidor ejecutándose en http://localhost:${config.port}`);
});
