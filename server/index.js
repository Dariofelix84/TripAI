const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const tripRoutes = require('./routes/trips');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);

// Serve React build
const clientBuild = path.join(__dirname, '..', 'client', 'build');
app.use(express.static(clientBuild));
app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuild, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`✈️  TripAI server running on http://localhost:${PORT}`);
});
