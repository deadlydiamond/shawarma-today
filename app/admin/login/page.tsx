"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Coffee, Lock, User, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export default function AdminLogin() {
  const router = useRouter()
  const { login, isAuthenticated, loading: authLoading, error: authError } = useAuth()
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/admin")
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Get values directly from form elements for reliability
    const form = e.target as HTMLFormElement
    const usernameInput = form.querySelector('#username') as HTMLInputElement
    const passwordInput = form.querySelector('#password') as HTMLInputElement
    
    const username = usernameInput?.value || credentials.username
    const password = passwordInput?.value || credentials.password

    if (!username || !password) {
      setError("Please enter username and password")
      setLoading(false)
      return
    }

    const success = await login(username, password)
    
    if (success) {
      router.push("/admin")
    } else {
      setError("Invalid username or password")
    }

    setLoading(false)
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-white border border-gray-200 shadow-xl">
        <CardContent className="p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-2xl mb-4">
              <Coffee className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Admin Panel</h1>
            <p className="text-gray-500 text-sm">Leaf & Bean Café Management</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="username"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="w-full pl-12 pr-12 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#1f2937', color: 'white' }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-gray-500 text-xs text-center">
              Login: <span className="text-gray-700 font-medium">admin</span> / <span className="text-gray-700 font-medium">leafbean2024</span>
            </p>
          </div>

          {/* Back to site */}
          <div className="mt-6 text-center">
            <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm transition-colors">
              ← Back to website
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
