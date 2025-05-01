import { useMutation } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/app/test/')({
  component: TestPage,
})
import { useState } from 'react'
import { Card } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { useToast } from '~/components/ui/use-toast'
import { Label } from '~/components/ui/label'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { spendCreditsFn } from '../../-server'
import { useServerFn } from '@tanstack/react-start'

export default function TestPage() {
  const [amount, setAmount] = useState<number>(1)
  const [action, setAction] = useState<string>('test_action')
  const { toast } = useToast()
  const spendCredits = useServerFn(spendCreditsFn)

  const spendCreditsMutation = useMutation({
    mutationFn: async ({ amount, action }: { amount: number; action: string }) => {
      const result = await spendCredits({ data: { amount, action } })
      if (result.error) {
        throw new Error(result.message)
      }
      return result.data!
    },
    onSuccess: (data) => {
      toast({
        title: 'Credits Spent Successfully',
        description: `Spent ${data.credits_spent} credits. Remaining balance: ${data.remaining_balance}`,
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    spendCreditsMutation.mutate({ amount, action })
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Test Credit Spend</h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount of Credits</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="action">Action</Label>
            <Input
              id="action"
              type="text"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="test_action"
            />
          </div>

          <Button
            type="submit"
            disabled={spendCreditsMutation.isPending}
            className="w-full"
          >
            {spendCreditsMutation.isPending ? 'Processing...' : 'Spend Credits'}
          </Button>
        </form>

        {spendCreditsMutation.isSuccess && (
          <Alert className="mt-6">
            <AlertDescription>
              <div className="space-y-2">
                <p>
                  <strong>Status:</strong> {spendCreditsMutation.data.status}
                </p>
                <p>
                  <strong>Credits Spent:</strong>{' '}
                  {spendCreditsMutation.data.credits_spent}
                </p>
                <p>
                  <strong>Remaining Balance:</strong>{' '}
                  {spendCreditsMutation.data.remaining_balance}
                </p>
                <p>
                  <strong>Transaction ID:</strong>{' '}
                  {spendCreditsMutation.data.transaction_id}
                </p>
                <p>
                  <strong>Timestamp:</strong>{' '}
                  {new Date(
                    spendCreditsMutation.data.timestamp
                  ).toLocaleString()}
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </Card>
    </div>
  )
}