import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { generateRecipe } from '../services/recipeAI.js';
import { $try, log } from '../utils.js';

const router = express.Router();

function validateIngredients(ingredients) {
  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return {
      isValid: false,
      error: {
        status: 400,
        message: 'Debes proporcionar al menos un ingrediente',
      },
    };
  }
  return { isValid: true };
}

async function processRecipeGeneration(recipeData) {
  const { ingredients, cuisine, difficulty, dietaryRestrictions, prepTime } =
    recipeData;

  const validationResult = validateIngredients(ingredients);
  if (!validationResult.isValid) {
    return validationResult.error;
  }

  const result = await generateRecipe({
    ingredients,
    cuisine,
    difficulty,
    dietaryRestrictions,
    prepTime,
  });

  if (!result.success) {
    return {
      status: 500,
      data: {
        success: false,
        message: result.error || 'Error al generar la receta',
      },
    };
  }

  return {
    status: 200,
    data: {
      success: true,
      recipe: result.recipe,
    },
  };
}

function handleErrorResponse(res, error) {
  log(`Error en generación de receta: ${error.message}`, { isError: true });
  res.status(500).json({
    success: false,
    message: 'Error al procesar la solicitud de receta',
  });
}

// Ruta para generar recetas (protegida con JWT)
router.post('/generate', verifyToken, async (req, res) => {
  const [error] = await $try(async () => {
    const response = await processRecipeGeneration(req.body);
    return res.status(response.status).json(response.data);
  });

  if (error) {
    handleErrorResponse(res, error);
  }
});

export { router as recipeRoutes };
