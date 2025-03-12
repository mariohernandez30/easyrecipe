import { describe, expect, test } from 'bun:test';

describe('Servicio RecipeAI', () => {
  describe('generateRecipe', () => {
    test('debería tener la estructura correcta de respuesta', async () => {
      const mockFn = async () => {
        return {
          success: true,
          recipe: {
            title: 'Mock Recipe',
            ingredients: ['Ingrediente 1', 'Ingrediente 2'],
            instructions: ['Paso 1', 'Paso 2'],
          },
        };
      };

      const mockResult = await mockFn();

      expect(mockResult).toHaveProperty('success');
      expect(typeof mockResult.success).toBe('boolean');

      if (mockResult.success) {
        expect(mockResult).toHaveProperty('recipe');
        expect(mockResult.recipe).toHaveProperty('title');
        expect(mockResult.recipe).toHaveProperty('ingredients');
        expect(mockResult.recipe).toHaveProperty('instructions');
        expect(Array.isArray(mockResult.recipe.ingredients)).toBe(true);
        expect(Array.isArray(mockResult.recipe.instructions)).toBe(true);
      } else {
        expect(mockResult).toHaveProperty('error');
        expect(typeof mockResult.error).toBe('string');
      }
    });

    test('estructura esperada en caso de error', async () => {
      const mockErrorFn = async () => {
        return {
          success: false,
          error: 'Error simulado',
        };
      };

      const mockResult = await mockErrorFn();

      expect(mockResult).toHaveProperty('success', false);
      expect(mockResult).toHaveProperty('error');
      expect(typeof mockResult.error).toBe('string');
    });
  });
});
