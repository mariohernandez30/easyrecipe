import { signal } from '@preact/signals';
import { createContext } from 'preact';
import { Router, route } from 'preact-router';
import { useEffect } from 'preact/hooks';
import { $try } from '../utils';

import { Dashboard } from './Dashboard';
import { Login } from './Login';
import { RecipeAssistant } from './RecipeAssistant';
import { Register } from './Register';

// Definición de los signals globales
export const auth = {
  isAuthenticated: signal(false),
  user: signal(null),
  isLoading: signal(true),
};

// Crear contexto para acceder a las funciones de autenticación
export const AuthContext = createContext(null);

export function App() {
  useEffect(() => {
    verifyAuth();
  }, []);

  const verifyAuth = async () => {
    auth.isLoading.value = true;

    const token = localStorage.getItem('token');
    if (!token) {
      auth.isAuthenticated.value = false;
      auth.user.value = null;
      auth.isLoading.value = false;
      return;
    }

    const [error, data] = await $try(async () => {
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error de verificación');
      }

      return result;
    });

    if (error || !data.success) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      auth.isAuthenticated.value = false;
      auth.user.value = null;
    } else {
      auth.isAuthenticated.value = true;
      if (data.user) {
        auth.user.value = data.user;
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        auth.user.value = JSON.parse(localStorage.getItem('user'));
      }
    }

    auth.isLoading.value = false;
  };

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    auth.isAuthenticated.value = true;
    auth.user.value = userData;
  };

  const logout = async () => {
    const token = localStorage.getItem('token');

    if (token) {
      await $try(async () => {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      });
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    auth.isAuthenticated.value = false;
    auth.user.value = null;
    route('/login');
  };

  if (auth.isLoading.value) {
    return (
      <div class="container">
        <div class="app-container">
          <h1>EasyRecipe</h1>
          <p>Tu asistente para recetas fáciles y deliciosas</p>
          <div class="loading-indicator">
            <p>Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  // Creamos un objeto con las funciones de autenticación
  const authFunctions = {
    login,
    logout,
    verifyAuth,
  };

  return (
    <AuthContext.Provider value={authFunctions}>
      <Router>
        <Login path="/login" />
        <Register path="/register" />
        <Dashboard path="/dashboard" />
        <RecipeAssistant path="/recipe-assistant" />
        <RedirectHome default />
      </Router>
    </AuthContext.Provider>
  );
}

function RedirectHome() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      route('/dashboard');
    } else {
      route('/login');
    }
  }, []);

  return null;
}
