
# Compromisso | Smart Education

*Tecnologia a serviço da aprovação.*

---

## ✨ Status Atual (Julho/2024)

O projeto está **funcional e em desenvolvimento ativo**. A migração da estrutura de backend (de Firebase para Supabase) foi concluída com sucesso, e a base da aplicação está estável. As principais funcionalidades de autenticação, gestão de conteúdo e a integração com a IA Aurora estão operacionais.

**Próximos Passos:** Foco na expansão das ferramentas de BI para gestores e na otimização da performance do front-end.

---

## 🎯 Visão do Projeto

O Compromisso é um portal de gestão educacional inteligente, desenhado para municípios e instituições que buscam oferecer educação de alta qualidade em larga escala, com baixo custo operacional e impacto pedagógico real. A plataforma centraliza ferramentas para alunos, professores e gestores, otimizando o aprendizado, o engajamento e a análise de dados.

---

## 🚀 Guia de Início Rápido (Desenvolvimento)

Siga os passos abaixo para configurar e executar o projeto em seu ambiente local.

### 1. Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 20.x ou superior)
- [NPM](https://www.npmjs.com/) ou [Yarn](https://yarnpkg.com/)

### 2. Clonar o Repositório

```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd <NOME_DA_PASTA_DO_PROJETO>
```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo chamado `.env.local` na raiz do projeto. Ele guardará as chaves de API e configurações dos serviços externos. Preencha com suas credenciais do Supabase:

```env
# Configuração do Supabase
NEXT_PUBLIC_SUPABASE_URL=SUA_URL_DO_PROJETO_SUPABASE
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_PUBLICA_DO_SUPABASE

# Outras chaves de API (ex: YouTube, etc.)
YOUTUBE_API_KEY=SUA_CHAVE_DO_YOUTUBE
```

### 4. Instalar Dependências

Este comando instalará todas as bibliotecas necessárias para rodar o projeto.

```bash
npm install
```

### 5. Iniciar o Servidor de Desenvolvimento

Após a instalação, inicie o servidor Next.js.

```bash
npm run dev
```

A aplicação estará disponível em [http://localhost:3000](http://localhost:3000).

---

## ✨ Funcionalidades Principais

### Para o Aluno 👨‍🎓

-   **Dashboard Personalizado**: Visão clara do progresso e trilhas de estudo recomendadas.
-   **Centro de Transmissões**: Aulas ao vivo com chat integrado e agenda de encontros.
-   **Biblioteca Digital**: Acervo curado com suporte da **Aurora IA** para explicações contextuais.
-   **Simulador de Isenção**: Ferramenta para verificar elegibilidade em benefícios estudantis.
-   **Comunidade Ativa**: Fóruns de discussão moderados.

### Para o Professor & Gestor 👨‍🏫

-   **Gestão de Lives**: Painel para agendar e gerenciar transmissões via YouTube.
-   **BI & Analytics**: Inteligência de dados para monitorar o engajamento de milhares de alunos em tempo real.
-   **Mural de Avisos**: Sistema de comunicados com múltiplos níveis de prioridade.
-   **Curadoria de Acervo**: Painel para aprovar ou rejeitar materiais sugeridos pela comunidade.
-   **Avaliações com IA**: Suporte na correção de redações e simulados.

---

## 🧠 Inteligência Artificial (Aurora)

A Aurora é a assistente de IA da plataforma, construída com **Google Genkit e Gemini 1.5 Flash**. Suas capacidades incluem:

-   Suporte pedagógico 24/7 para tirar dúvidas.
-   Geração de quizzes automáticos baseados no conteúdo da aula.
-   Consultoria sobre auxílios financeiros e documentação.

---

## 🛠️ Arquitetura e Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (App Router, SSR)
-   **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
-   **Estilização**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
-   **Backend & DB**: [Supabase](https://supabase.io/) (Auth, Postgres DB, Storage)
-   **IA & GenAI**: [Google AI (Genkit & Gemini)](https://firebase.google.com/docs/genkit)
-   **Deployment**: [Vercel](https://vercel.com/) / [Firebase Hosting](https://firebase.google.com/docs/hosting)

---

## 💰 Projeção de Custos (Estimativa)

A arquitetura foi planejada para ser altamente escalável e de baixo custo, utilizando a camada gratuita/econômica do Supabase e Google Cloud:

-   **Autenticação & DB (Supabase)**: R$ 0,00 (Plano Gratuito com limites generosos para começar).
-   **Servidor (Next.js SSR)**: ~R$ 150,00/mês em um provedor como Vercel ou Cloud Run.
-   **Inteligência Artificial (Gemini Flash)**: ~R$ 50,00/mês para um volume moderado de consultas.
