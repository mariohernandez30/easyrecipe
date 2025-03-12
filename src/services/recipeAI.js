import { GoogleGenerativeAI } from '@google/generative-ai';
import { $try, log } from '../utils.js';

const API_KEY = Bun.env.GOOGLE_AI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const MODEL = 'gemini-2.0-flash-lite';

function getPromptParameters(options) {
  return {
    ingredients: options.ingredients?.join(', ') || '',
    cuisine: options.cuisine || 'cualquier tipo',
    difficulty: options.difficulty || 'media',
    dietaryRestrictions: options.dietaryRestrictions || 'ninguna',
    prepTime: options.prepTime || 30,
  };
}

function createRecipePrompt(params) {
  return `
    Actúa como un chef profesional y crea una receta deliciosa con los siguientes parámetros:

    - Ingredientes disponibles: ${params.ingredients}
    - Tipo de cocina: ${params.cuisine}
    - Nivel de dificultad: ${params.difficulty}
    - Restricciones dietéticas: ${params.dietaryRestrictions}
    - Tiempo de preparación máximo: ${params.prepTime} minutos

    Por favor, estructura tu respuesta en el siguiente formato JSON:
    {
      "title": "Título de la receta",
      "summary": "Breve descripción de la receta",
      "ingredients": ["Ingrediente 1 (cantidad)", "Ingrediente 2 (cantidad)"],
      "instructions": ["Paso 1", "Paso 2", "..."],
      "preparationTime": tiempo en minutos,
      "difficulty": "nivel de dificultad",
      "tips": ["Consejo 1", "Consejo 2"]
    }
  `;
}

async function parseAIResponse(response) {
  const text = response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('No se pudo generar una receta válida');
  }

  return JSON.parse(jsonMatch[0]);
}

export async function generateRecipe(options) {
  const [error, result] = await $try(async () => {
    const model = genAI.getGenerativeModel({ model: MODEL });

    const promptParams = getPromptParameters(options);
    const prompt = createRecipePrompt(promptParams);

    const generatedResult = await model.generateContent(prompt);
    const recipeData = await parseAIResponse(generatedResult.response);

    log('Receta generada con éxito');
    return {
      success: true,
      recipe: recipeData,
    };
  });

  if (error) {
    log(`Error al generar receta: ${error.message}`, { isError: true });
    return {
      success: false,
      error: error.message || 'Error al generar la receta',
    };
  }

  return result;
}
