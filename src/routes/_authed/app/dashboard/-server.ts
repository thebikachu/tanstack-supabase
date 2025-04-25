import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '~/middleware/authMiddleware'
import { z } from 'zod'

export interface DashboardStats {
  totalUsers: number
  activeUsers: number
  revenue: number
  activeProjects: number
  monthlyGrowth: {
    users: number
    active: number
    revenue: number
    projects: number
  }
}

export const getDashboardStats = createServerFn()
.middleware([authMiddleware]).handler(async ({ context }) => {
  // Log JWT token length for debugging
  console.log('JWT Token length:', context.accessToken.length)

  // Mock FastAPI response
  const mockStats: DashboardStats = {
    totalUsers: 1234,
    activeUsers: 891,
    revenue: 12345,
    activeProjects: 23,
    monthlyGrowth: {
      users: 12,
      active: 5,
      revenue: 8,
      projects: 2
    }
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500))

  return mockStats
})