import express from 'express';
import { createUser } from '../data/userCreate.js';
import { deleteUser } from '../data/userDelete.js';
import { verifyUser } from '../data/userVerify.js';
import { generateToken, verifyToken } from '../middleware/auth.js';
import log from '../utils/log.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres',
      });
    }

    await createUser(username, email, password);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
    });
  } catch (error) {
    log(`Error en registro: ${error.message}`, { isError: true });
    res.status(500).json({
      success: false,
      message: error.message || 'Error al registrar usuario',
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos',
      });
    }

    const user = await verifyUser(email, password);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
    }

    // Generar token JWT
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    log(`Error en login: ${error.message}`, { isError: true });
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
    });
  }
});

// Ruta para cerrar sesión (no requiere operación en el servidor con JWT)
router.post('/logout', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Sesión cerrada exitosamente',
  });
});

// Ruta para eliminar cuenta (requiere autenticación)
router.delete('/delete-account', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    await deleteUser(userId);

    res.status(200).json({
      success: true,
      message: 'Cuenta eliminada exitosamente',
    });
  } catch (error) {
    log(`Error al eliminar cuenta: ${error.message}`, { isError: true });
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la cuenta',
    });
  }
});

// Ruta para verificar si el token es válido
router.get('/verify', verifyToken, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

export { router as authRoutes };
