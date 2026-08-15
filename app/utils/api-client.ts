/** Clear Review — request client with first-party, HTTP-only session handling. */
export type SessionUser = { id: number; email: string; full_name: string };
type SessionResponse = { authenticated: boolean; user: SessionUser | null };
type LoginResponse = { user: SessionUser };
type ApiErrorResponse = { detail?: string; message?: string; error?: string };
export class ApiError extends Error { constructor(public readonly status: number, message: string) { super(message); this.name = 'ApiError'; } }
async function readError(response: Response): Promise<never> { const payload = await response.json().catch(() => ({})) as ApiErrorResponse; throw new ApiError(response.status, payload.detail || payload.message || payload.error || 'We could not complete that request. Please try again.'); }
function proxyPath(endpoint: string) { return `/api/py/${endpoint.replace(/^\//, '')}`; }
export const apiClient = {
  async request<T = any>(method: string, endpoint: string, body?: unknown, isUpload = false): Promise<T> { const headers = new Headers({ Accept: 'application/json' }); if (!isUpload) headers.set('Content-Type', 'application/json'); const response = await fetch(proxyPath(endpoint), { method, headers, credentials: 'include', body: body === undefined ? undefined : isUpload ? body as BodyInit : JSON.stringify(body) }); if (!response.ok) return readError(response); return response.json() as Promise<T>; },
  get<T = any>(endpoint: string) { return this.request<T>('GET', endpoint); }, post<T = any>(endpoint: string, data: unknown) { return this.request<T>('POST', endpoint, data); }, put<T = any>(endpoint: string, data: unknown) { return this.request<T>('PUT', endpoint, data); }, delete<T = any>(endpoint: string) { return this.request<T>('DELETE', endpoint); },
  upload<T = any>(endpoint: string, file: File, additionalData: Record<string, string> = {}) { const formData = new FormData(); formData.append('file', file); Object.entries(additionalData).forEach(([key, value]) => formData.append(key, value)); return this.request<T>('POST', endpoint, formData, true); },
  async login(email: string, password: string): Promise<LoginResponse> { const formData = new FormData(); formData.append('email', email); formData.append('password', password); const response = await fetch('/api/auth/login', { method: 'POST', body: formData, credentials: 'include' }); if (!response.ok) return readError(response); return response.json() as Promise<LoginResponse>; },
  register(email: string, password: string, fullName: string) { return this.post('auth/register', { email, password, full_name: fullName }); },
  async getSession(): Promise<SessionResponse> { const response = await fetch('/api/auth/session', { credentials: 'include', cache: 'no-store' }); if (!response.ok) return { authenticated: false, user: null }; return response.json() as Promise<SessionResponse>; }, async logout(): Promise<void> { await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }); },
};
