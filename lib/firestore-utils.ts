"use client";

const TIMEOUT_MS = 5000;

export function withTimeout<T>(promise: Promise<T>): Promise<T | null> {
  const timeout = new Promise<null>((resolve) =>
    setTimeout(() => resolve(null), TIMEOUT_MS)
  );
  return Promise.race([promise, timeout]);
}
