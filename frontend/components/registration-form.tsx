'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Shield,
  User,
  MapPin,
  DollarSign,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { workersApi } from '@/lib/api'
import { ZONES_BY_CITY, CITIES, PLATFORMS, type Platform, type City } from '@/lib/zones'
import { estimatePremium, estimateCoverage } from '@/lib/premium-estimate'

interface FormData {
  name: string
  phone: string
  platform: Platform | ''
  city: City | ''
  zone: string
  worker_id: string
  rating: number
  avg_weekly_hours: number
  baseline_weekly_earnings: number
}

const INITIAL: FormData = {
  name: '',
  phone: '',
  platform: '',
  city: '',
  zone: '',
  worker_id: '',
  rating: 4.0,
  avg_weekly_hours: 40,
  baseline_weekly_earnings: 6000,
}

const STEPS = [
  { label: 'Personal', icon: User },
  { label: 'Work', icon: MapPin },
  { label: 'Earnings', icon: DollarSign },
]

export function RegistrationForm() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(INITIAL)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<{ policyNumber: string; workerId: string; premium: number } | null>(null)

  const set = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }, [])

  const premium = form.city && form.zone
    ? estimatePremium(form.city, form.zone, form.rating, form.avg_weekly_hours, form.baseline_weekly_earnings)
    : 159

  const coverage = estimateCoverage(form.baseline_weekly_earnings)

  const validateStep = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}
    if (step === 0) {
      if (!form.name.trim()) newErrors.name = 'Name is required'
      if (!/^\d{10}$/.test(form.phone)) newErrors.phone = 'Enter valid 10-digit mobile number'
      if (!form.platform) newErrors.platform = 'Select your platform'
    }
    if (step === 1) {
      if (!form.city) newErrors.city = 'Select your city'
      if (!form.zone) newErrors.zone = 'Select your zone'
      if (!form.worker_id.trim()) newErrors.worker_id = 'Worker ID is required'
    }
    if (step === 2) {
      if (form.baseline_weekly_earnings < 1000 || form.baseline_weekly_earnings > 15000)
        newErrors.baseline_weekly_earnings = 'Enter Weekly Earnings between Rs.1,000 and Rs.15,000'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const next = () => { if (validateStep()) setStep((s) => s + 1) }
  const back = () => setStep((s) => s - 1)

  const submit = async () => {
    if (!validateStep()) return
    setLoading(true)
    try {
      const result = await workersApi.register({
        name: form.name,
        phone: form.phone,
        platform: form.platform,
        city: form.city,
        zone: form.zone,
        worker_id: form.worker_id,
        rating: form.rating,
        avg_weekly_hours: form.avg_weekly_hours,
        baseline_weekly_earnings: form.baseline_weekly_earnings,
      }) as { policy_number: string; worker_id: string; weekly_premium: number }
      setSuccess({
        policyNumber: result.policy_number,
        workerId: result.worker_id,
        premium: result.weekly_premium ?? premium,
      })
    } catch (err) {
      setErrors({ name: err instanceof Error ? err.message : 'Registration failed. Try again.' })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <Card className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="mx-auto mb-6 h-20 w-20 rounded-full bg-status-success/15 border-2 border-status-success/40 flex items-center justify-center animate-pulse-glow"
          >
            <CheckCircle className="h-10 w-10 text-status-success" />
          </motion.div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">You&apos;re Covered!</h2>
          <p className="text-text-secondary mb-6">Your GigShield policy is now active.</p>
          <div className="rounded-card border border-surface-border bg-surface p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Policy Number</span>
              <span className="policy-number font-mono text-xs">{success.policyNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Weekly Premium</span>
              <span className="font-semibold text-brand-primary">Rs.{success.premium}/week</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Coverage</span>
              <span className="font-semibold text-status-success">Up to Rs.{coverage}/week</span>
            </div>
          </div>
          <Button
            className="w-full"
            onClick={() => router.push(`/dashboard?worker_id=${encodeURIComponent(form.worker_id)}`)}
          >
            View My Dashboard
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {STEPS.map((s, i) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 ${
                  i < step
                    ? 'bg-status-success text-white'
                    : i === step
                    ? 'bg-brand-primary text-white shadow-glow-indigo'
                    : 'bg-surface-card text-text-muted border border-surface-border'
                }`}
              >
                {i < step ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <span className={`text-xs hidden sm:block ${i === step ? 'text-text-primary font-medium' : 'text-text-muted'}`}>
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-8 ${i < step ? 'bg-status-success' : 'bg-surface-border'} transition-colors duration-300`} />
              )}
            </div>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>
                {step === 0 && 'Personal Information'}
                {step === 1 && 'Work Details'}
                {step === 2 && 'Weekly Earnings & Summary'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Step 0: Personal Info */}
              {step === 0 && (
                <>
                  <Input
                    id="name"
                    label="Full Name"
                    placeholder="Rajesh Kumar"
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    error={errors.name}
                  />
                  <Input
                    id="phone"
                    label="Mobile Number"
                    type="tel"
                    placeholder="9876543210"
                    adornment="+91"
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    error={errors.phone}
                  />
                  <div>
                    <Select
                      value={form.platform}
                      onValueChange={(v) => set('platform', v as Platform)}
                    >
                      <SelectTrigger label="Platform" id="platform" error={errors.platform}>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {PLATFORMS.map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.platform && <p className="mt-1 text-xs text-status-danger">{errors.platform}</p>}
                  </div>
                </>
              )}

              {/* Step 1: Work Details */}
              {step === 1 && (
                <>
                  <div>
                    <Select
                      value={form.city}
                      onValueChange={(v) => { set('city', v as City); set('zone', '') }}
                    >
                      <SelectTrigger label="City" id="city" error={errors.city}>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {CITIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.city && <p className="mt-1 text-xs text-status-danger">{errors.city}</p>}
                  </div>
                  <div>
                    <Select
                      value={form.zone}
                      disabled={!form.city}
                      onValueChange={(v) => set('zone', v)}
                    >
                      <SelectTrigger label="Zone / Area" id="zone" error={errors.zone}>
                        <SelectValue placeholder={form.city ? 'Select zone' : 'Select city first'} />
                      </SelectTrigger>
                      <SelectContent>
                        {form.city && ZONES_BY_CITY[form.city]?.map((z) => (
                          <SelectItem key={z} value={z}>{z}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.zone && <p className="mt-1 text-xs text-status-danger">{errors.zone}</p>}
                  </div>
                  <Input
                    id="worker_id"
                    label="Worker ID (from your app)"
                    placeholder="SWGMUM12345"
                    value={form.worker_id}
                    onChange={(e) => set('worker_id', e.target.value.toUpperCase())}
                    error={errors.worker_id}
                  />
                  {/* Rating slider */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Platform Rating
                      <span className="ml-2 text-text-primary font-semibold">
                        {form.rating.toFixed(1)} <Star className="inline h-3.5 w-3.5 text-amber-400 fill-amber-400 mb-0.5" />
                      </span>
                    </label>
                    <input
                      type="range"
                      min={1.0}
                      max={5.0}
                      step={0.1}
                      value={form.rating}
                      onChange={(e) => set('rating', parseFloat(e.target.value))}
                      className="w-full h-2 rounded-full bg-surface-card accent-brand-primary cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-text-muted mt-1">
                      <span>1.0</span><span>5.0</span>
                    </div>
                  </div>
                  {/* Hours slider */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Avg. Hours/Week
                      <span className="ml-2 text-text-primary font-semibold">{form.avg_weekly_hours}h</span>
                    </label>
                    <input
                      type="range"
                      min={10}
                      max={80}
                      step={5}
                      value={form.avg_weekly_hours}
                      onChange={(e) => set('avg_weekly_hours', parseInt(e.target.value))}
                      className="w-full h-2 rounded-full bg-surface-card accent-brand-primary cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-text-muted mt-1">
                      <span>10h</span><span>80h</span>
                    </div>
                  </div>
                </>
              )}

              {/* Step 2: Earnings + Summary */}
              {step === 2 && (
                <>
                  <Input
                    id="earnings"
                    label="Avg. Weekly Earnings (Rs.)"
                    type="number"
                    placeholder="6000"
                    adornment="₹"
                    min={1000}
                    max={15000}
                    value={form.baseline_weekly_earnings || ''}
                    onChange={(e) => set('baseline_weekly_earnings', parseInt(e.target.value) || 0)}
                    error={errors.baseline_weekly_earnings}
                  />

                  {/* Premium preview card */}
                  {form.city && form.zone && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-card border border-brand-primary/30 bg-brand-primary/5 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-text-secondary">Your Weekly Premium</span>
                        <span className="text-2xl font-bold text-brand-primary">Rs.{premium}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-muted">Max Coverage</span>
                        <span className="text-status-success font-semibold">Up to Rs.{coverage}/week</span>
                      </div>
                      <div className="h-px bg-surface-border" />
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-muted">Zone: {form.city} — {form.zone}</span>
                        <span className="text-text-muted">XGBoost estimate</span>
                      </div>
                    </motion.div>
                  )}
                </>
              )}

              {/* Navigation */}
              <div className="flex gap-3 pt-2">
                {step > 0 && (
                  <Button variant="outline" onClick={back} className="flex-1">
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>
                )}
                {step < 2 ? (
                  <Button onClick={next} className="flex-1">
                    Continue
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={submit} loading={loading} className="flex-1">
                    <Shield className="h-4 w-4" />
                    Get Covered — Rs.{premium}/week
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
