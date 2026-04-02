'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface PremiumBreakdown {
  base_premium: number
  multiplier: number
  flood_risk_impact: number
  aqi_risk_impact: number
  city_impact: number
  season_impact: number
  rating_discount: number
  raw_premium: number
  affordability_cap: number
  affordability_applied: boolean
  weekly_premium: number
  coverage_amount: number
  model_used?: string
}

interface PremiumBreakdownProps {
  breakdown: PremiumBreakdown | null
  loading?: boolean
}

interface Factor {
  label: string
  value: number
  tooltip: string
  type: 'increase' | 'decrease' | 'neutral'
}

export function PremiumBreakdown({ breakdown, loading }: PremiumBreakdownProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>How Your Premium Is Calculated</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="skeleton h-4 w-28" />
              <div className="skeleton h-2 flex-1 rounded-full" />
              <div className="skeleton h-4 w-12" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!breakdown) return null

  const factors: Factor[] = [
    {
      label: 'Flood Zone Risk',
      value: breakdown.flood_risk_impact,
      tooltip: 'Your zone\'s historical flood frequency raises your premium.',
      type: breakdown.flood_risk_impact > 20 ? 'increase' : 'neutral',
    },
    {
      label: 'Air Quality Risk',
      value: breakdown.aqi_risk_impact,
      tooltip: 'High AQI days reduce earning capacity. Your zone\'s AQI risk is factored in.',
      type: breakdown.aqi_risk_impact > 20 ? 'increase' : 'neutral',
    },
    {
      label: 'City Premium',
      value: breakdown.city_impact,
      tooltip: 'Mumbai & Delhi have higher risk profiles due to weather patterns.',
      type: breakdown.city_impact > 0 ? 'increase' : 'neutral',
    },
    {
      label: 'Season Surcharge',
      value: breakdown.season_impact,
      tooltip: 'Monsoon (Jun–Sep) and summer (Apr–May) months carry higher risk.',
      type: breakdown.season_impact > 0 ? 'increase' : 'neutral',
    },
    {
      label: 'Rating Bonus',
      value: breakdown.rating_discount,
      tooltip: 'Higher platform ratings show reliability — you get a discount.',
      type: 'decrease',
    },
  ]

  const maxImpact = Math.max(...factors.map((f) => Math.abs(f.value)), breakdown.base_premium)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>How Your Premium Is Calculated</CardTitle>
          {breakdown.model_used && (
            <span className="text-xs text-text-muted">
              {breakdown.model_used === 'xgboost' ? 'XGBoost' : 'Rule-based'}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Base premium row */}
        <FactorRow
          label="Base Premium"
          value={breakdown.base_premium}
          barWidth={100}
          color="bg-surface-border"
          type="neutral"
          tooltip="Standard weekly base rate for all GigShield policies."
        />

        <div className="h-px bg-surface-border my-1" />

        {/* Factor rows */}
        {factors.map((factor, i) => (
          <FactorRow
            key={factor.label}
            label={factor.label}
            value={factor.value}
            barWidth={Math.abs((factor.value / maxImpact) * 100)}
            color={
              factor.type === 'decrease'
                ? 'bg-status-success'
                : factor.type === 'increase' && Math.abs(factor.value) > 20
                ? 'bg-status-danger'
                : 'bg-status-warning'
            }
            type={factor.type}
            tooltip={factor.tooltip}
            delay={i * 0.1}
          />
        ))}

        {/* Affordability note */}
        {breakdown.affordability_applied && (
          <div className="rounded-md bg-brand-primary/10 border border-brand-primary/20 px-3 py-2 text-xs text-brand-primary flex items-center gap-2">
            <Info className="h-3.5 w-3.5 flex-shrink-0" />
            Affordability ceiling applied — premium capped at 3% of your weekly earnings (Rs.{breakdown.affordability_cap})
          </div>
        )}

        <div className="h-px bg-surface-border" />

        {/* Final premium */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-semibold text-text-primary">Your Weekly Premium</span>
          <span className="text-2xl font-bold text-brand-primary">Rs.{breakdown.weekly_premium}</span>
        </div>

        {/* Coverage */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-muted">Max Coverage per Trigger</span>
          <span className="text-sm font-semibold text-status-success">Rs.{breakdown.coverage_amount}</span>
        </div>

        {/* Multiplier */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-muted">Risk Multiplier</span>
          <span className="text-xs text-text-secondary font-mono">{breakdown.multiplier.toFixed(2)}x</span>
        </div>
      </CardContent>
    </Card>
  )
}

interface FactorRowProps {
  label: string
  value: number
  barWidth: number
  color: string
  type: 'increase' | 'decrease' | 'neutral'
  tooltip: string
  delay?: number
}

function FactorRow({ label, value, barWidth, color, type, tooltip, delay = 0 }: FactorRowProps) {
  const displayValue = value >= 0 ? `+Rs.${Math.abs(value).toFixed(0)}` : `-Rs.${Math.abs(value).toFixed(0)}`
  const textColor = type === 'decrease' ? 'text-status-success' : type === 'increase' ? 'text-status-danger' : 'text-text-muted'
  const Icon = type === 'decrease' ? TrendingDown : type === 'increase' ? TrendingUp : Minus

  return (
    <div className="group relative flex items-center gap-3">
      {/* Label */}
      <div className="flex items-center gap-1.5 w-36 flex-shrink-0">
        <Icon className={`h-3.5 w-3.5 flex-shrink-0 ${textColor}`} />
        <span className="text-xs text-text-secondary truncate">{label}</span>
      </div>

      {/* Bar */}
      <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${barWidth}%` }}
          transition={{ duration: 0.7, delay, ease: 'easeOut' }}
        />
      </div>

      {/* Value */}
      <span className={`text-xs font-medium w-16 text-right flex-shrink-0 ${textColor}`}>
        {value === 0 ? '–' : displayValue}
      </span>

      {/* Tooltip */}
      <div className="pointer-events-none absolute bottom-full left-36 mb-1 hidden w-48 rounded-md bg-surface-card border border-surface-border p-2 text-[10px] text-text-secondary shadow-card group-hover:block z-50">
        {tooltip}
      </div>
    </div>
  )
}
