// Tiny IndexedDB file store, so a stitched backdrop survives reloads and moves between pages.
const DB = 'dusty-hollow', STORE = 'files'; // old id kept so stored files survive the SP Creek rename

function open() {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

async function run(mode, fn) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode), req = fn(tx.objectStore(STORE));
    tx.oncomplete = () => resolve(req.result);
    tx.onerror = () => reject(tx.error);
  });
}

export async function putFile(key, blob) {
  try { await run('readwrite', (s) => s.put(blob, key)); return true; } catch { return false; }
}
export async function getFile(key) {
  try { return (await run('readonly', (s) => s.get(key))) || null; } catch { return null; }
}
export async function deleteFile(key) {
  try { await run('readwrite', (s) => s.delete(key)); } catch { /* storage unavailable */ }
}
