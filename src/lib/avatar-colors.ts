/** Small varied palette so client avatar chips read as visually distinct across a list. Deterministic per id. */
const PALETTE = ['#f59e0b', '#7c9ef5', '#5cb88a', '#a78bfa', '#f97316', '#ef4444'];

export function avatarColorFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}
