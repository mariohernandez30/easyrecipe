import express from 'express';
import { createUser } from '../data/userCreate.js';
import { verifyUser } from '../data/userVerify.js';
import log from '../utils/log.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      throw new Error('Todos los campos son requeridos');
    }

    if (password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    await createUser(username, email, password);
    res.redirect('/login.html');
  } catch (error) {
    log(`Error en registro: ${error.message}`, { isError: true });
    // Aquí podrías agregar una query string para mostrar el error en el frontend
    res.redirect('/register.html');
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new Error('Email y contraseña son requeridos');
    }

    const user = await verifyUser(email, password);
    if (user) {
      res.redirect('/dashboard.html');
    } else {
      throw new Error('Credenciales inválidas');
    }
  } catch (error) {
    log(`Error en login: ${error.message}`, { isError: true });
    res.redirect('/login.html');
  }
});

export { router as authRoutes };
