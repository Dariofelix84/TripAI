const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// POST /api/trips/generate — generate itinerary via Gemini (does NOT save)
router.post('/generate', async (req, res) => {
    try {
        const { destination, days, budgetMin, budgetMax, budgetLabel } = req.body;

        if (!destination || !days) {
            return res.status(400).json({ error: 'Destino e número de dias são obrigatórios.' });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'GEMINI_API_KEY não configurada no servidor.' });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.8,
                maxOutputTokens: 8192,
            },
        });

        const prompt = `Você é um especialista em viagens. Gere um roteiro de viagem detalhado em português brasileiro.

Gere um roteiro de ${days} dias para ${destination}.${budgetMin != null && budgetMax != null
                ? ` Orçamento total estimado: de R$ ${budgetMin} a R$ ${budgetMax} (${budgetLabel || 'Moderado'}).`
                : ''
            } Inclua atividades pela manhã, tarde e noite com custos estimados em reais brasileiros.

Retorne SOMENTE um objeto JSON válido no seguinte formato exato:
{
  "destination": "Nome do Destino",
  "country": "País",
  "region": "Região/Continente",
  "summary": "Breve resumo do roteiro",
  "month": "Mês e Ano sugerido",
  "totalActivities": <número total de atividades>,
  "days": [
    {
      "day": 1,
      "title": "Título do Dia",
      "subtitle": "Breve descrição das atividades do dia",
      "morning": {
        "title": "Atividade da Manhã",
        "description": "Descrição detalhada...",
        "estimatedCost": <custo em reais>
      },
      "afternoon": {
        "title": "Atividade da Tarde",
        "description": "Descrição detalhada...",
        "estimatedCost": <custo em reais>
      },
      "evening": {
        "title": "Atividade da Noite",
        "description": "Descrição detalhada...",
        "estimatedCost": <custo em reais>
      },
      "dayTotal": <soma dos custos do dia>
    }
  ]
}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const itinerary = JSON.parse(responseText);

        res.json({ itinerary });
    } catch (err) {
        console.error('Generate error:', err);
        if (err.message?.includes('quota')) {
            return res.status(429).json({ error: 'Cota da API Gemini excedida.' });
        }
        res.status(500).json({ error: 'Erro ao gerar roteiro. Tente novamente.' });
    }
});

// POST /api/trips — save a trip
router.post('/', (req, res) => {
    try {
        const { destination, days, budgetMin, budgetMax, budgetLabel, itinerary } = req.body;

        if (!destination || !days || !itinerary) {
            return res.status(400).json({ error: 'Dados incompletos.' });
        }

        const result = db.prepare(
            `INSERT INTO trips (user_id, destination, days, budget_min, budget_max, budget_label, itinerary)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).run(
            req.userId,
            destination,
            days,
            budgetMin || null,
            budgetMax || null,
            budgetLabel || null,
            typeof itinerary === 'string' ? itinerary : JSON.stringify(itinerary)
        );

        const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(result.lastInsertRowid);
        trip.itinerary = JSON.parse(trip.itinerary);

        res.status(201).json({ trip });
    } catch (err) {
        console.error('Save trip error:', err);
        res.status(500).json({ error: 'Erro ao salvar viagem.' });
    }
});

// GET /api/trips — list user's trips
router.get('/', (req, res) => {
    try {
        const trips = db.prepare('SELECT * FROM trips WHERE user_id = ? ORDER BY created_at DESC').all(req.userId);
        trips.forEach(t => {
            try { t.itinerary = JSON.parse(t.itinerary); } catch { /* keep as string */ }
        });
        res.json({ trips });
    } catch (err) {
        console.error('List trips error:', err);
        res.status(500).json({ error: 'Erro ao listar viagens.' });
    }
});

// GET /api/trips/:id — get trip detail
router.get('/:id', (req, res) => {
    try {
        const trip = db.prepare('SELECT * FROM trips WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
        if (!trip) {
            return res.status(404).json({ error: 'Viagem não encontrada.' });
        }
        try { trip.itinerary = JSON.parse(trip.itinerary); } catch { /* keep */ }
        res.json({ trip });
    } catch (err) {
        console.error('Get trip error:', err);
        res.status(500).json({ error: 'Erro ao buscar viagem.' });
    }
});

// DELETE /api/trips/:id — delete a trip
router.delete('/:id', (req, res) => {
    try {
        const trip = db.prepare('SELECT * FROM trips WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
        if (!trip) {
            return res.status(404).json({ error: 'Viagem não encontrada.' });
        }
        db.prepare('DELETE FROM trips WHERE id = ?').run(req.params.id);
        res.json({ message: 'Viagem deletada com sucesso.' });
    } catch (err) {
        console.error('Delete trip error:', err);
        res.status(500).json({ error: 'Erro ao deletar viagem.' });
    }
});

// PATCH /api/trips/:id/active — toggle active itinerary
router.patch('/:id/active', (req, res) => {
    try {
        const trip = db.prepare('SELECT * FROM trips WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
        if (!trip) {
            return res.status(404).json({ error: 'Viagem não encontrada.' });
        }
        // Deactivate all, then activate this one
        db.prepare('UPDATE trips SET is_active = 0 WHERE user_id = ?').run(req.userId);
        db.prepare('UPDATE trips SET is_active = 1 WHERE id = ?').run(req.params.id);

        const updated = db.prepare('SELECT * FROM trips WHERE id = ?').get(req.params.id);
        try { updated.itinerary = JSON.parse(updated.itinerary); } catch { /* keep */ }
        res.json({ trip: updated });
    } catch (err) {
        console.error('Activate trip error:', err);
        res.status(500).json({ error: 'Erro ao ativar viagem.' });
    }
});

module.exports = router;
