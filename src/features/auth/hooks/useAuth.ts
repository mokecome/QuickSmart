/**
 * Authentication Hooks
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/shared/store/useAuthStore'
import { login, register, logout, getSession } from '../api/authApi'
import type { LoginRequest, RegisterRequest } from '../api/authApi'

/**
 * Get current session
 */
export function useSession() {
  const { setUser, clearUser } = useAuthStore()

  return useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const session = await getSession()
      if (session?.user) {
        setUser(session.user)
      } else {
        clearUser()
      }
      return session
    },
    retry: false,
  })
}

/**
 * Login mutation
 */
export function useLogin() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { setUser } = useAuthStore()

  return useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: (response) => {
      setUser(response.user)
      queryClient.setQueryData(['session'], response)
      toast.success('登入成功！')
      router.push('/')
    },
    onError: (error: Error) => {
      toast.error(error.message || '登入失敗')
    },
  })
}

/**
 * Register mutation
 */
export function useRegister() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { setUser } = useAuthStore()

  return useMutation({
    mutationFn: (data: RegisterRequest) => register(data),
    onSuccess: (response) => {
      setUser(response.user)
      queryClient.setQueryData(['session'], response)
      toast.success('註冊成功！')
      router.push('/')
    },
    onError: (error: Error) => {
      toast.error(error.message || '註冊失敗')
    },
  })
}

/**
 * Logout mutation
 */
export function useLogout() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { clearUser } = useAuthStore()

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearUser()
      queryClient.clear()
      toast.success('已登出')
      router.push('/login')
    },
    onError: (error: Error) => {
      toast.error(error.message || '登出失敗')
    },
  })
}
