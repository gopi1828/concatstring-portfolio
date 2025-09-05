import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'

function isTokenExpired(token: string): boolean {
  try {
    // Decode JWT token without verification (we only need the payload)
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    const payload = JSON.parse(jsonPayload)
    
    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000)
    return payload.exp < currentTime
  } catch {
    return true // If we can't parse the token, consider it expired
  }
}

export function isAuthenticated(): boolean {
  try {
    if (typeof window === 'undefined') return false
    const token = localStorage.getItem('token')
    
    if (!token) return false
    
    // Check if token is expired
    if (isTokenExpired(token)) {
      // Remove expired token
      localStorage.removeItem('token')
      return false
    }
    
    return true
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

export function getTokenExpirationTime(): number | null {
  try {
    if (typeof window === 'undefined') return null
    const token = localStorage.getItem('token')
    
    if (!token) return null
    
    // Decode JWT token to get expiration time
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    const payload = JSON.parse(jsonPayload)
    
    return payload.exp * 1000 // Convert to milliseconds
  } catch {
    return null
  }
}

export function getTimeUntilExpiration(): number | null {
  const expirationTime = getTokenExpirationTime()
  if (!expirationTime) return null
  
  const currentTime = Date.now()
  const timeUntilExpiration = expirationTime - currentTime
  
  return timeUntilExpiration > 0 ? timeUntilExpiration : 0
}


