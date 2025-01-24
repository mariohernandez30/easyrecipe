import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the API with your key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function testTextGeneration() {
  try {
    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = "Write a simple recipe for chocolate cake";

    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log('API Response:', response.text());
    console.log('API Key is working correctly!');
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

// Run the test
testTextGeneration();