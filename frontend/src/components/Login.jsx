import { signal } from '@preact/signals';
import { route } from 'preact-router';
import { useContext, useEffect } from 'preact/hooks';
import { $try } from '../utils';
import { AuthContext, auth } from './App';

// Signals locales del componente
export const loginForm = {
  email: signal(''),
  password: signal(''),
  isLoading: signal(false),
  error: signal(null),
  showPassword: signal(false),
};

export function Login() {
  const { login } = useContext(AuthContext);

  // Cargar email del sessionStorage si está disponible
  useEffect(() => {
    const registeredEmail = sessionStorage.getItem('registeredEmail');
    if (registeredEmail) {
      loginForm.email.value = registeredEmail;
      // Limpiar después de usarlo
      sessionStorage.removeItem('registeredEmail');
    }
  }, []);

  if (auth.isAuthenticated.value) {
    route('/dashboard');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    loginForm.isLoading.value = true;
    loginForm.error.value = null;

    const [err, data] = await $try(async () => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginForm.email.value,
          password: loginForm.password.value,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al iniciar sesión');
      }

      return result;
    });

    loginForm.isLoading.value = false;

    if (err) {
      loginForm.error.value = err.message;
      return;
    }

    if (data.token) {
      login(data.token, data.user);
      route('/dashboard');
    }
  };

  const togglePasswordVisibility = () => {
    loginForm.showPassword.value = !loginForm.showPassword.value;
  };

  return (
    <div class="container">
      <div class="app-container">
        <h1>Iniciar Sesión</h1>

        {loginForm.error.value && (
          <div class="error-message">{loginForm.error.value}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              value={loginForm.email.value}
              onInput={(e) => (loginForm.email.value = e.target.value)}
              required
            />
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                type={loginForm.showPassword.value ? 'text' : 'password'}
                id="password"
                value={loginForm.password.value}
                onInput={(e) => (loginForm.password.value = e.target.value)}
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                }}
              >
                {loginForm.showPassword.value ? (
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path
                      fill="gold"
                      d="M9 21h6v-1H9v1zM12 2C8.13 2 5 5.13 5 9c0 3.86 3.14 7 7 7s7-3.14 7-7c0-3.87-3.13-7-7-7zM12 14c-2.76 0-5-2.24-5-5 0-0.55 0.45-1 1-1s1 0.45 1 1c0 1.66 1.34 3 3 3s3-1.34 3-3c0-0.55 0.45-1 1-1s1 0.45 1 1C17 11.76 14.76 14 12 14z"
                    />
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M9 21h6v-1H9v1zM12 2C8.13 2 5 5.13 5 9c0 3.86 3.14 7 7 7s7-3.14 7-7c0-3.87-3.13-7-7-7zM12 14c-2.76 0-5-2.24-5-5 0-0.55 0.45-1 1-1s1 0.45 1 1c0 1.66 1.34 3 3 3s3-1.34 3-3c0-0.55 0.45-1 1-1s1 0.45 1 1C17 11.76 14.76 14 12 14z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            class="btn"
            disabled={loginForm.isLoading.value}
          >
            {loginForm.isLoading.value ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div class="form-footer">
          <p>
            ¿No tienes una cuenta?
            <a
              href="/register"
              onClick={(e) => {
                e.preventDefault();
                route('/register');
              }}
            >
              Regístrate
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
