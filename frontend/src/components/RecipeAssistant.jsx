import { signal } from '@preact/signals';
import { route } from 'preact-router';
import { auth } from './App';

// Signals locales del componente
const assistant = {
  ingredients: signal([]),
  currentIngredient: signal(''),
  cuisine: signal(''),
  difficulty: signal('media'),
  dietary: signal(''),
  prepTime: signal(30),
  isLoading: signal(false),
  recipeResult: signal(null),
  showResult: signal(false),
};

export function RecipeAssistant() {
  const { isAuthenticated } = auth;

  if (!isAuthenticated.value) {
    route('/login');
    return null;
  }

  const addIngredient = () => {
    const ingredient = assistant.currentIngredient.value.trim();
    if (ingredient && !assistant.ingredients.value.includes(ingredient)) {
      assistant.ingredients.value = [
        ...assistant.ingredients.value,
        ingredient,
      ];
      assistant.currentIngredient.value = '';
    }
  };

  const removeIngredient = (index) => {
    assistant.ingredients.value = assistant.ingredients.value.filter(
      (_, i) => i !== index
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addIngredient();
    }
  };

  const generateRecipe = async () => {
    if (assistant.ingredients.value.length === 0) {
      alert('Por favor, agrega al menos un ingrediente');
      return;
    }

    assistant.isLoading.value = true;
    assistant.showResult.value = false;

    try {
      const response = await fetch('/api/recipes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ingredients: assistant.ingredients.value,
          cuisine: assistant.cuisine.value,
          difficulty: assistant.difficulty.value,
          dietaryRestrictions: assistant.dietary.value,
          prepTime: assistant.prepTime.value,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al comunicarse con el asistente');
      }

      const data = await response.json();

      if (data.success && data.recipe) {
        assistant.recipeResult.value = data.recipe;
        assistant.showResult.value = true;
      } else {
        alert(
          data.message || 'Error al generar la receta. Inténtalo de nuevo.'
        );
      }
    } catch (error) {
      console.error('Error:', error);
      alert(
        'Error al comunicarse con el servidor. Por favor, inténtalo más tarde.'
      );
    } finally {
      assistant.isLoading.value = false;
    }
  };

  return (
    <div class="container">
      <div class="app-container" style={{ maxWidth: '800px' }}>
        <h1>Asistente de Recetas</h1>
        <p>
          Encuentra recetas deliciosas basadas en los ingredientes que tienes
          disponibles
        </p>

        <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
          <h3>¿Qué te gustaría cocinar hoy?</h3>

          <div class="form-group">
            <label for="ingredient-input">Ingredientes disponibles</label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
              <input
                type="text"
                id="ingredient-input"
                placeholder="Ej: tomate, cebolla..."
                value={assistant.currentIngredient.value}
                onInput={(e) =>
                  (assistant.currentIngredient.value = e.target.value)
                }
                onKeyPress={handleKeyPress}
                style={{ flex: 1 }}
              />
              <button
                onClick={addIngredient}
                class="btn"
                style={{ width: 'auto', marginTop: 0 }}
              >
                Agregar
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                margin: '1rem 0',
              }}
            >
              {assistant.ingredients.value.map((ingredient, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: '#f1f9ff',
                    border: '1px solid #3498db',
                    borderRadius: '20px',
                    padding: '0.3rem 0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '0.9rem',
                  }}
                >
                  {ingredient}
                  <button
                    onClick={() => removeIngredient(index)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#e74c3c',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      marginLeft: '5px',
                      padding: '0 5px',
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div class="form-group">
            <label for="cuisine">Tipo de cocina (opcional)</label>
            <select
              id="cuisine"
              class="form-select"
              value={assistant.cuisine.value}
              onChange={(e) => (assistant.cuisine.value = e.target.value)}
              style={{
                width: '100%',
                padding: '0.8rem',
                borderRadius: '4px',
                border: '1px solid #ddd',
              }}
            >
              <option value="">Cualquiera</option>
              <option value="mexicana">Mexicana</option>
              <option value="italiana">Italiana</option>
              <option value="española">Española</option>
              <option value="asiática">Asiática</option>
              <option value="mediterránea">Mediterránea</option>
              <option value="americana">Americana</option>
            </select>
          </div>

          <div class="form-group">
            <label for="difficulty">Nivel de dificultad</label>
            <select
              id="difficulty"
              class="form-select"
              value={assistant.difficulty.value}
              onChange={(e) => (assistant.difficulty.value = e.target.value)}
              style={{
                width: '100%',
                padding: '0.8rem',
                borderRadius: '4px',
                border: '1px solid #ddd',
              }}
            >
              <option value="fácil">Fácil</option>
              <option value="media">Media</option>
              <option value="difícil">Difícil</option>
            </select>
          </div>

          <div class="form-group">
            <label for="dietary">Restricciones dietéticas (opcional)</label>
            <select
              id="dietary"
              class="form-select"
              value={assistant.dietary.value}
              onChange={(e) => (assistant.dietary.value = e.target.value)}
              style={{
                width: '100%',
                padding: '0.8rem',
                borderRadius: '4px',
                border: '1px solid #ddd',
              }}
            >
              <option value="">Ninguna</option>
              <option value="vegetariano">Vegetariano</option>
              <option value="vegano">Vegano</option>
              <option value="sin gluten">Sin gluten</option>
              <option value="sin lactosa">Sin lactosa</option>
              <option value="bajo en calorías">Bajo en calorías</option>
            </select>
          </div>

          <div class="form-group">
            <label for="prep-time">
              Tiempo máximo de preparación (minutos)
            </label>
            <input
              type="number"
              id="prep-time"
              min="5"
              max="180"
              value={assistant.prepTime.value}
              onInput={(e) =>
                (assistant.prepTime.value = parseInt(e.target.value) || 30)
              }
            />
          </div>

          <button
            class="btn"
            onClick={generateRecipe}
            disabled={
              assistant.isLoading.value ||
              assistant.ingredients.value.length === 0
            }
          >
            {assistant.isLoading.value ? 'Generando...' : 'Generar Receta'}
          </button>
        </div>

        {/* Spinner de carga */}
        {assistant.isLoading.value && (
          <div
            style={{
              margin: '2rem auto',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #3498db',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              animation: 'spin 1s linear infinite',
            }}
          >
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {/* Resultado de la receta */}
        {assistant.showResult.value && assistant.recipeResult.value && (
          <div
            style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              padding: '1.5rem',
              marginTop: '2rem',
              textAlign: 'left',
            }}
          >
            <h2
              style={{
                color: '#2c3e50',
                borderBottom: '2px solid #3498db',
                paddingBottom: '0.5rem',
                marginBottom: '1rem',
              }}
            >
              {assistant.recipeResult.value.title}
            </h2>

            <p
              style={{
                fontStyle: 'italic',
                marginBottom: '1.5rem',
                color: '#555',
              }}
            >
              {assistant.recipeResult.value.summary}
            </p>

            <div
              style={{
                display: 'flex',
                gap: '2rem',
                marginBottom: '1.5rem',
                color: '#666',
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <span>⏱️ Tiempo:</span>
                <span>{assistant.recipeResult.value.preparationTime}</span>{' '}
                minutos
              </div>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <span>📊 Dificultad:</span>
                <span>{assistant.recipeResult.value.difficulty}</span>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#3498db', marginBottom: '0.8rem' }}>
                Ingredientes
              </h3>
              <ul>
                {assistant.recipeResult.value.ingredients.map(
                  (ingredient, index) => (
                    <li key={index} style={{ marginBottom: '0.5rem' }}>
                      {ingredient}
                    </li>
                  )
                )}
              </ul>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#3498db', marginBottom: '0.8rem' }}>
                Instrucciones
              </h3>
              <ol>
                {assistant.recipeResult.value.instructions.map(
                  (instruction, index) => (
                    <li key={index} style={{ marginBottom: '0.5rem' }}>
                      {instruction}
                    </li>
                  )
                )}
              </ol>
            </div>

            {assistant.recipeResult.value.tips &&
              assistant.recipeResult.value.tips.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ color: '#3498db', marginBottom: '0.8rem' }}>
                    Consejos del Chef
                  </h3>
                  <ul>
                    {assistant.recipeResult.value.tips.map((tip, index) => (
                      <li key={index} style={{ marginBottom: '0.5rem' }}>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        )}

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button
            onClick={() => route('/dashboard')}
            class="btn"
            style={{ maxWidth: '200px', margin: '0 auto' }}
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
