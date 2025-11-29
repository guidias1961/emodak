require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Necessário para Railway
});

// 1. Rota para Pegar Perfil (GET)
app.get('/api/user/:wallet', async (req, res) => {
    const { wallet } = req.params;
    try {
        const result = await pool.query('SELECT * FROM users WHERE wallet_address = $1', [wallet]);
        
        if (result.rows.length === 0) {
            // Cria usuário padrão se não existir (Onboarding automático)
            const newUser = await pool.query(
                'INSERT INTO users (wallet_address) VALUES ($1) RETURNING *',
                [wallet]
            );
            return res.json(newUser.rows[0]);
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// 2. Rota para Atualizar Perfil (POST)
app.post('/api/user', async (req, res) => {
    const { wallet_address, display_name, status, bio, avatar_url, music_url, interests } = req.body;
    
    try {
        const query = `
            INSERT INTO users (wallet_address, display_name, status, bio, avatar_url, music_url, interests)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (wallet_address)
            DO UPDATE SET 
                display_name = $2, 
                status = $3, 
                bio = $4, 
                avatar_url = $5, 
                music_url = $6,
                interests = $7,
                last_updated = CURRENT_TIMESTAMP
            RETURNING *;
        `;
        const values = [wallet_address, display_name, status, bio, avatar_url, music_url, interests];
        const result = await pool.query(query, values);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Save failed' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🔪 Emodak Server stabbing on port ${PORT}`));
