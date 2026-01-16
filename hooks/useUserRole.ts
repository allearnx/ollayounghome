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
  logout: () => Promise<void>;
  refetchProfile: () => Promise<void>;
}

export function useUserRole(): UseUserRoleResult {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

  // 프로필 가져오기
  const fetchProfile = async (userId: string, userEmail: string) => {
    try {
      const { data, error } = await withTimeout(
        supabase.from('profiles').select('*').eq('id', userId).single(),
        7000
      );

      if (error) {
        // 프로필이 없으면 기본값으로 staff 설정
        console.warn('Profile not found, using default staff role');
        setProfile({
          id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          email: userEmail,
          role: 'staff',
        });
        return;
      }

      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      // 에러 발생 시에도 기본값 설정
      setProfile({
        id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email: userEmail,
        role: 'staff',
      });
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
        } = await withTimeout(supabase.auth.getSession(), 7000);
        
        if (!session) {
          setUser(null);
          setProfile(null);
          setIsLoading(false);
          return;
        }
        
        setUser(session.user);
        await fetchProfile(session.user.id, session.user.email || '');
        setIsLoading(false);
      } catch (err) {
        console.error('Auth check error:', err);
        setUser(null);
        setProfile(null);
        setIsLoading(false);
      }
    };

    checkAuth();

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setProfile(null);
      } else if (event === 'SIGNED_IN' && session) {
        setUser(session.user);
        await fetchProfile(session.user.id, session.user.email || '');
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
    logout,
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
