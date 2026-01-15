"use client"

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"

export interface Staff {
  id: string
  username: string
  name: string
  role: string
  is_active: boolean
}

interface AuthContextType {
  staff: Staff | null
  loading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [staff, setStaff] = useState<Staff | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (!supabase) {
        console.error("Supabase not configured")
        setError("Database not configured. Please check environment variables.")
        setLoading(false)
        return
      }

      try {
        const storedStaffId = localStorage.getItem("staff_id")
        if (storedStaffId) {
          const { data, error: queryError } = await supabase
            .from("staff")
            .select("id, username, name, role, is_active")
            .eq("id", storedStaffId)
            .eq("is_active", true)
            .single()

          if (data && !queryError) {
            setStaff(data)
          } else {
            localStorage.removeItem("staff_id")
          }
        }
      } catch (err) {
        console.error("Auth check error:", err)
        localStorage.removeItem("staff_id")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    if (!supabase) {
      setError("Database not configured. Please check environment variables.")
      return false
    }

    setError(null)
    setLoading(true)

    try {
      const { data, error: queryError } = await supabase
        .from("staff")
        .select("id, username, name, role, is_active, password_hash")
        .eq("username", username.toLowerCase())
        .eq("is_active", true)
        .single()

      if (queryError) {
        console.error("Login query error:", queryError)
        setError("Invalid username or password")
        setLoading(false)
        return false
      }

      if (data && data.password_hash === password) {
        // Update last login time
        await supabase
          .from("staff")
          .update({ last_login: new Date().toISOString() })
          .eq("id", data.id)

        const staffData: Staff = {
          id: data.id,
          username: data.username,
          name: data.name,
          role: data.role,
          is_active: data.is_active,
        }

        setStaff(staffData)
        localStorage.setItem("staff_id", data.id)
        setLoading(false)
        return true
      }

      setError("Invalid username or password")
      setLoading(false)
      return false
    } catch (err) {
      console.error("Login error:", err)
      setError("An error occurred during login")
      setLoading(false)
      return false
    }
  }, [])

  const logout = useCallback(() => {
    setStaff(null)
    localStorage.removeItem("staff_id")
  }, [])

  return (
    <AuthContext.Provider
      value={{
        staff,
        loading,
        error,
        login,
        logout,
        isAuthenticated: !!staff,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
