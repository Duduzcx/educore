// Este é um script de teste isolado para verificar a conexão com a API de IA.
require('dotenv').config({ path: '.env.local' });

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Pega a chave da API que você configurou
const apiKey = process.env.GEMINI_API_KEY; // O script espera este nome

if (!apiKey) {
  console.error("\n❌ ERRO: A variável GEMINI_API_KEY não foi encontrada no seu arquivo .env.local.");
  console.error("   Por favor, verifique se o arquivo .env.local existe na raiz do projeto e se a chave está preenchida corretamente.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function runAITest() {
  console.log("🔵 Iniciando teste de comunicação com a Aurora IA (Google AI)...");
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const prompt = "Explain how AI works in a few words";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("\n✅ SUCESSO! Resposta recebida da IA:");
    console.log("-----------------------------------------");
    console.log(text.trim());
    console.log("-----------------------------------------");
    console.log("\nSua chave é válida e a comunicação está funcionando!");
  } catch (error) {
    console.error("\n❌ FALHA NO TESTE! Ocorreu um erro ao se comunicar com a API do Google AI.");
    if (error.message.includes('API key not valid')) {
        console.error("   Detalhe do erro: A chave de API fornecida não é válida.");
    } else {
        console.error("   Detalhe do erro:", error.message);
    }
  }
}

runAITest();