import { ApiError } from './api-error';

const STOP_STATUS = new Set([400, 401, 403, 404, 413, 422]);

export async function withRetry<T>(
  run: () => Promise<T>,
  attempts = 3,
  wait: (ms: number) => Promise<void> = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await run();
    } catch (error) {
      lastError = error;
      if (error instanceof ApiError && STOP_STATUS.has(error.status)) throw error;
      if (attempt >= attempts) throw error;
      await wait(1000 * attempt);
    }
  }
  throw lastError;
}
