import express from 'express';
import { initDatabase } from './data/initDb.js';
import { authRoutes } from './routes/auth.js';
import log from './utils/log.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración de __dirname para ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de archivos estáticos
app.use(express.static(path.join(__dirname, '..', 'public')));

// Ruta por defecto
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// Rutas de autenticación
app.use('/auth', authRoutes);

// Inicializar base de datos y servidor
initDatabase();
app.listen(port, () => {
  log(`Servidor ejecutándose en http://localhost:${port}`);
});
