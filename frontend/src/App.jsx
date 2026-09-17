import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Catalog from './pages/Catalog'
import MyBorrows from './pages/MyBorrows'
import AdminDashboard from './pages/AdminDashboard'

function Home() {
  const { user } = useAuth()
  return <Navigate to={user ? '/catalog' : '/login'} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/catalog" element={<ProtectedRoute><Catalog /></ProtectedRoute>} />
        <Route path="/my-borrows" element={<ProtectedRoute><MyBorrows /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
