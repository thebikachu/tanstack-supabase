import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getBillingInfo } from './-server'

export const Route = createFileRoute('/_authed/app/billing/')({
  component: BillingIndex,
})

function BillingHistorySkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
      <div className="border rounded-lg p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground border-b">
              <th className="text-left pb-2">Date</th>
              <th className="text-left pb-2">Description</th>
              <th className="text-right pb-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((i) => (
              <tr key={i} className="border-b">
                <td className="py-2">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                </td>
                <td className="py-2">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                </td>
                <td className="text-right py-2">
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse ml-auto"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function BillingHistoryContent() {
  const { data } = useSuspenseQuery({
    queryKey: ['billing-info'],
    queryFn: () => getBillingInfo(),
  })

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Billing History</h2>
      <p className="text-muted-foreground">
        View your recent transactions and billing history.
      </p>
      <div className="border rounded-lg p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground border-b">
              <th className="text-left pb-2">Date</th>
              <th className="text-left pb-2">Description</th>
              <th className="text-right pb-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.history.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="py-2">{item.date}</td>
                <td className="py-2">{item.description}</td>
                <td className="text-right py-2">${item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function BillingIndex() {
  return (
    <Suspense fallback={<BillingHistorySkeleton />}>
      <BillingHistoryContent />
    </Suspense>
  )
}