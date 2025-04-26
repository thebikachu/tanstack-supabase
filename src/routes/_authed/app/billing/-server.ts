import { createServerFn } from '@tanstack/react-start'
import { authMiddleware, type AuthContext } from '~/middleware/authMiddleware'
import { z } from 'zod'
import Stripe from 'stripe'

export type PlanTier = 'free' | 'pro' | 'enterprise'
export type BillingPeriod = 'monthly' | 'yearly'

interface PlanPrices {
  monthly: string | undefined
  yearly: string | undefined
}

// Only subscription tiers get price IDs here
const STRIPE_PRICE_IDS: Record<'pro' | 'enterprise', PlanPrices> = {
  pro: {
    monthly: process.env.STRIPE_PRICE_ID_PRO_MONTHLY,
    yearly: process.env.STRIPE_PRICE_ID_PRO_YEARLY,
  },
  enterprise: {
    monthly: process.env.STRIPE_PRICE_ID_ENT_MONTHLY,
    yearly: process.env.STRIPE_PRICE_ID_ENT_YEARLY,
  },
}

const CREDIT_PACK_PRICE_IDS = {
  small: process.env.STRIPE_PRICE_ID_CREDITS_SMALL,
  medium: process.env.STRIPE_PRICE_ID_CREDITS_MEDIUM,
  large: process.env.STRIPE_PRICE_ID_CREDITS_LARGE,
} as const

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
if (!stripeSecretKey) {
  console.error('FATAL ERROR: STRIPE_SECRET_KEY is not set. Billing functionality will fail.')
}
const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' })
  : undefined

export interface BillingHistoryItem {
  id: string
  date: string
  description: string
  amount: number
}

export interface BillingInfo {
  plan: {
    name: PlanTier
    billingPeriod: BillingPeriod
    amount: number
    nextPaymentDate: string | null
    status: string
  } | null
  paymentMethod: {
    brand: string | null
    cardLast4: string | null
    expiryDate: string | null
  } | null
  history: BillingHistoryItem[]
}

export const getBillingInfo = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<BillingInfo> => {
    console.log('getBillingInfo: User email:', context.user?.email)
    console.log('getBillingInfo: AccessToken length:', context.accessToken?.length ?? 0)

    // simulate fetch delay
    await new Promise((r) => setTimeout(r, 500))

    const mockPlan = {
      name: 'free' as const,
      billingPeriod: 'monthly' as const,
      amount: 0,
      nextPaymentDate: null,
      status: 'active',
    }

    const mockPaymentMethod = {
      brand: 'Visa',
      cardLast4: '4242',
      expiryDate: '04/2025',
    }

    const mockHistory: BillingHistoryItem[] = [
      { id: 'in_1', date: '2024-04-01', description: 'Pro Plan - Monthly', amount: 29.0 },
      { id: 'in_2', date: '2024-03-01', description: 'Pro Plan - Monthly', amount: 29.0 },
      { id: 'in_3', date: '2024-02-01', description: 'Pro Plan - Monthly', amount: 29.0 },
    ]

    return {
      plan: mockPlan,
      paymentMethod: mockPaymentMethod,
      history: mockHistory,
    }
  })

const createCheckoutSchema = z.object({
  plan: z.enum(['pro', 'enterprise']),
  billingPeriod: z.enum(['monthly', 'yearly']),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
})

function getSubscriptionPriceId(
  plan: z.infer<typeof createCheckoutSchema>['plan'],
  billingPeriod: z.infer<typeof createCheckoutSchema>['billingPeriod'],
): string {
  const planConfig = STRIPE_PRICE_IDS[plan]
  const priceId = planConfig[billingPeriod]
  if (!priceId) {
    throw new Error(`Configuration error: Price ID for plan '${plan}' (${billingPeriod}) is missing.`)
  }
  return priceId
}

export type CheckoutSessionResult = {
  sessionId: string
  url: string
}

export const createCheckoutSession = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator((data): z.infer<typeof createCheckoutSchema> => createCheckoutSchema.parse(data))
  .handler(async ({ data, context }): Promise<CheckoutSessionResult> => {
    if (!stripe) throw new Error('Stripe is not initialized. Check STRIPE_SECRET_KEY.')
    if (!context.user?.email) throw new Error('User email is not available in context.')

    const priceId = getSubscriptionPriceId(data.plan, data.billingPeriod)
    console.log(`Creating checkout session for plan=${data.plan}, period=${data.billingPeriod}, priceId=${priceId}, user=${context.user.email}`)

    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${data.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: data.cancelUrl,
        customer_email: context.user.email,
        metadata: { userId: context.user.id ?? 'unknown' },
      })
      console.log('Stripe session created:', session.id)
      if (!session.url) throw new Error('Stripe session was created but is missing the URL.')
      return { sessionId: session.id, url: session.url }
    } catch (err: unknown) {
      console.error('Stripe checkout session creation failed:', err)
      const message = err instanceof Error ? err.message : 'An unknown error occurred'
      throw new Error(`Failed to create checkout session: ${message}`)
    }
  })

export const createCreditsCheckoutSchema = z.object({
  packSize: z.enum(['small', 'medium', 'large']),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
})

function getCreditPriceId(packSize: z.infer<typeof createCreditsCheckoutSchema>['packSize']): string {
  const priceId = CREDIT_PACK_PRICE_IDS[packSize]
  if (!priceId) {
    throw new Error(`Configuration error: Price ID for credit pack size '${packSize}' is missing.`)
  }
  return priceId
}

export const createCreditsCheckoutSession = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator((data): z.infer<typeof createCreditsCheckoutSchema> => createCreditsCheckoutSchema.parse(data))
  .handler(async ({ data, context }): Promise<CheckoutSessionResult> => {
    if (!stripe) throw new Error('Stripe is not initialized. Check STRIPE_SECRET_KEY.')
    if (!context.user?.email) throw new Error('User email is not available in context.')

    const priceId = getCreditPriceId(data.packSize)
    console.log(`Creating credits session for size=${data.packSize}, priceId=${priceId}, user=${context.user.email}`)

    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${data.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: data.cancelUrl,
        customer_email: context.user.email,
        metadata: { userId: context.user.id ?? 'unknown', packSize: data.packSize },
      })
      console.log('Stripe credits session created:', session.id)
      if (!session.url) throw new Error('Stripe session was created but is missing the URL.')
      return { sessionId: session.id, url: session.url }
    } catch (err: unknown) {
      console.error('Stripe credits checkout session creation failed:', err)
      const message = err instanceof Error ? err.message : 'An unknown error occurred'
      throw new Error(`Failed to create credits checkout session: ${message}`)
    }
  })
