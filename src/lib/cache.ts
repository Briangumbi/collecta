import * as SQLite from 'expo-sqlite';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('ledger-cache.db').then(async (db) => {
      await db.execAsync(
        'CREATE TABLE IF NOT EXISTS cache (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL, updated_at INTEGER NOT NULL);'
      );
      return db;
    });
  }
  return dbPromise;
}

export async function setCached<T>(key: string, value: T): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO cache (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at;',
    [key, JSON.stringify(value), Date.now()]
  );
}

export async function getCached<T>(key: string): Promise<{ value: T; updatedAt: number } | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string; updated_at: number }>(
    'SELECT value, updated_at FROM cache WHERE key = ?;',
    [key]
  );
  if (!row) return null;
  return { value: JSON.parse(row.value) as T, updatedAt: row.updated_at };
}
