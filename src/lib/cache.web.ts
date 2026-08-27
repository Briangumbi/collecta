// expo-sqlite's web backend needs a wasm asset Metro can't resolve out of the
// box (see expo-sqlite/web/worker.ts). Collecta targets iOS/Android; this
// localStorage-backed swap keeps the web dev-preview usable without that setup.

export async function setCached<T>(key: string, value: T): Promise<void> {
  globalThis.localStorage?.setItem(key, JSON.stringify({ value, updated_at: Date.now() }));
}

export async function getCached<T>(key: string): Promise<{ value: T; updatedAt: number } | null> {
  const raw = globalThis.localStorage?.getItem(key);
  if (!raw) return null;
  const parsed = JSON.parse(raw) as { value: T; updated_at: number };
  return { value: parsed.value, updatedAt: parsed.updated_at };
}
