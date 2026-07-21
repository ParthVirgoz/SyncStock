import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { login as loginApi } from '../api/auth'
import Button from '../components/ui/Button'
import TextField from '../components/ui/TextField'
import { useAuthStore } from '../store/useAuthStore'
import { hasErrors, validateLoginForm } from '../utils/validation'

export default function LoginPage() {
  const navigate = useNavigate()
  const authLogin = useAuthStore((s) => s.login)
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = validateLoginForm(form)
    if (hasErrors(nextErrors)) {
      setErrors(nextErrors)
      return
    }

    setSubmitting(true)

    try {
      const { user, accessToken } = await loginApi(form)
      authLogin(user, accessToken)
      toast.success('Welcome back', {
        description: 'You are signed in.',
      })
      navigate('/', { replace: true })
    } catch (error) {
      toast.error('Sign in failed', {
        description: error.message,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex h-screen overflow-y-auto items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
            SyncStock
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
            Admin sign in
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Enter your credentials to access the dashboard.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <TextField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@syncstock.com"
              required
              error={errors.email}
              disabled={submitting}
              autoComplete="email"
            />

            <TextField
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              error={errors.password}
              disabled={submitting}
              autoComplete="current-password"
            />

            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
