require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
        wallet_address VARCHAR(42) PRIMARY KEY,
        display_name VARCHAR(50) DEFAULT 'Sad Emo',
        status VARCHAR(255) DEFAULT 'is listening to silence...',
        bio TEXT DEFAULT '<b>About me:</b><br>I have no soul.',
        avatar_url TEXT DEFAULT 'https://i.imgur.com/Gj3H3gJ.png',
        hero_image_url TEXT DEFAULT 'https://upload.wikimedia.org/wikipedia/commons/5/59/Monad_Logo_Purple.png',
        music_url TEXT DEFAULT '',
        interests TEXT DEFAULT 'Crypto, Tears, Monad',
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

async function createTable() {
    try {
        await pool.query(createTableQuery);
        console.log("✅ Tabela 'users' criada com sucesso!");
    } catch (err) {
        console.error("❌ Erro ao criar tabela:", err);
    } finally {
        await pool.end();
    }
}

createTable();
