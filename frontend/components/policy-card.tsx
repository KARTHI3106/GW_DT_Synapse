'use client'

import { motion } from 'framer-motion'
import { Calendar, Shield, RefreshCw, PauseCircle, PlayCircle, ExternalLink } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GuidewireBadge } from '@/components/guidewire-badge'
import { formatDate, formatCurrency } from '@/lib/utils'

interface Policy {
  id: string
  policy_number: string
  status: 'active' | 'paused' | 'expired' | 'cancelled'
  start_date: string
  end_date: string
  weekly_premium: number
  coverage_amount: number
  claims_count?: number
  total_payout?: number
  worker_name?: string
  worker_city?: string
}

interface PolicyCardProps {
  policy: Policy | null
  loading?: boolean
  onRenew?: (id: string) => void
  onPause?: (id: string) => void
  onResume?: (id: string) => void
  renewLoading?: boolean
}

const STATUS_MAP = {
  active: { variant: 'success' as const, label: 'Active Coverage' },
  paused: { variant: 'warning' as const, label: 'Paused' },
  expired: { variant: 'danger' as const, label: 'Expired' },
  cancelled: { variant: 'danger' as const, label: 'Cancelled' },
}

export function PolicyCard({ policy, loading, onRenew, onPause, onResume, renewLoading }: PolicyCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="skeleton h-5 w-40" />
            <div className="skeleton h-6 w-24 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="skeleton h-4 w-24" />
              <div className="skeleton h-4 w-32" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!policy) {
    return (
      <Card className="p-6 text-center">
        <Shield className="h-10 w-10 text-text-muted mx-auto mb-3" />
        <p className="text-text-secondary">No active policy found.</p>
      </Card>
    )
  }

  const statusConfig = STATUS_MAP[policy.status] ?? STATUS_MAP.active

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CardTitle>Your Policy</CardTitle>
                <GuidewireBadge />
              </div>
              <p className="policy-number text-xs">{policy.policy_number}</p>
            </div>
            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Coverage period */}
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-text-muted">
              <Calendar className="h-3.5 w-3.5" />
              Coverage Period
            </span>
            <span className="text-text-primary font-medium">
              {formatDate(policy.start_date)} → {formatDate(policy.end_date)}
            </span>
          </div>

          {/* Weekly premium */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">Weekly Premium</span>
            <span className="font-bold text-brand-primary">{formatCurrency(policy.weekly_premium)}/week</span>
          </div>

          {/* Max coverage */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">Max Payout/Trigger</span>
            <span className="font-semibold text-status-success">Up to {formatCurrency(policy.coverage_amount)}</span>
          </div>

          {/* Claims summary */}
          {policy.claims_count !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Claims This Week</span>
              <span className="text-text-primary">
                {policy.claims_count} claim{policy.claims_count !== 1 ? 's' : ''}
                {policy.total_payout ? ` • ${formatCurrency(policy.total_payout)} paid` : ''}
              </span>
            </div>
          )}

          {/* Guidewire note */}
          <div className="rounded-md bg-surface p-2.5 border border-surface-border text-[10px] text-text-muted flex items-start gap-1.5 mt-1">
            <ExternalLink className="h-3 w-3 flex-shrink-0 mt-0.5" />
            <span>
              [SIMULATED] In production, this policy maps to Guidewire PolicyCenter.
              Policy lifecycle events (create/renew/pause) call PC REST API.
            </span>
          </div>
        </CardContent>

        <CardFooter className="gap-2 flex-wrap">
          {policy.status === 'active' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRenew?.(policy.id)}
                loading={renewLoading}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Renew
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPause?.(policy.id)}
              >
                <PauseCircle className="h-3.5 w-3.5" />
                Pause Coverage
              </Button>
            </>
          )}
          {policy.status === 'paused' && (
            <Button
              size="sm"
              onClick={() => onResume?.(policy.id)}
            >
              <PlayCircle className="h-3.5 w-3.5" />
              Resume Coverage
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}
