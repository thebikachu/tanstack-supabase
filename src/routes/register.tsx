import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useAuth } from '~/auth/AuthContext'
import { useEffect } from 'react'
import { useMutation } from '~/hooks/useMutation'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Card } from '~/components/ui/card'
import { signupFn } from './_authed/-server'
import { useToast } from '~/hooks/use-toast'

type SignupRequest = {
  data: {
    email: string
    password: string
  }
}

type AuthResponse = {
  error: boolean
  message?: string
  data?: {
    user: { id: string; email: string | undefined; created_at: string } | null
    session: { access_token: string; expires_at: number | undefined; refresh_token: string } | null
  }
}

export const Route = createFileRoute('/register')({
  beforeLoad: () => {
    // Auth check will be handled in the component
    return null
  },
  component: RegisterPage,
})

function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      router.navigate({ to: '/app', replace: true })
    }
  }, [user, router])
  
  const signupMutation = useMutation<SignupRequest, AuthResponse>({
    fn: signupFn,
    onSuccess: async ({ data: response }) => {
      if (!response.error) {
        toast({
          title: "Success",
          description: "Account created successfully. Please check your email to confirm your account.",
          variant: "default",
        })
        router.navigate({
          to: '/login',
          search: {
            redirect: undefined
          }
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
        <h1 className="text-2xl font-bold text-center mb-2">Create an account</h1>
        <p className="text-muted-foreground text-center mb-6">Sign up to get started</p>

        <form 
          onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.target as HTMLFormElement)
            signupMutation.mutate({
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
            disabled={signupMutation.status === 'pending'}
          >
            {signupMutation.status === 'pending' ? 'Creating account...' : 'Sign up'}
          </Button>
        </form>

        <div className="text-center mt-4">
          <span className="text-muted-foreground">Already have an account? </span>
          <button
            onClick={() => router.navigate({
              to: '/login',
              search: {
                redirect: undefined
              }
            })}
            className="text-primary hover:underline"
            type="button"
          >
            Sign in
          </button>
        </div>
      </Card>
    </div>
  )
}
