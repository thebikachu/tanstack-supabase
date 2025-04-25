import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '~/middleware/authMiddleware'
import { z } from 'zod'

export interface BillingHistoryItem {
  id: string
  date: string
  description: string
  amount: number
}

export interface BillingInfo {
  plan: {
    name: string
    billingPeriod: string
    amount: number
    nextPayment: string
  }
  paymentMethod: {
    cardLast4: string
    expiryDate: string
  }
  history: BillingHistoryItem[]
}

export const getBillingInfo = createServerFn()
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    // Log JWT token length for debugging
    console.log('JWT Token length:', context.accessToken.length)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock data
    return {
      plan: {
        name: 'Pro',
        billingPeriod: 'Monthly',
        amount: 29,
        nextPayment: 'May 1, 2024',
      },
      paymentMethod: {
        cardLast4: '4242',
        expiryDate: '04/2025',
      },
      history: [
        {
          id: '1',
          date: 'Apr 1, 2024',
          description: 'Pro Plan - Monthly',
          amount: 29.0,
        },
        {
          id: '2',
          date: 'Mar 1, 2024',
          description: 'Pro Plan - Monthly',
          amount: 29.0,
        },
        {
          id: '3',
          date: 'Feb 1, 2024',
          description: 'Pro Plan - Monthly',
          amount: 29.0,
        },
      ],
    }
  })
