import AsyncStorage from "@react-native-async-storage/async-storage";
import { getBaseUrl } from "./api";

const AUTH_TOKEN_KEY = "babymart_auth_token";

let inMemoryAuthToken = "";
let hasWarnedStorageFallback = false;

const warnStorageFallback = (reason: unknown) => {
  if (hasWarnedStorageFallback) {
    return;
  }

  hasWarnedStorageFallback = true;
  console.warn("Persistent auth storage unavailable, falling back to session memory.", reason);
};

const canUseLocalStorage = () => {
  return typeof globalThis !== "undefined" && "localStorage" in globalThis;
};

const getLocalToken = () => {
  if (!canUseLocalStorage()) {
    return "";
  }

  try {
    return globalThis.localStorage.getItem(AUTH_TOKEN_KEY) ?? "";
  } catch {
    return "";
  }
};

const setLocalToken = (token: string) => {
  if (!canUseLocalStorage()) {
    return;
  }

  try {
    if (token) {
      globalThis.localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      globalThis.localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  } catch {
    // ignore storage write failures
  }
};

export const initAuthToken = async () => {
  try {
    const savedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    inMemoryAuthToken = savedToken ?? "";
  } catch (storageError) {
    warnStorageFallback(storageError);
    inMemoryAuthToken = getLocalToken();
  }

  return inMemoryAuthToken;
};

export const setAuthToken = async (token: string) => {
  const value = token.trim();
  inMemoryAuthToken = value;

  try {
    if (value) {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, value);
    } else {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    }
  } catch (storageError) {
    warnStorageFallback(storageError);
    setLocalToken(value);
  }
};

export const clearAuthToken = async () => {
  inMemoryAuthToken = "";

  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (storageError) {
    warnStorageFallback(storageError);
    setLocalToken("");
  }
};

export const getAuthToken = () => {
  return inMemoryAuthToken;
};

const buildHeaders = (token?: string) => {
  const resolvedToken = token || getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (resolvedToken) {
    headers.Authorization = `Bearer ${resolvedToken}`;
  }

  return headers;
};

export async function apiRequest<T>(path: string, options?: RequestInit, token?: string): Promise<T> {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    ...options,
    headers: {
      ...buildHeaders(token),
      ...(options?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;

    try {
      const data = (await response.json()) as { message?: string };
      if (data?.message) {
        message = data.message;
      }
    } catch {
      // ignore JSON parse errors
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

type SearchResponse<T> = {
  products?: T[];
  results?: T[];
};

export async function searchProducts<T>(query: string) {
  const term = query.trim();
  if (!term) {
    return [] as T[];
  }

  try {
    const bySearchEndpoint = await apiRequest<SearchResponse<T>>(`/api/search?q=${encodeURIComponent(term)}`);
    return Array.isArray(bySearchEndpoint.products)
      ? bySearchEndpoint.products
      : Array.isArray(bySearchEndpoint.results)
        ? bySearchEndpoint.results
        : [];
  } catch {
    const byProductsEndpoint = await apiRequest<SearchResponse<T>>(`/api/products?limit=12&search=${encodeURIComponent(term)}`);
    return Array.isArray(byProductsEndpoint.products)
      ? byProductsEndpoint.products
      : Array.isArray(byProductsEndpoint.results)
        ? byProductsEndpoint.results
        : [];
  }
}

export async function addProductToCart(productId: string, quantity = 1, token?: string) {
  try {
    return await apiRequest<{ success?: boolean; message?: string }>(
      "/api/cart/add",
      {
        method: "POST",
        body: JSON.stringify({ productId, quantity }),
      },
      token,
    );
  } catch {
    return await apiRequest<{ success?: boolean; message?: string }>(
      "/api/carts",
      {
        method: "POST",
        body: JSON.stringify({ productId, quantity }),
      },
      token,
    );
  }
}

export async function toggleWishlistProduct(productId: string, isCurrentlyWishlisted: boolean, token?: string) {
  try {
    const response = await apiRequest<{ success?: boolean; wishlisted?: boolean; wishlist?: string[] }>(
      "/api/wishlist/toggle",
      {
        method: "POST",
        body: JSON.stringify({ productId }),
      },
      token,
    );

    if (typeof response.wishlisted === "boolean") {
      return response.wishlisted;
    }

    if (Array.isArray(response.wishlist)) {
      return response.wishlist.some((id) => id?.toString() === productId);
    }

    return !isCurrentlyWishlisted;
  } catch {
    if (isCurrentlyWishlisted) {
      await apiRequest<{ success?: boolean }>(
        "/api/wishlist/remove",
        {
          method: "DELETE",
          body: JSON.stringify({ productId }),
        },
        token,
      );
      return false;
    }

    await apiRequest<{ success?: boolean }>(
      "/api/wishlist/add",
      {
        method: "POST",
        body: JSON.stringify({ productId }),
      },
      token,
    );
    return true;
  }
}

export async function getCartItemCount(token?: string) {
  const data = await apiRequest<{ cart?: { quantity?: number }[] }>("/api/carts", undefined, token);
  if (!Array.isArray(data.cart)) {
    return 0;
  }

  return data.cart.reduce((sum, line) => sum + (line.quantity ?? 0), 0);
}
