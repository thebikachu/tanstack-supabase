import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/billing/')({
  component: BillingIndex,
})

function BillingIndex() {
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
            <tr className="border-b">
              <td className="py-2">Apr 1, 2024</td>
              <td className="py-2">Pro Plan - Monthly</td>
              <td className="text-right py-2">$29.00</td>
            </tr>
            <tr className="border-b">
              <td className="py-2">Mar 1, 2024</td>
              <td className="py-2">Pro Plan - Monthly</td>
              <td className="text-right py-2">$29.00</td>
            </tr>
            <tr>
              <td className="py-2">Feb 1, 2024</td>
              <td className="py-2">Pro Plan - Monthly</td>
              <td className="text-right py-2">$29.00</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}