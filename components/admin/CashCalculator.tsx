"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { X, Banknote, Calculator, Delete, Check, Coins } from "lucide-react"

interface CashCalculatorProps {
  total: number
  onConfirm: (cashReceived: number, change: number) => void
  onCancel: () => void
  orderCode?: string
}

export default function CashCalculator({ total, onConfirm, onCancel, orderCode }: CashCalculatorProps) {
  const [cashReceived, setCashReceived] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const cashValue = parseFloat(cashReceived) || 0
  const change = cashValue - total
  const isValid = cashValue >= total

  // Quick cash amounts (common UK notes/coins)
  const quickAmounts = [5, 10, 20, 50]

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleConfirm = useCallback(() => {
    if (isValid) {
      setShowSuccess(true)
      setTimeout(() => {
        onConfirm(cashValue, change)
      }, 800)
    }
  }, [isValid, cashValue, change, onConfirm])

  // Global keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for keys we handle
      if (/^[0-9.]$/.test(e.key) || e.key === "Backspace" || e.key === "Enter" || e.key === "Escape" || e.key === "Delete") {
        e.preventDefault()
      }

      // Handle number keys
      if (/^[0-9]$/.test(e.key)) {
        setCashReceived(prev => {
          // Limit to 2 decimal places
          if (prev.includes(".")) {
            const [whole, decimal] = prev.split(".")
            if (decimal && decimal.length >= 2) return prev
          }
          return prev + e.key
        })
      }
      // Handle decimal point
      else if (e.key === "." && !cashReceived.includes(".")) {
        setCashReceived(prev => prev + ".")
      }
      // Handle backspace
      else if (e.key === "Backspace") {
        setCashReceived(prev => prev.slice(0, -1))
      }
      // Handle delete (clear all)
      else if (e.key === "Delete") {
        setCashReceived("")
      }
      // Handle Enter (confirm)
      else if (e.key === "Enter" && isValid) {
        handleConfirm()
      }
      // Handle Escape (cancel)
      else if (e.key === "Escape") {
        onCancel()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [cashReceived, isValid, onCancel, handleConfirm])

  const handleNumberClick = (num: string) => {
    if (num === "." && cashReceived.includes(".")) return
    if (cashReceived.includes(".")) {
      const [, decimal] = cashReceived.split(".")
      if (decimal && decimal.length >= 2) return
    }
    setCashReceived(prev => prev + num)
    inputRef.current?.focus()
  }

  const handleBackspace = () => {
    setCashReceived(prev => prev.slice(0, -1))
    inputRef.current?.focus()
  }

  const handleClear = () => {
    setCashReceived("")
    inputRef.current?.focus()
  }

  const handleQuickAmount = (amount: number) => {
    setCashReceived(amount.toFixed(2))
    inputRef.current?.focus()
  }

  const handleExactAmount = () => {
    setCashReceived(total.toFixed(2))
    inputRef.current?.focus()
  }

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
        <div className="bg-slate-900 rounded-3xl w-full max-w-md p-8 border border-emerald-500/30 shadow-2xl shadow-emerald-500/20 text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center mx-auto mb-6 animate-bounce">
            <Check className="h-12 w-12 text-white" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-2">Payment Complete!</h3>
          <p className="text-slate-400 mb-6">Give change to customer</p>
          <div className="bg-emerald-500/10 rounded-2xl p-6 border border-emerald-500/30">
            <p className="text-sm text-emerald-400 mb-2">Change Due</p>
            <p className="text-5xl font-bold text-emerald-400 font-mono">£{change.toFixed(2)}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
      <div className="bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden border border-slate-800 shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-emerald-500/10 to-green-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20">
                <Calculator className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Cash Payment</h3>
                {orderCode && <p className="text-slate-400 text-sm">Order #{orderCode}</p>}
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Total Display */}
          <div className="bg-slate-800/50 rounded-xl p-4 mb-4 text-center border border-slate-700/50">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Order Total</p>
            <p className="text-4xl font-bold text-white font-mono">£{total.toFixed(2)}</p>
          </div>

          {/* Cash Received Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-400 mb-2">Cash Received</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-slate-400 font-bold">£</span>
              <input
                ref={inputRef}
                type="text"
                value={cashReceived}
                readOnly
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white text-3xl font-mono text-right placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              />
            </div>
          </div>

          {/* Quick Amounts */}
          <div className="mb-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Quick Select</p>
            <div className="grid grid-cols-5 gap-2">
              <button
                onClick={handleExactAmount}
                className="py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm font-semibold transition-all"
              >
                Exact
              </button>
              {quickAmounts.map(amount => (
                <button
                  key={amount}
                  onClick={() => handleQuickAmount(amount)}
                  className="py-2.5 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-lg text-white text-sm font-semibold transition-all"
                >
                  £{amount}
                </button>
              ))}
            </div>
          </div>

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button
                key={num}
                tabIndex={-1}
                onClick={() => handleNumberClick(num.toString())}
                className="py-4 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-xl text-white text-xl font-semibold transition-all active:scale-95 select-none"
              >
                {num}
              </button>
            ))}
            <button
              tabIndex={-1}
              onClick={() => handleNumberClick(".")}
              className="py-4 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-xl text-white text-xl font-semibold transition-all active:scale-95 select-none"
            >
              .
            </button>
            <button
              tabIndex={-1}
              onClick={() => handleNumberClick("0")}
              className="py-4 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-xl text-white text-xl font-semibold transition-all active:scale-95 select-none"
            >
              0
            </button>
            <button
              tabIndex={-1}
              onClick={handleBackspace}
              className="py-4 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-xl text-white text-xl font-semibold transition-all active:scale-95 select-none"
            >
              <Delete className="h-5 w-5 mx-auto" />
            </button>
          </div>

          {/* Change Display */}
          <div className={`rounded-xl p-4 mb-4 text-center transition-all ${
            cashValue === 0 
              ? "bg-slate-800/30 border border-slate-700/30" 
              : isValid 
                ? "bg-emerald-500/10 border border-emerald-500/30" 
                : "bg-red-500/10 border border-red-500/30"
          }`}>
            <div className="flex items-center justify-center gap-2 mb-1">
              <Coins className={`h-4 w-4 ${cashValue === 0 ? "text-slate-500" : isValid ? "text-emerald-400" : "text-red-400"}`} />
              <p className={`text-xs uppercase tracking-wide ${cashValue === 0 ? "text-slate-500" : isValid ? "text-emerald-400" : "text-red-400"}`}>
                {cashValue === 0 ? "Enter Amount" : isValid ? "Change Due" : "Insufficient"}
              </p>
            </div>
            <p className={`text-3xl font-bold font-mono ${
              cashValue === 0 ? "text-slate-500" : isValid ? "text-emerald-400" : "text-red-400"
            }`}>
              £{change.toFixed(2)}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleClear}
              className="py-3.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl font-semibold transition-all"
            >
              Clear
            </button>
            <button
              onClick={handleConfirm}
              disabled={!isValid}
              className={`py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                isValid
                  ? "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg shadow-emerald-500/20"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              <Banknote className="h-5 w-5" />
              Confirm
            </button>
          </div>

          {/* Keyboard Hint */}
          <p className="text-center text-slate-500 text-xs mt-4">
            Use keyboard: Numbers • Backspace • Delete (clear) • Enter (confirm) • Esc (cancel)
          </p>
        </div>
      </div>
    </div>
  )
}
