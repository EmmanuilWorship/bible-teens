"use client";

const TIMEOUT_MS = 5000;

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs = TIMEOUT_MS
): Promise<T | null> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<null>((resolve) => {
    timeoutId = setTimeout(() => resolve(null), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}
