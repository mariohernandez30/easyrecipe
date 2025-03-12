import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './data/initDb.js';
import { authRoutes } from './routes/auth.js';
import { recipeRoutes } from './routes/recipes.js';
import { config } from './setup.js';
import { log } from './utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = Bun.env.NODE_ENV === 'production';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);

// Configuración para servir archivos estáticos
if (isProduction) {
  // En producción, servir archivos compilados desde dist
  app.use(express.static(path.join(__dirname, '..', 'dist')));

  // Ruta para todas las rutas no API (SPA)
  app.get('*', (req, res) => {
    // Excluimos las rutas de API
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
    }
  });
} else {
  // En desarrollo, mantenemos la carpeta public como legacy
  app.use(express.static(path.join(__dirname, '..', 'public')));

  // En desarrollo, las rutas antiguas siguen funcionando
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
}

initDatabase();
app.listen(config.port, () => {
  log(`Servidor ejecutándose en http://localhost:${config.port}`);
  log(`Modo: ${isProduction ? 'Producción' : 'Desarrollo'}`);
});
