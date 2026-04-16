import { toast } from "sonner";

/**
 * Safely fetches and parses JSON. If the response is not JSON (e.g., an HTML error page
 * from Next.js when the DB connection fails), it throws a standard error instead of crashing.
 */
export async function fetchJson<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<{ data: T | null; error: string | null; response: Response }> {
  try {
    const res = await fetch(input, init);
    const text = await res.text();
    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      // The server returned something that isn't JSON (e.g. 500 HTML page)
      if (!res.ok) {
        return {
          data: null,
          error: "Server encountered an unexpected error.",
          response: res,
        };
      }
      return {
        data: null,
        error: "Received invalid data from server.",
        response: res,
      };
    }

    if (!res.ok) {
      return {
        data: null,
        error: data?.error || data?.message || "An error occurred.",
        response: res,
      };
    }

    return { data, error: null, response: res };
  } catch (err: any) {
    // Network-level error (Failed to fetch)
    return {
      data: null,
      error: err.message,
      response: new Response(null, { status: 0 }),
    };
  }
}

/**
 * Returns true when the error is a network-level failure
 */
export function isNetworkError(err: unknown): boolean {
  // Check for TypeError (most common network error type)
  if (err instanceof TypeError) {
    const msg = err.message.toLowerCase();
    return (
      msg.includes("failed to fetch") ||
      msg.includes("networkerror") ||
      msg.includes("load failed") ||
      msg.includes("network request failed") ||
      msg.includes("network") ||
      msg.includes("connection") ||
      msg.includes("timeout")
    );
  }

  // Check for AbortError (timeout scenarios)
  if (err instanceof Error && err.name === "AbortError") {
    return true;
  }

  // Check for response status 0 (network failure indicator)
  if (err && typeof err === "object" && "status" in err) {
    if ((err as any).status === 0) {
      return true;
    }
  }

  // Check error message for network-related keywords
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    return (
      msg.includes("network") ||
      msg.includes("fetch") ||
      msg.includes("connection") ||
      msg.includes("timeout") ||
      msg.includes("offline")
    );
  }

  return false;
}

/**
 * Returns true if the browser currently reports offline status natively.
 */
export function isBrowserOffline(): boolean {
  return typeof navigator !== "undefined" && !navigator.onLine;
}

/**
 * Show the appropriate toast for a mutation error
 */
export function toastMutationError(
  err: unknown,
  fallbackMessage = "Something went wrong. Please try again.",
) {
  // If it's a string error passed from fetchJson
  if (typeof err === "string") {
    toast.error("Failed", { description: err });
    return;
  }

  // Check if browser is offline first
  if (isBrowserOffline()) {
    toast.warning("You're offline", {
      description:
        "Your action will be retried automatically when you reconnect.",
      duration: 5000,
    });
    return;
  }

  // Check for network errors
  if (isNetworkError(err)) {
    // Check if it's a timeout specifically
    if (err instanceof Error && 
        (err.name === "AbortError" || err.message.toLowerCase().includes("timeout"))) {
      toast.warning("Connection timeout", {
        description: "Please check your network and try again.",
        duration: 5000,
      });
      return;
    }

    // General network error
    toast.warning("Network error", {
      description: "Please check your connection and try again.",
      duration: 5000,
    });
    return;
  }

  const message =
    (err as any)?.error ??
    (err as any)?.message ??
    (err instanceof Error ? err.message : null) ??
    fallbackMessage;

  toast.error("Failed", { description: message });
}
