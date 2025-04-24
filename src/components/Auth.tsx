import { Button } from './ui/button'
import { Card } from './ui/card'
import { Input } from './ui/input'

interface AuthProps {
  actionText: string
  status: 'idle' | 'loading' | 'error' | 'success'
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  afterSubmit?: React.ReactNode
  footer?: React.ReactNode
  message?: string
}

export function Auth({ actionText, status, onSubmit, afterSubmit, footer, message }: AuthProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            {actionText === 'Login' ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {actionText === 'Login' ? 'Sign in to your account' : 'Sign up to get started'}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={actionText === 'Login' ? 'current-password' : 'new-password'}
              required
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" className="w-full" disabled={status === 'loading'}>
            {status === 'loading'
              ? actionText === 'Login'
                ? 'Signing in...'
                : 'Creating account...'
              : actionText}
          </Button>
        </form>

        {afterSubmit}
        {message && (
          <div className="text-green-600 text-center mt-4" role="status">
            {message}
          </div>
        )}
        {footer}
      </Card>
    </div>
  )
}