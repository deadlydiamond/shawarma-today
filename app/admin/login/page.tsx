"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Lock, User, Eye, EyeOff, ChefHat, TrendingUp, Clock, Shield, ArrowRight } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export default function AdminLogin() {
  const router = useRouter()
  const { login, isAuthenticated, loading: authLoading } = useAuth()
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
      <div className="min-h-screen bg-shawarma flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-white/20 border-t-white animate-spin" />
          </div>
          <p className="text-white/80 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-shawarma overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Image
              src="/logos/shawarma-logo.png"
              alt="Today Shawarma"
              width={60}
              height={60}
              className="object-contain"
            />
            <span className="text-2xl font-bold text-white uppercase tracking-wide">
              Today Shawarma
            </span>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center py-12">
            <h1 className="text-5xl font-bold text-white leading-tight mb-6">
              Restaurant<br />Management<br />Portal
            </h1>
            <p className="text-white/80 text-lg max-w-md">
              Manage orders, update menu items, track performance, and run your restaurant efficiently.
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 mt-10">
              {[
                { icon: ChefHat, label: "Kitchen Queue", desc: "Real-time orders" },
                { icon: TrendingUp, label: "Sales Reports", desc: "Track revenue" },
                { icon: Clock, label: "Live Updates", desc: "Instant sync" },
                { icon: Shield, label: "Secure Access", desc: "Protected data" },
              ].map((feature) => (
                <div
                  key={feature.label}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-white/10 backdrop-blur-sm"
                >
                  <div className="p-2 rounded-xl bg-white/20">
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{feature.label}</p>
                    <p className="text-white/60 text-xs">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-white/50 text-sm">
            © 2024 Today Shawarma. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Mobile Header */}
        <div className="lg:hidden bg-shawarma p-6">
          <div className="flex items-center gap-3">
            <Image
              src="/logos/shawarma-logo.png"
              alt="Today Shawarma"
              width={50}
              height={50}
              className="object-contain"
            />
            <span className="text-xl font-bold text-white uppercase tracking-wide">
              Today Shawarma
            </span>
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center lg:text-left mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-shawarma/10 rounded-full mb-6">
                <div className="w-2 h-2 rounded-full bg-shawarma animate-pulse" />
                <span className="text-shawarma font-medium text-sm">Admin Portal</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                Welcome back
              </h2>
              <p className="text-gray-500">
                Sign in to access your restaurant dashboard
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1 rounded-lg bg-gray-100 group-focus-within:bg-shawarma/10 transition-colors">
                    <User className="h-4 w-4 text-gray-400 group-focus-within:text-shawarma transition-colors" />
                  </div>
                  <input
                    type="text"
                    id="username"
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    className="w-full pl-14 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-shawarma/20 focus:border-shawarma transition-all"
                    placeholder="Enter your username"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1 rounded-lg bg-gray-100 group-focus-within:bg-shawarma/10 transition-colors">
                    <Lock className="h-4 w-4 text-gray-400 group-focus-within:text-shawarma transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="w-full pl-14 pr-14 py-4 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-shawarma/20 focus:border-shawarma transition-all"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl font-semibold text-white bg-shawarma hover:bg-shawarma-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-shawarma/25 hover:shadow-xl hover:shadow-shawarma/30"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Demo credentials */}
            <div className="mt-8 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-1.5 rounded-lg bg-shawarma/10">
                  <Shield className="h-4 w-4 text-shawarma" />
                </div>
                <span className="text-sm font-medium text-gray-700">Login Credentials</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Username:</span>
                <code className="px-2 py-1 bg-gray-100 rounded-lg font-mono text-gray-700">admin</code>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-500">Password:</span>
                <code className="px-2 py-1 bg-gray-100 rounded-lg font-mono text-gray-700">admin123</code>
              </div>
            </div>

            {/* Back to site */}
            <div className="mt-8 text-center">
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 text-gray-500 hover:text-shawarma text-sm transition-colors group"
              >
                <ArrowRight className="h-4 w-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                Back to website
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
