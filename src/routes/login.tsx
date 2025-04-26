import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useAuth } from '~/auth/AuthContext'
import { useEffect } from 'react'
import { useMutation } from '~/hooks/useMutation'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Card } from '~/components/ui/card'
import { loginFn } from './_authed/-server'
import { useToast } from '~/hooks/use-toast'

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      redirect: search.redirect as string | undefined,
    }
  },
  beforeLoad: ({ navigate }) => {
    return null
  },
  component: LoginPage,
})

function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, refreshAuth } = useAuth()

  useEffect(() => {
    if (user) {
      router.navigate({ to: '/app', replace: true })
    }
  }, [user, router])
  const loginMutation = useMutation({
    fn: loginFn,
    onSuccess: async ({ data: response }) => {
      if (!response.error) {
        await refreshAuth()
        toast({
          title: "Success",
          description: "Successfully logged in",
          variant: "default",
        })
        // Get the redirect URL from search params or default to '/_authed'
        const { redirect } = router.state.location.search
        router.navigate({
          to: redirect || '/alerts',
          replace: true // Replace the current entry in history to prevent back button issues
        })
      } else {
        toast({
          title: "Error",
          description: response.message || "An unexpected error occurred",
          variant: "destructive",
        })
      }
    }
  })

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-center mb-2">Welcome back</h1>
        <p className="text-muted-foreground text-center mb-6">Sign in to your account</p>

        <form 
          onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.target as HTMLFormElement)
            loginMutation.mutate({
              data: {
                email: formData.get('email') as string,
                password: formData.get('password') as string,
              },
            })
          }}
          className="space-y-4"
        >
          <div>
            <Input
              name="email"
              type="email"
              placeholder="Email"
              required
              className="w-full"
            />
          </div>

          <div>
            <Input
              name="password"
              type="password"
              placeholder="Password"
              required
              className="w-full"
            />
          </div>


          <Button 
            type="submit" 
            className="w-full"
            disabled={loginMutation.status === 'pending'}
          >
            {loginMutation.status === 'pending' ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="text-center mt-4">
          <span className="text-muted-foreground">Don't have an account? </span>
          <button
            onClick={() => router.navigate({ to: '/register' })}
            className="text-primary hover:underline"
            type="button"
          >
            Sign up
          </button>
        </div>
      </Card>
    </div>
  )
}
