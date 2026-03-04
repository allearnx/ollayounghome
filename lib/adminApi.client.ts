'use client';

import { supabase } from '@/lib/supabase';

export async function getAdminAccessTokenOrThrow() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('인증이 필요합니다.');
  }
  return session.access_token;
}

export async function adminFetch(input: string, init: RequestInit = {}) {
  const accessToken = await getAdminAccessTokenOrThrow();
  return fetch(input, {
    ...init,
    headers: {
      ...(init.headers || {}),
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
