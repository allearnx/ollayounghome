'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, UserRole, Profile } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface UseUserRoleResult {
  user: User | null;
  profile: Profile | null;
  role: UserRole | null;
  isAdmin: boolean;
  isStaff: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  authCheckStatus: 'loading' | 'ready' | 'degraded';
  logout: () => Promise<void>;
  retryAuth: () => Promise<void>;
  refetchProfile: () => Promise<void>;
}

const SESSION_TIMEOUT_MS = 2_500;
const PROFILE_TIMEOUT_MS = 15_000;
const MAX_RETRIES = 2;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cacheKey(userId: string) {
  return `allrounder.profile.${userId}`;
}

function readCachedProfile(userId: string): Profile | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(cacheKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Profile> | null;
    if (!parsed || typeof parsed !== 'object') return null;
    if (parsed.id !== userId) return null;
    if (parsed.role !== 'admin' && parsed.role !== 'staff') return null;
    // Best-effort: tolerate missing timestamps in older cache entries.
    return {
      id: userId,
      created_at: String(parsed.created_at ?? new Date(0).toISOString()),
      updated_at: String(parsed.updated_at ?? new Date(0).toISOString()),
      email: String(parsed.email ?? ''),
      role: parsed.role,
    };
  } catch {
    return null;
  }
}

function writeCachedProfile(profile: Profile) {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(cacheKey(profile.id), JSON.stringify(profile));
  } catch {
    // ignore
  }
}

export function useUserRole(): UseUserRoleResult {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authCheckStatus, setAuthCheckStatus] = useState<'loading' | 'ready' | 'degraded'>('loading');
  const initialCheckDone = useRef(false);

  const withTimeout = async <T,>(promiseLike: PromiseLike<T>, ms: number): Promise<T> => {
    const promise = Promise.resolve(promiseLike);
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`timeout_after_${ms}ms`)), ms)
      ),
    ]);
  };

  const withTimeoutAndRetry = async <T,>(
    fn: () => PromiseLike<T>,
    timeoutMs: number,
    retries: number
  ): Promise<T> => {
    let lastErr: unknown;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await withTimeout(fn(), timeoutMs);
      } catch (err) {
        lastErr = err;
        if (attempt >= retries) break;
        // linear backoff: 250ms, 500ms, ...
        await sleep(250 * (attempt + 1));
      }
    }
    throw lastErr instanceof Error ? lastErr : new Error('unknown_error');
  };

  // 프로필 가져오기
  const fetchProfile = async (userId: string, userEmail: string) => {
    try {
      const { data, error } = await withTimeoutAndRetry(
        () => supabase.from('profiles').select('*').eq('id', userId).single(),
        PROFILE_TIMEOUT_MS,
        MAX_RETRIES
      );

      if (error) {
        // 프로필이 없으면 기본값으로 staff 설정
        // NOTE:
        // - Do NOT downgrade to staff for transient errors.
        // - Only fallback to staff when the row is genuinely missing.
        const code = (error as unknown as { code?: string }).code;
        const msg = String((error as unknown as { message?: string }).message ?? '');
        const isMissingRow =
          code === 'PGRST116' ||
          /0 rows/i.test(msg) ||
          /no rows/i.test(msg) ||
          /Results contain 0 rows/i.test(msg);

        if (isMissingRow) {
          console.warn('Profile row missing; using default staff role');
          const fallback: Profile = {
            id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            email: userEmail,
            role: 'staff',
          };
          setProfile(fallback);
          writeCachedProfile(fallback);
          return;
        }

        throw error;
      }

      setProfile(data);
      writeCachedProfile(data);
    } catch (err) {
      console.warn('Error fetching profile (will keep cached role if available):', err);
      const cached = readCachedProfile(userId);
      if (cached) {
        setProfile(cached);
        return;
      }
      // No cache to fall back to — keep profile null so UI can decide.
      setProfile(null);
    }
  };

  // 인증 상태 확인 (한 번만 실행)
  useEffect(() => {
    if (initialCheckDone.current) return;
    initialCheckDone.current = true;

    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await withTimeout(supabase.auth.getSession(), SESSION_TIMEOUT_MS);
        
        if (!session) {
          setUser(null);
          setProfile(null);
          setIsLoading(false);
          setAuthCheckStatus('ready');
          return;
        }
        
        setUser(session.user);
        const email = session.user.email || '';

        // Use cached role immediately to prevent flicker on slow networks.
        const cached = readCachedProfile(session.user.id);
        if (cached) {
          setProfile(cached);
        }

        // Do not block UI on profile fetch (network can be slow).
        setIsLoading(false);
        setAuthCheckStatus('ready');
        void fetchProfile(session.user.id, email);
      } catch (err) {
        console.warn('Auth check error:', err);
        // Don't force logout on transient auth timeouts. Let UI offer retry.
        setAuthCheckStatus('degraded');
        setIsLoading(false);
      }
    };

    checkAuth();

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setProfile(null);
        setAuthCheckStatus('ready');
      } else if (event === 'SIGNED_IN' && session) {
        setUser(session.user);
        const email = session.user.email || '';
        const cached = readCachedProfile(session.user.id);
        if (cached) setProfile(cached);
        await fetchProfile(session.user.id, email);
        setAuthCheckStatus('ready');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 로그아웃
  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const retryAuth = async () => {
    setIsLoading(true);
    setAuthCheckStatus('loading');
    try {
      const {
        data: { session },
      } = await withTimeout(supabase.auth.getSession(), SESSION_TIMEOUT_MS);

      if (!session) {
        setUser(null);
        setProfile(null);
        setAuthCheckStatus('ready');
        return;
      }

      setUser(session.user);
      const email = session.user.email || '';
      const cached = readCachedProfile(session.user.id);
      if (cached) setProfile(cached);
      setAuthCheckStatus('ready');
      // Allow UI to render immediately; fetch profile in background.
      void fetchProfile(session.user.id, email);
    } catch (err) {
      console.warn('Auth retry error:', err);
      setAuthCheckStatus('degraded');
    } finally {
      setIsLoading(false);
    }
  };

  // 프로필 다시 가져오기
  const refetchProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user.email || '');
    }
  };

  const role = profile?.role || null;

  return {
    user,
    profile,
    role,
    isAdmin: role === 'admin',
    isStaff: role === 'staff',
    isLoading,
    isAuthenticated: !!user,
    authCheckStatus,
    logout,
    retryAuth,
    refetchProfile,
  };
}

// 권한 체크 유틸리티 함수
export function hasAccess(userRole: UserRole | null, requiredRole: UserRole): boolean {
  if (!userRole) return false;
  
  // admin은 모든 권한 보유
  if (userRole === 'admin') return true;
  
  // staff는 staff 권한만 보유
  if (userRole === 'staff' && requiredRole === 'staff') return true;
  
  return false;
}
