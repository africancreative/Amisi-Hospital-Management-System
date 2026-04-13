import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import * as dotenv from 'dotenv';
import { getControlDb } from '@amisimedos/db';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'AmisiMedOS Cloud API'
  });
});

app.get('/api/system/status', async (req, res) => {
  try {
    const db = getControlDb();
    const tenantCount = await db.tenant.count();
    res.json({ 
      activeNodes: tenantCount,
      platform: 'AmisiMedOS',
      version: '4.0.0'
    });
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`
  🚀 AmisiMedOS Cloud API is running
  ---
  Port: ${port}
  Mode: ${process.env.NODE_ENV || 'development'}
  `);
});
