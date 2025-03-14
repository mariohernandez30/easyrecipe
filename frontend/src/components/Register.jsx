import { signal } from '@preact/signals';
import { route } from 'preact-router';
import { useContext } from 'preact/hooks';
import { $try } from '../../../shared/shared.js';
import { AuthContext, auth } from './App';

// Signals locales del componente
export const registerForm = {
  username: signal(''),
  email: signal(''),
  password: signal(''),
  confirmPassword: signal(''),
  isLoading: signal(false),
  error: signal(null),
};

// Validación de contraseña
export const passwordValidation = {
  hasMinLength: signal(false),
  hasLetter: signal(false),
  hasNumber: signal(false),
  isValid: signal(false),
  showPassword: signal(false),
};

// Actualizar validaciones cuando cambia la contraseña
function updatePasswordValidation(password) {
  passwordValidation.hasMinLength.value = password.length >= 8;
  passwordValidation.hasLetter.value = /[a-zA-Z]/.test(password);
  passwordValidation.hasNumber.value = /[0-9]/.test(password);

  passwordValidation.isValid.value =
    passwordValidation.hasMinLength.value &&
    passwordValidation.hasLetter.value &&
    passwordValidation.hasNumber.value;
}

export function Register() {
  const { login } = useContext(AuthContext);

  if (auth.isAuthenticated.value) {
    route('/dashboard');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (registerForm.password.value !== registerForm.confirmPassword.value) {
      registerForm.error.value = 'Las contraseñas no coinciden';
      return;
    }

    // Verificar que la contraseña cumple con los requisitos
    if (!passwordValidation.isValid.value) {
      registerForm.error.value =
        'La contraseña no cumple con los requisitos de seguridad';
      return;
    }

    registerForm.isLoading.value = true;
    registerForm.error.value = null;

    const [err, data] = await $try(async () => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: registerForm.username.value,
          email: registerForm.email.value,
          password: registerForm.password.value,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al registrar usuario');
      }

      return result;
    });

    registerForm.isLoading.value = false;

    if (err) {
      registerForm.error.value = err.message;
      return;
    }

    // En lugar de iniciar sesión automáticamente, redirigir al login con el email
    const registeredEmail = registerForm.email.value;

    // Limpiar el formulario
    registerForm.username.value = '';
    registerForm.email.value = '';
    registerForm.password.value = '';
    registerForm.confirmPassword.value = '';

    // Guardar el email en sessionStorage para prellenarlo en login
    sessionStorage.setItem('registeredEmail', registeredEmail);

    // Mostrar mensaje de éxito y redirigir
    alert('Registro exitoso! Ahora puedes iniciar sesión.');
    route('/login');
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      passwordValidation.showPassword.value =
        !passwordValidation.showPassword.value;
    }
  };

  return (
    <div class="container">
      <div class="app-container">
        <h1>Registro</h1>

        {registerForm.error.value && (
          <div class="error-message">{registerForm.error.value}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div class="form-group">
            <label for="username">Nombre de usuario</label>
            <input
              type="text"
              id="username"
              value={registerForm.username.value}
              onInput={(e) => (registerForm.username.value = e.target.value)}
              required
            />
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              value={registerForm.email.value}
              onInput={(e) => (registerForm.email.value = e.target.value)}
              required
            />
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                type={
                  passwordValidation.showPassword.value ? 'text' : 'password'
                }
                id="password"
                value={registerForm.password.value}
                onInput={(e) => {
                  registerForm.password.value = e.target.value;
                  updatePasswordValidation(e.target.value);
                }}
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('password')}
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
                {passwordValidation.showPassword.value ? (
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path
                      fill="gold"
                      d="M7,22H9V20H7V22zM11,22H13V20H11V22zM15,22H17V20H15V22zM12,2A1,1 0 0,1 13,3V6.25L18.29,11.54C18.68,11.16 19.22,10.95 19.79,10.95C20.82,10.95 21.69,11.82 21.69,12.85C21.69,13.89 20.82,14.75 19.79,14.75H17V17H7V14.75H4.21C3.18,14.75 2.31,13.89 2.31,12.85C2.31,11.82 3.18,10.95 4.21,10.95C4.78,10.95 5.32,11.16 5.71,11.54L11,6.25V3A1,1 0 0,1 12,2Z"
                    />
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M7,22H9V20H7V22zM11,22H13V20H11V22zM15,22H17V20H15V22zM12,2A1,1 0 0,1 13,3V6.25L18.29,11.54C18.68,11.16 19.22,10.95 19.79,10.95C20.82,10.95 21.69,11.82 21.69,12.85C21.69,13.89 20.82,14.75 19.79,14.75H17V17H7V14.75H4.21C3.18,14.75 2.31,13.89 2.31,12.85C2.31,11.82 3.18,10.95 4.21,10.95C4.78,10.95 5.32,11.16 5.71,11.54L11,6.25V3A1,1 0 0,1 12,2Z"
                    />
                  </svg>
                )}
              </button>
            </div>

            <div
              class="password-validation"
              style={{ marginTop: '8px', fontSize: '0.85rem' }}
            >
              <div
                style={{
                  color: passwordValidation.hasMinLength.value
                    ? 'green'
                    : 'red',
                }}
              >
                ✓ Al menos 8 caracteres
              </div>
              <div
                style={{
                  color: passwordValidation.hasLetter.value ? 'green' : 'red',
                }}
              >
                ✓ Al menos una letra
              </div>
              <div
                style={{
                  color: passwordValidation.hasNumber.value ? 'green' : 'red',
                }}
              >
                ✓ Al menos un número
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirmar contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                type={
                  passwordValidation.showPassword.value ? 'text' : 'password'
                }
                id="confirmPassword"
                value={registerForm.confirmPassword.value}
                onInput={(e) =>
                  (registerForm.confirmPassword.value = e.target.value)
                }
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('password')}
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
                {passwordValidation.showPassword.value ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            class="btn"
            disabled={
              registerForm.isLoading.value || !passwordValidation.isValid.value
            }
          >
            {registerForm.isLoading.value ? 'Cargando...' : 'Registrarse'}
          </button>
        </form>

        <div class="form-footer">
          <p>
            ¿Ya tienes una cuenta?
            <a
              href="/login"
              onClick={(e) => {
                e.preventDefault();
                route('/login');
              }}
            >
              Iniciar sesión
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
