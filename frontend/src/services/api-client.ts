const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? ''

type ApiErrorResponse = {
  message?: string
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...init?.headers,
    },
  })

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as ApiErrorResponse | null
    throw new Error(error?.message ?? 'Não foi possível conectar à API.')
  }

  return response.json() as Promise<T>
}
