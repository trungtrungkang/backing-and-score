import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with clsx. Used by shadcn/ui components.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Utility to fetch with an exponential backoff retry mechanism.
 */
export async function fetchWithRetry(url: string, options: RequestInit = {}, retries: number = 3, delayMs: number = 1000): Promise<Response> {
  let lastError: unknown;
  let lastResponse: Response | null = null;
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return response;
      }
      lastResponse = response;
      console.warn(`[fetchWithRetry] Attempt ${i + 1} failed for ${url}: ${response.statusText}`);
    } catch (error) {
      lastError = error;
      console.warn(`[fetchWithRetry] Attempt ${i + 1} network error for ${url}:`, error);
    }
    
    if (i < retries - 1) {
      await new Promise(res => setTimeout(res, delayMs * Math.pow(2, i))); // exponential backoff
    }
  }
  
  if (lastResponse) return lastResponse;
  throw lastError;
}
