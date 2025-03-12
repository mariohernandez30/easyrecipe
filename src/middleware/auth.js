import jwt from 'jsonwebtoken';
import { config } from '../setup.js';
import log from '../utils/log.js';

export const generateToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
  };

  try {
    const token = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
    return token;
  } catch (error) {
    log(`Error al generar token: ${error.message}`, { isError: true });
    throw error;
  }
};

export const verifyToken = (req, res, next) => {
  try {
    // Solo usamos el header de Authorization
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
  } catch (error) {
    log(`Error al verificar token: ${error.message}`, { isError: true });
    return res
      .status(500)
      .json({ success: false, message: 'Error al procesar la autenticación.' });
  }
};
