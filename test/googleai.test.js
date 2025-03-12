import { GoogleGenerativeAI } from '@google/generative-ai';
import { describe, expect, test } from 'bun:test';

describe('Biblioteca Google AI', () => {
  const API_KEY = Bun.env.GOOGLE_AI_API_KEY;
  const MODEL = 'gemini-2.0-flash-lite';

  test('debería inicializar correctamente el cliente de Google AI', () => {
    const genAI = new GoogleGenerativeAI(API_KEY);
    expect(genAI).toBeDefined();
  });

  test('debería obtener un modelo generativo', () => {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL });
    expect(model).toBeDefined();
    expect(typeof model.generateContent).toBe('function');
  });

  test('debería generar contenido con un prompt simple', async () => {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL });

    const prompt = 'Escribe un saludo breve en español';
    const result = await model.generateContent(prompt);

    expect(result).toBeDefined();
    expect(result.response).toBeDefined();

    const text = result.response.text();
    expect(typeof text).toBe('string');
    expect(text.length).toBeGreaterThan(0);
  }, 10000);

  test('debería generar respuestas en formato JSON', async () => {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL });

    const prompt = `
      Genera un objeto JSON con la siguiente estructura:
      {
        "nombre": "un nombre español",
        "edad": un número entre 18 y 80,
        "aficiones": ["afición 1", "afición 2", "afición 3"]
      }
      Responde solo con el JSON, sin explicaciones adicionales.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    expect(text).toBeDefined();

    let parsedJson;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      parsedJson = JSON.parse(jsonMatch[0]);
    } catch {
      throw new Error(`Error al parsear JSON: ${text}`);
    }

    expect(parsedJson).toBeDefined();
    expect(parsedJson).toHaveProperty('nombre');
    expect(parsedJson).toHaveProperty('edad');
    expect(parsedJson).toHaveProperty('aficiones');
    expect(Array.isArray(parsedJson.aficiones)).toBe(true);
    expect(parsedJson.aficiones.length).toBeGreaterThan(0);
  }, 15000);

  test('debería generar una receta simple con formato similar al servicio', async () => {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL });

    const prompt = `
      Actúa como un chef profesional y crea una receta simple con estos ingredientes: huevo, harina, leche.

      Por favor, estructura tu respuesta en el siguiente formato JSON:
      {
        "title": "Título de la receta",
        "summary": "Breve descripción de la receta",
        "ingredients": ["Ingrediente 1 (cantidad)", "Ingrediente 2 (cantidad)"],
        "instructions": ["Paso 1", "Paso 2"],
        "preparationTime": tiempo en minutos,
        "difficulty": "nivel de dificultad",
        "tips": ["Consejo 1"]
      }
      Responde solo con el JSON, sin texto adicional.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    expect(jsonMatch).not.toBeNull();

    const recipeData = JSON.parse(jsonMatch[0]);

    expect(recipeData).toHaveProperty('title');
    expect(recipeData).toHaveProperty('summary');
    expect(recipeData).toHaveProperty('ingredients');
    expect(recipeData).toHaveProperty('instructions');
    expect(recipeData).toHaveProperty('preparationTime');
    expect(recipeData).toHaveProperty('difficulty');
    expect(recipeData).toHaveProperty('tips');

    expect(Array.isArray(recipeData.ingredients)).toBe(true);
    expect(Array.isArray(recipeData.instructions)).toBe(true);
    expect(Array.isArray(recipeData.tips)).toBe(true);

    expect(recipeData.ingredients.length).toBeGreaterThan(0);
    expect(recipeData.instructions.length).toBeGreaterThan(0);
  }, 20000);
});
