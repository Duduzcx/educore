
// Simulates a call to a real AI model for essay grading.
// In a production environment, this function would contain the logic to interact 
// with a service like OpenAI, Google Gemini, or a custom-hosted model.

// Represents the structured data returned by the AI analysis.
interface AIAnalysisResult {
  notaFinal: number;
  feedbackGeral: string;
  analiseCompetencias: {
    [key: string]: { // e.g., "Competência 1"
      nota: number;
      analise: string;
    };
  };
}

// Simulates a delay to mimic the processing time of a real AI model.
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generates a dynamic, mock AI analysis based on the essay's word count.
 * @param wordCount - The number of words in the essay.
 * @returns A structured AIAnalysisResult object.
 */
function generateDynamicAnalysis(wordCount: number): AIAnalysisResult {
  if (wordCount < 150) {
    return {
      notaFinal: 280,
      feedbackGeral: "O texto é muito curto e não desenvolve o tema proposto de forma adequada. É preciso escrever um texto mais completo para atender à estrutura dissertativo-argumentativa e explorar melhor os argumentos.",
      analiseCompetencias: {
        "Competência 1": { nota: 80, analise: "Apresenta muitos desvios gramaticais e de escolha vocabular, decorrentes da falta de desenvolvimento." },
        "Competência 2": { nota: 40, analise: "O tema não foi desenvolvido. A estrutura dissertativo-argumentativa é inexistente." },
        "Competência 3": { nota: 40, analise: "A argumentação é superficial ou inexistente, não há defesa de um ponto de vista." },
        "Competência 4": { nota: 80, analise: "Os mecanismos de coesão são utilizados de forma precária." },
        "Competência 5": { nota: 40, analise: "Não apresenta proposta de intervenção ou ela é totalmente desarticulada do tema." }
      }
    };
  }

  if (wordCount < 300) {
    return {
      notaFinal: 560,
      feedbackGeral: "O texto apresenta um início de argumentação, mas precisa ser mais aprofundado. A estrutura básica está presente, porém os argumentos e a proposta de intervenção são superficiais. Tente desenvolver mais cada parágrafo.",
      analiseCompetencias: {
        "Competência 1": { nota: 120, analise: "Domínio mediano da modalidade escrita, com alguns desvios importantes." },
        "Competência 2": { nota: 120, analise: "Compreensão básica do tema, mas a argumentação é previsível e baseada no senso comum." },
        "Competência 3": { nota: 100, analise: "A defesa do ponto de vista é frágil. Os argumentos poderiam ser mais bem selecionados e organizados." },
        "Competência 4": { nota: 120, analise: "A coesão entre os parágrafos é mediana. Faltam articuladores para conectar melhor as ideias." },
        "Competência 5": { nota: 100, analise: "A proposta de intervenção é simples e pouco detalhada." }
      }
    };
  }

  if (wordCount > 700) {
     return {
      notaFinal: 780,
      feedbackGeral: "O texto é bem desenvolvido, mas pode se beneficiar de maior concisão. Alguns argumentos são repetitivos ou se estendem demais, o que pode prejudicar a clareza. A capacidade de síntese é uma habilidade importante.",
      analiseCompetencias: {
        "Competência 1": { nota: 180, analise: "Excelente domínio da modalidade escrita formal da língua portuguesa." },
        "Competência 2": { nota: 160, analise: "Boa compreensão do tema e uso de repertório, mas a prolixidade torna a estrutura um pouco confusa." },
        "Competência 3": { nota: 140, analise: "A argumentação é pertinente, mas a extensão excessiva de algumas ideias enfraquece o foco do ponto de vista principal." },
        "Competência 4": { nota: 140, analise: "Bom uso de mecanismos de coesão, mas a repetição de conectivos e ideias poderia ser evitada." },
        "Competência 5": { nota: 160, analise: "Boa proposta de intervenção, mas poderia ser apresentada de forma mais direta e objetiva." }
      }
    };
  }

  // Ideal word count (300-700 words)
  return {
    notaFinal: 920,
    feedbackGeral: "Excelente trabalho! O seu texto demonstra uma ótima compreensão do tema e apresenta uma estrutura argumentativa muito sólida. Você articulou bem suas ideias e a proposta de intervenção é relevante e bem detalhada. Continue aprimorando pequenos detalhes de coesão para buscar a nota máxima.",
    analiseCompetencias: {
      "Competência 1": { nota: 200, analise: "Demonstra excelente domínio da modalidade escrita formal da língua portuguesa, sem desvios gramaticais." },
      "Competência 2": { nota: 200, analise: "Compreende perfeitamente a proposta e aplica conceitos de várias áreas do conhecimento para desenvolver o tema com maestria." },
      "Competência 3": { nota: 180, analise: "A argumentação é clara, consistente e bem defendida, com excelente seleção de fatos e opiniões." },
      "Competência 4": { nota: 180, analise: "Uso eficaz e diversificado dos mecanismos de coesão textual, resultando em uma leitura fluida e natural." },
      "Competência 5": { nota: 160, analise: "A proposta de intervenção é muito boa e bem articulada, porém, para atingir a nota máxima, poderia detalhar ainda mais os \"meios de execução\" da ação proposta." }
    }
  };
}

/**
 * Simulates an AI-powered essay grading process with dynamic feedback.
 * @param theme - The theme of the essay.
 * @param essayText - The text content of the essay submitted by the student.
 * @returns A promise that resolves to a structured analysis of the essay.
 */
export async function gradeEssayFlow(theme: string, essayText: string): Promise<AIAnalysisResult> {
  // Simulate AI processing time
  await sleep(Math.random() * 2000 + 3000);

  // Get word count to generate dynamic analysis
  const wordCount = essayText.trim().split(/\s+/).length;
  
  const dynamicAnalysis = generateDynamicAnalysis(wordCount);

  // Simulate a chance of error to test frontend resilience (10% chance)
  if (Math.random() < 0.1) {
      throw new Error("Ocorreu um erro inesperado ao processar a análise com a IA. Por favor, tente novamente.");
  }

  return dynamicAnalysis;
}
