import { route } from 'preact-router';
import { useContext } from 'preact/hooks';
import { AuthContext, auth } from './App';

export function Dashboard() {
  const { logout } = useContext(AuthContext);

  if (!auth.isAuthenticated.value) {
    route('/login');
    return null;
  }

  const handleDeleteAccount = () => {
    if (
      confirm(
        '¿Está seguro que desea eliminar su cuenta? Esta acción no se puede deshacer.'
      )
    ) {
      // Aquí iría la lógica para eliminar la cuenta
      // Por ahora solo cerramos sesión
      logout();
    }
  };

  return (
    <div class="container">
      <div class="app-container">
        <h1>Mi Dashboard</h1>

        <div class="user-info">
          <h2>
            Bienvenido, <span>{auth.user.value?.username || 'Usuario'}</span>
          </h2>
          <p>
            Email: <span>{auth.user.value?.email || 'correo@ejemplo.com'}</span>
          </p>
        </div>

        <div class="dashboard-actions">
          <h3>Menú de opciones</h3>
          <div class="action-buttons">
            <a
              href="/recipe-assistant"
              class="btn"
              style={{
                textDecoration: 'none',
                display: 'block',
                backgroundColor: '#27ae60',
              }}
              onClick={(e) => {
                e.preventDefault();
                route('/recipe-assistant');
              }}
            >
              Asistente de Recetas
            </a>
          </div>
          <div class="action-buttons" style={{ marginTop: '1rem' }}>
            <button onClick={logout} class="btn">
              Cerrar Sesión
            </button>
            <button class="btn btn-danger" onClick={handleDeleteAccount}>
              Eliminar Cuenta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
