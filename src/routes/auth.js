import express from 'express';
import { createUser } from '../data/userCreate.js';
import { verifyUser } from '../data/userVerify.js';
import log from '../utils/log.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    await createUser(username, email, password);
    res.redirect('login.html');
  } catch (error) {
    log(`Registration failed: ${error.message}`, { isError: true });
    res.redirect('../public/register.html');
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await verifyUser(email, password);
    if (user) {
      res.redirect('/dashboard.html');
    } else {
      res.redirect('../public/login.html');
    }
  } catch (error) {
    log(`Login failed: ${error.message}`, { isError: true });
    res.redirect('login.html');
  }
});

export { router as authRoutes };
