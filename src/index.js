import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './data/initDb.js';
import { authRoutes } from './routes/auth.js';
import { config, setupApp } from './setup.js';
import log from './utils/log.js';

// Configuración de __dirname para ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Inicializar configuración
setupApp();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de archivos estáticos
app.use(express.static(path.join(__dirname, '..', 'public')));

// API Routes
app.use('/api/auth', authRoutes);

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

// Inicializar base de datos y servidor
initDatabase();
app.listen(config.port, () => {
  log(`Servidor ejecutándose en http://localhost:${config.port}`);
});
