// src/middleware/authMiddleware.ts
import { createMiddleware } from '@tanstack/react-start';
import { checkAuth } from '../utils/supabase';
import type { User } from '@supabase/supabase-js';

export interface AuthContext {
  user: User;
  accessToken: string;
}

export const authMiddleware = createMiddleware()
  .server(async ({ next }) => {
    const auth = await checkAuth();

    if (!auth.user) {
      throw new Error('Unauthorized');
    }

    return next({
      context: {
        user: auth.user,
        accessToken: auth.accessToken
      } satisfies AuthContext,
    });
  });