import * as SQLite from 'expo-sqlite';

/**
 * Mobile Offline Persistence Layer
 * 
 * Uses SQLite to bridge the gap in zero-connectivity wards.
 * Stores 'SyncQueue' for pending clinical actions and caches 
 * active ward patient data.
 */

const db = SQLite.openDatabaseSync('amisimedos-offline.db');

export const initOfflineStore = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY,
      mutation_type TEXT NOT NULL, -- e.g., 'RECORD_VITALS', 'ADMINISTER_MED'
      payload TEXT NOT NULL,       -- JSON string
      visit_id TEXT,
      created_at INTEGER NOT NULL,
      status TEXT DEFAULT 'PENDING' -- 'PENDING', 'SYNCED', 'ERROR'
    );

    CREATE TABLE IF NOT EXISTS patient_cache (
      id TEXT PRIMARY KEY,
      mrn TEXT NOT NULL,
      name TEXT NOT NULL,
      bed_id TEXT,
      vitals_snapshot TEXT, -- Last known vitals JSON
      mar_snapshot TEXT      -- Pending meds JSON
    );
  `);
};

export const offlineStore = {
  /**
   * Add a clinical action to the sync queue
   */
  queueMutation: (type: string, payload: any, visitId?: string) => {
    const id = Math.random().toString(36).substring(7);
    db.runSync(
      'INSERT INTO sync_queue (id, mutation_type, payload, visit_id, created_at) VALUES (?, ?, ?, ?, ?)',
      [id, type, JSON.stringify(payload), visitId || null, Date.now()]
    );
  },

  /**
   * Get all pending mutations for reconciliation
   */
  getPendingMutations: () => {
    return db.getAllSync('SELECT * FROM sync_queue WHERE status = "PENDING" ORDER BY created_at ASC');
  },

  /**
   * Mark a mutation as synced
   */
  markAsSynced: (id: string) => {
    db.runSync('UPDATE sync_queue SET status = "SYNCED" WHERE id = ?', [id]);
  },

  /**
   * Update patient cache for offline lookup
   */
  cachePatients: (patients: any[]) => {
    db.runSync('DELETE FROM patient_cache', []);
    for (const p of patients) {
      db.runSync(
        'INSERT INTO patient_cache (id, mrn, name, bed_id, vitals_snapshot, mar_snapshot) VALUES (?, ?, ?, ?, ?, ?)',
        [p.id, p.mrn, p.name, p.bedId, JSON.stringify(p.vitals), JSON.stringify(p.mar)]
      );
    }
  }
};
