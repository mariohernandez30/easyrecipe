import express from 'express';
import { createUser } from '../data/userCreate.js';
import { deleteUser } from '../data/userDelete.js';
import { verifyUser } from '../data/userVerify.js';
import { generateToken, verifyToken } from '../middleware/auth.js';
import { $try, log } from '../utils.js';

const router = express.Router();

function validateRegisterData(userData) {
  const { username, email, password } = userData;

  if (!username || !email || !password) {
    return {
      isValid: false,
      error: {
        status: 400,
        message: 'Todos los campos son requeridos',
      },
    };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      error: {
        status: 400,
        message: 'La contraseña debe tener al menos 6 caracteres',
      },
    };
  }

  return { isValid: true };
}

function validateLoginData(userData) {
  const { email, password } = userData;

  if (!email || !password) {
    return {
      isValid: false,
      error: {
        status: 400,
        message: 'Email y contraseña son requeridos',
      },
    };
  }

  return { isValid: true };
}

function handleApiError(res, error, defaultMessage) {
  log(`Error: ${error.message}`, { isError: true });
  res.status(500).json({
    success: false,
    message: error.message || defaultMessage,
  });
}

async function processRegister(userData) {
  const validationResult = validateRegisterData(userData);
  if (!validationResult.isValid) {
    return validationResult.error;
  }

  const { username, email, password } = userData;
  await createUser(username, email, password);

  return {
    status: 201,
    data: {
      success: true,
      message: 'Usuario registrado exitosamente',
    },
  };
}

async function processLogin(userData) {
  const validationResult = validateLoginData(userData);
  if (!validationResult.isValid) {
    return validationResult.error;
  }

  const { email, password } = userData;
  const user = await verifyUser(email, password);

  if (!user) {
    return {
      status: 401,
      data: {
        success: false,
        message: 'Credenciales inválidas',
      },
    };
  }

  const token = await generateToken(user);

  return {
    status: 200,
    data: {
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    },
  };
}

async function processDeleteAccount(userId) {
  await deleteUser(userId);

  return {
    status: 200,
    data: {
      success: true,
      message: 'Cuenta eliminada exitosamente',
    },
  };
}

router.post('/register', async (req, res) => {
  const [error] = await $try(async () => {
    const response = await processRegister(req.body);
    return res.status(response.status).json(response.data);
  });

  if (error) {
    handleApiError(res, error, 'Error al registrar usuario');
  }
});

router.post('/login', async (req, res) => {
  const [error] = await $try(async () => {
    const response = await processLogin(req.body);
    return res.status(response.status).json(response.data);
  });

  if (error) {
    handleApiError(res, error, 'Error al iniciar sesión');
  }
});

router.post('/logout', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Sesión cerrada exitosamente',
  });
});

router.delete('/delete-account', verifyToken, async (req, res) => {
  const [error] = await $try(async () => {
    const userId = req.user.id;
    const response = await processDeleteAccount(userId);
    return res.status(response.status).json(response.data);
  });

  if (error) {
    handleApiError(res, error, 'Error al eliminar la cuenta');
  }
});

router.get('/verify', verifyToken, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

export { router as authRoutes };
