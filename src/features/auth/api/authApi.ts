/**
 * Authentication API Client
 */

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name?: string
}

export interface AuthResponse {
  user: {
    id: string
    email: string
    name?: string
    avatar_url?: string | null
  }
  session: {
    access_token: string
    refresh_token: string
  }
}

/**
 * Login with email and password
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))

    // Provide user-friendly error messages
    if (response.status === 401) {
      throw new Error('電子郵件或密碼錯誤，請重試')
    }

    throw new Error(error.error || error.message || '登入失敗，請稍後再試')
  }

  return response.json()
}

/**
 * Register new user
 */
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))

    // Provide user-friendly error messages
    if (response.status === 400) {
      if (error.error?.includes('already registered') || error.message?.includes('already registered')) {
        throw new Error('此電子郵件已被註冊，請使用其他郵箱或直接登入')
      }
      throw new Error(error.error || error.message || '註冊信息有誤，請檢查後重試')
    }

    throw new Error(error.error || error.message || '註冊失敗，請稍後再試')
  }

  return response.json()
}

/**
 * Logout
 */
export async function logout(): Promise<void> {
  const response = await fetch('/api/auth/signout', {
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error('登出失敗')
  }
}

/**
 * Get current session
 */
export async function getSession() {
  const response = await fetch('/api/auth/session')

  if (!response.ok) {
    return null
  }

  return response.json()
}

/**
 * Login with Google OAuth
 */
export async function loginWithGoogle() {
  window.location.href = '/api/auth/google'
}
