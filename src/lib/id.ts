export function createId(): string {
  const current = globalThis.crypto;
  if (current && typeof current.randomUUID === 'function') return current.randomUUID();
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
}
