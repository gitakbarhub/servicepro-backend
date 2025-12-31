const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to Neon Database using the Secret you added
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// 1. Get All Shops
app.get('/api/shops', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM shops');
        const formatted = result.rows.map(row => ({
            id: row.id,
            ownerId: row.owner_id,
            name: row.name,
            service: row.service,
            phone: row.phone,
            address: row.address,
            description: row.description,
            lat: parseFloat(row.lat),
            lng: parseFloat(row.lng),
            rating: parseFloat(row.rating),
            userReviews: row.user_reviews || []
        }));
        res.json(formatted);
    } catch (err) { console.error(err); res.status(500).json({error: "Server Error"}); }
});

// 2. Add New Shop
app.post('/api/shops', async (req, res) => {
    const { ownerId, name, service, phone, address, description, lat, lng } = req.body;
    try {
        await pool.query(
            'INSERT INTO shops (owner_id, name, service, phone, address, description, lat, lng) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [ownerId, name, service, phone, address, description, lat, lng]
        );
        res.json({message: "Shop added!"});
    } catch (err) { console.error(err); res.status(500).json({error: "Failed to add shop"}); }
});

// 3. Delete Shop
app.delete('/api/shops/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM shops WHERE id = $1', [req.params.id]);
        res.json({message: "Deleted"});
    } catch (err) { res.status(500).json({error: "Failed delete"}); }
});

// 4. Handle Service Requests
app.post('/api/requests', async (req, res) => {
    const { providerId, name, phone, address, lat, lng } = req.body;
    try {
        await pool.query(
            'INSERT INTO requests (provider_id, user_name, user_phone, user_address, user_lat, user_lng) VALUES ($1, $2, $3, $4, $5, $6)',
            [providerId, name, phone, address, lat, lng]
        );
        res.json({message: "Request sent"});
    } catch (err) { console.error(err); res.status(500).json({error: "Failed request"}); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));