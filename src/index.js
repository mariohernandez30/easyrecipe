import express from 'express';
import { initDatabase } from './data/initDb.js';
import { authRoutes } from './routes/auth.js';
import log from './utils/log.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'views')));

// Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', '../../public/login.html'));
});

// Routes
app.use('/auth', authRoutes);

// Initialize database and start server
initDatabase();
app.listen(port, () => {
  log(`Server running at http://localhost:${port}`);
});
