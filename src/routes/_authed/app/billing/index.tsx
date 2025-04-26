import { createFileRoute } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { Suspense, useState, type ReactElement } from 'react'
import { useSuspenseQuery, useMutation } from '@tanstack/react-query'
import {
  getBillingInfo,
  createCheckoutSession,
  createCreditsCheckoutSession,
  type BillingInfo,
  type PlanTier,
  type BillingPeriod,
  type CheckoutSessionResult,
  createCreditsCheckoutSchema,
} from './-server'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'
import { Switch } from '~/components/ui/switch'
import { Label } from '~/components/ui/label'
import { toast } from '~/components/ui/use-toast'
import { cn } from '~/lib/utils'

const billingInfoQueryKey = ['billing-info']

export const Route = createFileRoute('/_authed/app/billing/')({
  loader: ({ context }) => {
    const queryClient = (context as { queryClient: QueryClient }).queryClient
    if (!queryClient) throw new Error('QueryClient not found in context')
    return queryClient.ensureQueryData({
      queryKey: billingInfoQueryKey,
      queryFn: getBillingInfo,
    })
  },
  component: BillingIndex,
  errorComponent: BillingError,
  pendingComponent: BillingSkeleton,
})

function BillingSkeleton() {
  return (
    <div className="bg-gray-50/50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-8 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-white border-0">
              <CardHeader className="pb-0">
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full mb-4" />
                <div className="space-y-2">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

function BillingError({ error }: { error: Error }): ReactElement {
  return (
    <div className="flex items-center justify-center p-8">
      <Card className="max-w-md w-full bg-white border-0">
        <CardHeader>
          <CardTitle className="text-red-600">Unable to load billing information</CardTitle>
          <CardDescription>{error.message}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}

function BillingHistorySection(): ReactElement {
  const { data: billingInfo } = useSuspenseQuery({
    queryKey: billingInfoQueryKey,
    queryFn: getBillingInfo,
  })

  return (
    <div className="bg-white rounded-lg border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-medium">Transaction History</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {billingInfo.history.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            No transactions to display
          </div>
        ) : (
          billingInfo.history.map((item) => (
            <div key={item.id} className="px-6 py-4 flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">{item.description}</div>
                <div className="text-sm text-gray-500">{item.date}</div>
              </div>
              <div className="font-medium">${item.amount.toFixed(2)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function CurrentPlanSection({ plan }: { plan: BillingInfo['plan'] }) {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>(
    plan?.billingPeriod === 'yearly' ? 'yearly' : 'monthly'
  )

  const checkoutMutation = useMutation<
    CheckoutSessionResult,
    Error,
    { plan: 'pro' | 'enterprise'; billingPeriod: BillingPeriod; successUrl: string; cancelUrl: string }
  >({
    mutationFn: async (data) => {
      const result = await createCheckoutSession({ data })
      return result
    },
    onSuccess: (result) => {
      if (result.url) {
        window.location.href = result.url
      } else {
        toast({
          title: 'Error',
          description: 'No redirect URL returned.',
          variant: 'destructive',
        })
      }
    },
    onError: (err) => {
      toast({
        title: 'Upgrade failed',
        description: err.message,
        variant: 'destructive',
      })
    },
  })

  const getNextTier = (): PlanTier | null => {
    const current = plan?.name.toLowerCase()
    if (!current || current === 'enterprise') return null
    return current === 'free' ? 'pro' : 'enterprise'
  }
  const nextTier = getNextTier()

  if (!plan) return null

  return (
    <div className="bg-white rounded-lg border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-medium">Current Plan</h3>
      </div>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-2xl font-semibold text-gray-900">{plan.name}</div>
            <div className="text-gray-500">${plan.amount}/month</div>
          </div>
          <div className={cn(
            "px-3 py-1 rounded-full text-sm font-medium",
            plan.status === 'active' 
              ? "bg-green-50 text-green-700" 
              : "bg-yellow-50 text-yellow-700"
          )}>
            {plan.status}
          </div>
        </div>

        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-gray-500">Billing Period</dt>
            <dd className="text-sm font-medium text-gray-900">{plan.billingPeriod}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Next Payment</dt>
            <dd className="text-sm font-medium text-gray-900">{plan.nextPaymentDate || 'N/A'}</dd>
          </div>
        </dl>

        {nextTier && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <Label htmlFor="billing-period" className="text-sm">Monthly</Label>
              <Switch
                id="billing-period"
                checked={billingPeriod === 'yearly'}
                onCheckedChange={(checked) =>
                  setBillingPeriod(checked ? 'yearly' : 'monthly')
                }
              />
              <Label htmlFor="billing-period" className="text-sm">
                Yearly <span className="text-green-600">(Save 20%)</span>
              </Label>
            </div>
            <Button
              onClick={() =>
                checkoutMutation.mutate({
                  plan: nextTier as 'pro' | 'enterprise',
                  billingPeriod,
                  successUrl: `${window.location.origin}/app/billing?success=plan`,
                  cancelUrl: `${window.location.origin}/app/billing`,
                })
              }
              disabled={checkoutMutation.isPending}
              className="w-full"
              variant="outline"
              size="lg"
            >
              {checkoutMutation.isPending
                ? 'Processing…'
                : `Upgrade to ${nextTier.charAt(0).toUpperCase() + nextTier.slice(1)}`}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function BuyCreditsSection() {
  const [processingPack, setProcessingPack] = useState<'small' | 'medium' | 'large' | null>(null)

  const creditsMutation = useMutation<
    CheckoutSessionResult,
    Error,
    z.infer<typeof createCreditsCheckoutSchema>
  >({
    mutationFn: async (data) => {
      const result = await createCreditsCheckoutSession({ data })
      return result
    },
    onSuccess: (res) => {
      if (res.url) {
        window.location.href = res.url
      } else {
        toast({
          title: 'Error',
          description: 'No redirect URL returned.',
          variant: 'destructive',
        })
      }
    },
    onError: (err) => {
      toast({
        title: 'Purchase failed',
        description: err.message,
        variant: 'destructive',
      })
    },
    onSettled: () => setProcessingPack(null),
  })

  const creditPacks = [
    { size: 'small' as const, amount: 100, price: 10, description: 'Basic Pack' },
    { size: 'medium' as const, amount: 550, price: 50, description: 'Most Popular' },
    { size: 'large' as const, amount: 1200, price: 100, description: 'Best Value' },
  ]

  return (
    <div className="bg-white rounded-lg border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-medium">Purchase Credits</h3>
        <p className="text-sm text-gray-500 mt-1">Add more credits to your account</p>
      </div>
      <div className="p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {creditPacks.map((pack) => {
            const isPopular = pack.size === 'medium'
            const isBestValue = pack.size === 'large'

            return (
              <div
                key={pack.size}
                className={cn(
                  "relative rounded-lg border p-6",
                  (isPopular || isBestValue) ? "border-blue-100" : "border-gray-100"
                )}
              >
                {(isPopular || isBestValue) && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className={cn(
                      "inline-block px-3 py-1 text-xs font-medium rounded-full",
                      isPopular ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"
                    )}>
                      {pack.description}
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-gray-900">{pack.amount}</div>
                  <div className="text-sm text-gray-500 mt-1">Credits</div>
                </div>

                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-900">${pack.price}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    ${(pack.price / pack.amount).toFixed(2)} per credit
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setProcessingPack(pack.size)
                    creditsMutation.mutate({
                      packSize: pack.size,
                      successUrl: `${window.location.origin}/app/billing?success=credits`,
                      cancelUrl: `${window.location.origin}/app/billing`,
                    })
                  }}
                  disabled={creditsMutation.isPending && processingPack === pack.size}
                  variant={isPopular || isBestValue ? 'default' : 'outline'}
                  className="w-full"
                  size="lg"
                >
                  {creditsMutation.isPending && processingPack === pack.size
                    ? 'Processing…'
                    : 'Purchase Credits'}
                </Button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function BillingIndex() {
  const { data: billingInfo } = useSuspenseQuery({
    queryKey: billingInfoQueryKey,
    queryFn: getBillingInfo,
  })

  return (
    <div className="bg-gray-50/50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Billing</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your subscription and credits</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <CurrentPlanSection plan={billingInfo.plan} />
          <BillingHistorySection />
        </div>

        <BuyCreditsSection />
      </div>
    </div>
  )
}
