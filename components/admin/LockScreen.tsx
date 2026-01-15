"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Lock, Unlock, Eye, EyeOff } from "lucide-react"

interface LockScreenProps {
  onUnlock: () => void
  staffName?: string
}

export default function LockScreen({ onUnlock, staffName }: LockScreenProps) {
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [showPin, setShowPin] = useState(false)
  const [isUnlocking, setIsUnlocking] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input on mount and keep it focused
  useEffect(() => {
    inputRef.current?.focus()
    
    // Refocus when window regains focus
    const handleFocus = () => inputRef.current?.focus()
    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [])

  const handleUnlock = useCallback(() => {
    if (!pin.trim()) {
      setError("Please enter your PIN")
      return
    }

    setIsUnlocking(true)
    
    // Check PIN against stored staff password
    const storedPin = localStorage.getItem("admin_pin") || "1234"
    
    setTimeout(() => {
      if (pin === storedPin) {
        onUnlock()
      } else {
        setError("Incorrect PIN")
        setPin("")
        setIsUnlocking(false)
        inputRef.current?.focus()
      }
    }, 500)
  }, [pin, onUnlock])

  // Global keyboard listener for when input isn't focused
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // If already focused on input, let it handle naturally
      if (document.activeElement === inputRef.current) return
      
      // Handle number keys
      if (/^[0-9]$/.test(e.key) && pin.length < 6) {
        setPin(prev => prev + e.key)
        setError("")
      }
      // Handle backspace
      else if (e.key === "Backspace") {
        setPin(prev => prev.slice(0, -1))
        setError("")
      }
      // Handle Enter
      else if (e.key === "Enter" && pin) {
        handleUnlock()
      }
      // Handle Escape to clear
      else if (e.key === "Escape") {
        setPin("")
        setError("")
      }
    }

    window.addEventListener("keydown", handleGlobalKeyDown)
    return () => window.removeEventListener("keydown", handleGlobalKeyDown)
  }, [pin, handleUnlock])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleUnlock()
    }
  }

  const handlePinButton = (digit: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + digit)
      setError("")
    }
    // Keep focus on input after clicking button
    inputRef.current?.focus()
  }

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1))
    setError("")
    inputRef.current?.focus()
  }

  const handleClear = () => {
    setPin("")
    setError("")
    inputRef.current?.focus()
  }

  return (
    <div className="fixed inset-0 bg-slate-950 z-[100] flex items-center justify-center">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="relative w-full max-w-md mx-4">
        {/* Lock Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-shawarma to-orange-600 shadow-2xl shadow-shawarma/30 mb-6">
            <Lock className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Screen Locked</h1>
          {staffName && (
            <p className="text-slate-400">Welcome back, {staffName}</p>
          )}
        </div>

        {/* PIN Input Display */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-800/50 shadow-2xl mb-6">
          <label className="block text-sm font-medium text-slate-400 mb-3 text-center">Enter PIN to unlock</label>
          
          <div className="relative mb-4">
            <input
              ref={inputRef}
              type={showPin ? "text" : "password"}
              value={pin}
              onChange={(e) => { setPin(e.target.value.replace(/\D/g, "").slice(0, 6)); setError("") }}
              onKeyDown={handleKeyDown}
              placeholder="••••"
              maxLength={6}
              className="w-full px-4 py-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white text-center text-2xl tracking-[0.5em] placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-shawarma/50 focus:border-shawarma/50 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            >
              {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center mb-4 animate-shake">{error}</p>
          )}

          {/* PIN Pad */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
              <button
                key={digit}
                tabIndex={-1}
                onClick={() => handlePinButton(digit.toString())}
                className="py-4 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-xl text-white text-xl font-semibold transition-all active:scale-95 select-none"
              >
                {digit}
              </button>
            ))}
            <button
              tabIndex={-1}
              onClick={handleClear}
              className="py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm font-semibold transition-all select-none"
            >
              Clear
            </button>
            <button
              tabIndex={-1}
              onClick={() => handlePinButton("0")}
              className="py-4 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-xl text-white text-xl font-semibold transition-all active:scale-95 select-none"
            >
              0
            </button>
            <button
              tabIndex={-1}
              onClick={handleBackspace}
              className="py-4 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-xl text-white text-sm font-semibold transition-all select-none"
            >
              ←
            </button>
          </div>

          {/* Unlock Button */}
          <button
            onClick={handleUnlock}
            disabled={isUnlocking || !pin}
            className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
              pin 
                ? "bg-gradient-to-r from-shawarma to-orange-600 hover:from-shawarma/90 hover:to-orange-600/90 text-white shadow-lg shadow-shawarma/20"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
          >
            {isUnlocking ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Unlock className="h-5 w-5" />
                Unlock
              </>
            )}
          </button>
        </div>

        {/* Hint */}
        <p className="text-center text-slate-500 text-sm">
          Default PIN: 1234 • Use keyboard or numpad
        </p>
      </div>
    </div>
  )
}
