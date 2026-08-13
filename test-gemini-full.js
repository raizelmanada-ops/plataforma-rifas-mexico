require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function run() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        console.log("Trying gemini-3.5-flash with generateContent...");
        const aiModel = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
        const result = await aiModel.generateContent("Hola, prueba");
        console.log("Success:", result.response.text());
    } catch (e) {
        console.error("Generate error:", e.message);
    }
}
run();
