import React, { createContext, useContext, useState } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('lms_user')
    return stored ? JSON.parse(stored) : null
  })

  async function login(email, password) {
    const { data } = await api.post('/api/auth/login', { email, password })
    persist(data)
  }

  async function register(fullName, email, password) {
    const { data } = await api.post('/api/auth/register', { fullName, email, password })
    persist(data)
  }

  function persist(data) {
    localStorage.setItem('lms_token', data.token)
    const userData = { fullName: data.fullName, email: data.email, role: data.role }
    localStorage.setItem('lms_user', JSON.stringify(userData))
    setUser(userData)
  }

  function logout() {
    localStorage.removeItem('lms_token')
    localStorage.removeItem('lms_user')
    setUser(null)
  }

  const isAdmin = user?.role === 'ADMIN'

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
