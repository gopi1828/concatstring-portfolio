import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'

export function isAuthenticated(): boolean {
  try {
    if (typeof window === 'undefined') return false
    const token = localStorage.getItem('token')
    return !!token
  } catch {
    return false
  }
}

export function RequireAuth({ children }: { children: ReactNode }) {
  if (!isAuthenticated()) return <Navigate to="/" replace />
  return <>{children}</>
}

export function RedirectIfAuth({ children }: { children: ReactNode }) {
  if (isAuthenticated()) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}


