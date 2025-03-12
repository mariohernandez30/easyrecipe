import jwt from 'jsonwebtoken';
import { $try, log } from '../../shared/shared.js';
import { config } from '../setup.js';

export const generateToken = async (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
  };

  const [error, token] = await $try(() => {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  });

  if (error) {
    log(`Error al generar token: ${error.message}`, { isError: true });
    throw error;
  }

  return token;
};

export const verifyToken = async (req, res, next) => {
  const [error] = await $try(async () => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Acceso no autorizado. Token no proporcionado.',
      });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, config.jwt.secret, (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .json({ success: false, message: 'Token inválido o expirado.' });
      }

      req.user = decoded;
      next();
    });
  });

  if (error) {
    log(`Error al verificar token: ${error.message}`, { isError: true });
    return res
      .status(500)
      .json({ success: false, message: 'Error al procesar la autenticación.' });
  }
};
