# TripAI — Planejamento de Viagens com IA

App completo de planejamento de viagens. Informe destino, número de dias e orçamento, e a IA gera um roteiro detalhado dia a dia.

## Pré-requisitos

- **Node.js 18+**
- Chave de API do Google Gemini

## Configuração

1. Clone o repositório
2. Copie `.env.example` para `.env` na raiz:
   ```bash
   cp .env.example .env
   ```
3. Edite `.env` e adicione sua `GEMINI_API_KEY`:
   ```
   GEMINI_API_KEY=sua_chave_aqui
   JWT_SECRET=tripai_secret_change_in_production
   PORT=3001
   ```

## Como Rodar

Um único comando na raiz:

```bash
npm start
```

Isso irá:
1. Instalar dependências do client (`npm install` em `/client`)
2. Buildar o React (`npm run build` em `/client`)
3. Instalar dependências do server (`npm install` em `/server`)
4. Iniciar o servidor Express na porta configurada (padrão: 3001)

Acesse: **http://localhost:3001**

## Telas

| Tela | Rota | Descrição |
|------|------|-----------|
| Home | `/` | Formulário para gerar roteiro (destino, dias, orçamento) |
| Login | `/login` | Autenticação de usuário |
| Cadastro | `/register` | Criação de conta |
| Resultado | `/result` | Roteiro gerado pela IA com detalhes dia a dia |
| Minhas Viagens | `/trips` | Lista de roteiros salvos |
| Detalhe | `/trips/:id` | Visualização de roteiro salvo |

## Stack

- **Frontend:** React (Vite)
- **Backend:** Node.js + Express
- **Banco de dados:** SQLite (`better-sqlite3`)
- **IA:** Google Gemini API (gemini-2.0-flash)
- **Auth:** JWT + bcryptjs

## 🎬 Vídeo de Background

Coloque um arquivo de vídeo de viagem em loop (sem áudio) em:
```
client/public/videos/hero-travel.mp4
```

Sugestões de fontes gratuitas de vídeo:
- https://www.pexels.com/videos (buscar "travel", "airplane", "city")
- https://pixabay.com/videos (buscar "travel timelapse")
- https://coverr.co (categoria Travel)

Specs recomendadas:
- Duração: 10–30 segundos
- Resolução: 1920x1080
- Formato: MP4 (H.264) + WebM como fallback
- Tamanho: idealmente abaixo de 8MB
