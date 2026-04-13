/**
 * Offline Clinical Storage (AmisiMedOS)
 * 
 * Provides native IndexedDB persistence for nursing rounds in zero-connectivity zones.
 * Ensures vital signs and medication entries are never lost.
 */

const DB_NAME = 'amisi-offline-v4';
const STORE_NAME = 'clinical-buffer';

export interface PendingAction {
  id: string;
  type: 'VITALS' | 'MEDICATION';
  data: any;
  timestamp: number;
}

/**
 * Native IndexedDB Wrapper
 */
export async function getOfflineDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return;

    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save a clinical action to the local buffer.
 */
export async function bufferOfflineAction(type: 'VITALS' | 'MEDICATION', data: any) {
  const db = await getOfflineDb();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  const action: PendingAction = {
    id: crypto.randomUUID(),
    type,
    data,
    timestamp: Date.now()
  };

  return new Promise((resolve, reject) => {
    const request = store.add(action);
    request.onsuccess = () => {
      console.log(`[Offline Buffer] Saved ${type} action:`, action.id);
      resolve(action);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Retrieve all pending activities for reconciliation.
 */
export async function getPendingActions(): Promise<PendingAction[]> {
  const db = await getOfflineDb();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Clear actions once successfully synced to the server.
 */
export async function clearSyncedActions(ids: string[]) {
  const db = await getOfflineDb();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  for (const id of ids) {
    store.delete(id);
  }
}
