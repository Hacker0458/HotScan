'use client'

import { Search, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'

export interface FilterState {
  search: string
  window: '5m' | '1h' | 'all'
  minLiquidity: number
  minRisk: number
  sortBy: 'risk' | 'price' | 'liquidity'
  sortOrder: 'asc' | 'desc'
}

interface FilterBarProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  resultCount?: number
}

export default function FilterBar({ filters, onFilterChange, resultCount }: FilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  const handleChange = (key: keyof FilterState, value: any) => {
    onFilterChange({ ...filters, [key]: value })
  }
  
  return (
    <div className="space-y-4">
      {/* Main search bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by symbol or name..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label="Search signals"
          />
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-md border transition-colors ${
            showAdvanced ? 'bg-accent' : 'hover:bg-accent'
          }`}
          aria-label="Toggle filters"
          aria-expanded={showAdvanced}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
        </button>
      </div>
      
      {/* Advanced filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-md bg-muted/50">
          {/* Window */}
          <div>
            <label className="block text-sm font-medium mb-2">Time Window</label>
            <select
              value={filters.window}
              onChange={(e) => handleChange('window', e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background"
              aria-label="Time window"
            >
              <option value="all">All</option>
              <option value="5m">5 minutes</option>
              <option value="1h">1 hour</option>
            </select>
          </div>
          
          {/* Min Liquidity */}
          <div>
            <label className="block text-sm font-medium mb-2">Min Liquidity</label>
            <select
              value={filters.minLiquidity}
              onChange={(e) => handleChange('minLiquidity', Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-md bg-background"
              aria-label="Minimum liquidity"
            >
              <option value={0}>All</option>
              <option value={100000}>≥ $100K</option>
              <option value={1000000}>≥ $1M</option>
              <option value={10000000}>≥ $10M</option>
            </select>
          </div>
          
          {/* Min Risk */}
          <div>
            <label className="block text-sm font-medium mb-2">Min Risk Score</label>
            <select
              value={filters.minRisk}
              onChange={(e) => handleChange('minRisk', Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-md bg-background"
              aria-label="Minimum risk score"
            >
              <option value={0}>All</option>
              <option value={40}>≥ 40 (Med+)</option>
              <option value={60}>≥ 60 (High)</option>
            </select>
          </div>
          
          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium mb-2">Sort By</label>
            <div className="flex gap-2">
              <select
                value={filters.sortBy}
                onChange={(e) => handleChange('sortBy', e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md bg-background"
                aria-label="Sort by field"
              >
                <option value="risk">Risk</option>
                <option value="price">Price Δ%</option>
                <option value="liquidity">Liquidity</option>
              </select>
              <button
                onClick={() => handleChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border rounded-md hover:bg-accent transition-colors"
                aria-label={`Sort ${filters.sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                title={filters.sortOrder === 'asc' ? 'Sort descending' : 'Sort ascending'}
              >
                {filters.sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Result count */}
      {resultCount !== undefined && (
        <div className="text-sm text-muted-foreground">
          {resultCount} signal{resultCount !== 1 ? 's' : ''} found
        </div>
      )}
    </div>
  )
}

