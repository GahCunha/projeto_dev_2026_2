const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? ''

type ApiErrorResponse = {
  error?: string
  message?: string
  fields?: Record<string, string[] | undefined>
}

export class ApiError extends Error {
  code?: string
  fields?: Record<string, string[] | undefined>

  constructor(message: string, response?: ApiErrorResponse) {
    super(message)
    this.name = 'ApiError'
    this.code = response?.error
    this.fields = response?.fields
  }
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
    throw new ApiError(error?.message ?? 'Não foi possível conectar à API.', error ?? undefined)
  }

  if (response.status === 204) return undefined as T

  return response.json() as Promise<T>
}
