// Local Node Native PostgreSQL Connection Configuration
// We use the standard Prisma connection string for the local edge server

export const LOCAL_DB_CONFIG = {
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'Gr8tlove',
  database: 'amisimedos_local'
};

export const LOCAL_DATABASE_URL = `postgresql://${LOCAL_DB_CONFIG.user}:${LOCAL_DB_CONFIG.password}@${LOCAL_DB_CONFIG.host}:${LOCAL_DB_CONFIG.port}/${LOCAL_DB_CONFIG.database}`;

export async function getLocalDb() {
  console.log(`[Local Node DB] Connecting to Native PostgreSQL at ${LOCAL_DATABASE_URL}`);
  
  // In production, you would instantiate a PrismaClient here using the local URL:
  // return new PrismaClient({ datasources: { db: { url: LOCAL_DATABASE_URL } } });
  
  return {
    url: LOCAL_DATABASE_URL,
    status: 'configured',
    message: 'Local database connection string is ready'
  };
}
