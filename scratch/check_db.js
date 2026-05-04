const dotenv = require('dotenv');
const path = require('path');

// Load root .env
dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkDatabases() {
  console.log('--- Checking Cloud Database (Control Plane) ---');
  const cloudUrl = process.env.NEON_DATABASE_URL;
  if (!cloudUrl) {
    console.error('❌ NEON_DATABASE_URL not found in .env');
  } else {
    try {
      // We'll use a raw connection to avoid needing to generate Prisma client for this specific script
      const { Client } = require('pg');
      const client = new Client({ connectionString: cloudUrl });
      await client.connect();
      console.log('✅ Successfully connected to Cloud Database.');
      
      const res = await client.query('SELECT count(*) FROM "Tenant"');
      console.log(`📊 Found ${res.rows[0].count} tenants in Control Plane.`);
      
      const adminRes = await client.query('SELECT count(*) FROM "User"');
      console.log(`📊 Found ${adminRes.rows[0].count} users in Control Plane.`);
      
      await client.end();
    } catch (err) {
      console.error('❌ Cloud Database Connection Failed:', err.message);
    }
  }

  console.log('\n--- Checking Local Edge Database (Tenant) ---');
  const edgeUrl = process.env.LOCAL_EDGE_DATABASE_URL;
  if (!edgeUrl) {
    console.error('❌ LOCAL_EDGE_DATABASE_URL not found in .env');
  } else {
    try {
      const { Client } = require('pg');
      const client = new Client({ connectionString: edgeUrl });
      await client.connect();
      console.log('✅ Successfully connected to Local Edge Database.');
      
      const res = await client.query('SELECT count(*) FROM "Patient"');
      console.log(`📊 Found ${res.rows[0].count} patients in Edge DB.`);
      
      const staffRes = await client.query('SELECT count(*) FROM "User"');
      console.log(`📊 Found ${staffRes.rows[0].count} staff members in Edge DB.`);
      
      await client.end();
    } catch (err) {
      console.error('❌ Local Edge Database Connection Failed:', err.message);
    }
  }
}

checkDatabases();
