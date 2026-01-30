import { useState } from "react";

import {token, API_BASE_URL } from "@/assets/data.js";


type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface FetchOptions<T> {
  url: string;
  method?: HttpMethod;
  body?: T;
}

export function useAuthFetch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function authFetch<TResponse, TBody = unknown>({
    url,
    method = "GET",
    body,
  }: FetchOptions<TBody>): Promise<TResponse> {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_BASE_URL + url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : null,
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Erro na requisição");
      }

      return await response.json();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { authFetch, loading, error };
}
