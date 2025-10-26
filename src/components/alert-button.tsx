'use client'

import { useState } from 'react'
import { Bell, BellOff } from './icons'

interface AlertButtonProps {
  assetId: string
  assetSymbol: string
  userId?: string
}

export function AlertButton({ assetId, assetSymbol, userId = 'demo-user' }: AlertButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [alertType, setAlertType] = useState<string>('price_above')
  const [targetValue, setTargetValue] = useState<string>('')
  const [timeWindow, setTimeWindow] = useState<string>('1h')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleCreate = async () => {
    if (!targetValue) {
      setMessage({ type: 'error', text: 'Please enter a target value' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          assetId,
          alertType,
          targetValue: parseFloat(targetValue),
          timeWindow: alertType.includes('change_pct') ? timeWindow : undefined,
          notifyBrowser: true
        })
      })

      const data = await res.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Alert created successfully!' })
        setTargetValue('')
        setTimeout(() => setIsOpen(false), 2000)
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create alert' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  const alertTypeOptions = [
    { value: 'price_above', label: 'Price Above', placeholder: 'e.g., 50000' },
    { value: 'price_below', label: 'Price Below', placeholder: 'e.g., 45000' },
    { value: 'change_pct_up', label: 'Gain %', placeholder: 'e.g., 10' },
    { value: 'change_pct_down', label: 'Drop %', placeholder: 'e.g., 10' },
    { value: 'risk_level_change', label: 'Risk Level Change', placeholder: 'Any' }
  ]

  const currentOption = alertTypeOptions.find(opt => opt.value === alertType)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm hover:bg-muted transition-colors"
        title="Set Price Alert"
      >
        {isOpen ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
        <span className="hidden sm:inline">Alert</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border bg-card shadow-lg p-4">
            <h3 className="text-lg font-semibold mb-4">
              Set Alert for {assetSymbol}
            </h3>

            {/* Alert Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Alert Type
              </label>
              <select
                value={alertType}
                onChange={(e) => setAlertType(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              >
                {alertTypeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Value */}
            {alertType !== 'risk_level_change' && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Target Value
                </label>
                <input
                  type="number"
                  step="any"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  placeholder={currentOption?.placeholder}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                />
              </div>
            )}

            {/* Time Window (for change_pct alerts) */}
            {alertType.includes('change_pct') && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Time Window
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTimeWindow('1h')}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
                      timeWindow === '1h'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background hover:bg-muted'
                    }`}
                  >
                    1 Hour
                  </button>
                  <button
                    onClick={() => setTimeWindow('24h')}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
                      timeWindow === '24h'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background hover:bg-muted'
                    }`}
                  >
                    24 Hours
                  </button>
                </div>
              </div>
            )}

            {/* Message */}
            {message && (
              <div className={`mb-4 rounded-lg border p-2 text-sm ${
                message.type === 'success'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200'
                  : 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-200'
              }`}>
                {message.text}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 rounded-lg border px-3 py-2 text-sm hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={loading}
                className="flex-1 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Alert'}
              </button>
            </div>

            {/* Info */}
            <p className="mt-4 text-xs text-muted-foreground">
              💡 You'll receive a browser notification when the alert triggers.
            </p>
          </div>
        </>
      )}
    </div>
  )
}

