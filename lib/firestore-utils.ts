"use client";

const TIMEOUT_MS = 5000;

export function withTimeout<T>(promise: Promise<T>, fallback: T): Promise<T> {
  const timeout = new Promise<T>((resolve) =>
    setTimeout(() => resolve(fallback), TIMEOUT_MS)
  );
  return Promise.race([promise, timeout]);
}
