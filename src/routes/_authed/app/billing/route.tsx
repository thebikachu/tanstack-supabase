import { Outlet, createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Card } from '~/components/ui/card'
import { getBillingInfo } from './-server'
import { Skeleton } from '~/components/ui/skeleton'

export const Route = createFileRoute('/_authed/app/billing')({
  component: BillingLayout,
})

function BillingInfoSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-40" />
            {[1, 2].map((i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <Outlet />
      </Card>
    </div>
  )
}

function BillingInfoContent() {
  const { data } = useSuspenseQuery({
    queryKey: ['billing-info'],
    queryFn: () => getBillingInfo(),
  })

  if (!data.plan || !data.paymentMethod) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
          <p className="text-muted-foreground">
            No active subscription found. Please set up your billing information.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing settings.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Current Plan</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-medium">{data.plan.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Billing Period</span>
              <span className="font-medium">{data.plan.billingPeriod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium">${data.plan.amount}/month</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Next Payment</span>
              <span className="font-medium">{data.plan.nextPaymentDate || 'N/A'}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Card</span>
              <span className="font-medium">•••• {data.paymentMethod.cardLast4}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expires</span>
              <span className="font-medium">{data.paymentMethod.expiryDate}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <Outlet />
      </Card>
    </div>
  )
}

function BillingLayout() {
  return (
    <Suspense fallback={<BillingInfoSkeleton />}>
      <BillingInfoContent />
    </Suspense>
  )
}