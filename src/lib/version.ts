export function isNewerVersion(remote: string, local: string): boolean {
  const left = remote.split('.').map((part) => Number(part) || 0);
  const right = local.split('.').map((part) => Number(part) || 0);
  const size = Math.max(left.length, right.length);
  for (let index = 0; index < size; index += 1) {
    const next = left[index] ?? 0;
    const current = right[index] ?? 0;
    if (next > current) return true;
    if (next < current) return false;
  }
  return false;
}

export type AppUpdate = {
  version: string;
  apkUrl: string;
  notes?: string;
};

export function readUpdate(data: unknown, localVersion: string): AppUpdate | null {
  if (!data || typeof data !== 'object') return null;
  const record = data as { version?: unknown; apkUrl?: unknown; notes?: unknown };
  if (typeof record.version !== 'string' || typeof record.apkUrl !== 'string') return null;
  if (!isNewerVersion(record.version, localVersion)) return null;
  return {
    version: record.version,
    apkUrl: record.apkUrl,
    notes: typeof record.notes === 'string' ? record.notes : undefined,
  };
}
