const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'tripai_secret_change_in_production';

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
        }

        const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (existing) {
            return res.status(409).json({ error: 'Este email já está cadastrado.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)').run(name, email, hashedPassword);

        const token = jwt.sign({ userId: result.lastInsertRowid }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            token,
            user: { id: result.lastInsertRowid, name, email },
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
        }

        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) {
            return res.status(401).json({ error: 'Email ou senha inválidos.' });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ error: 'Email ou senha inválidos.' });
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email },
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

module.exports = router;
