const { Client } = require('pg');

async function test() {
    const client = new Client({
        connectionString: "postgresql://postgres:postgres@localhost:5432/amisi_control?schema=public"
    });
    try {
        await client.connect();
        console.log('Connected successfully!');
        const res = await client.query('SELECT current_database()');
        console.log('DB:', res.rows[0]);
    } catch (err) {
        console.error('Connection error:', err.message);
    } finally {
        await client.end();
    }
}

test();
