'use client';

import { useState, useEffect, useCallback } from 'react';
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

  // 프로필 가져오기
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // 프로필이 없으면 기본값으로 staff 설정
        console.warn('Profile not found, using default staff role');
        setProfile({
          id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          email: user?.email || '',
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
        email: user?.email || '',
        role: 'staff',
      });
    }
  }, [user?.email]);

  // 인증 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        return;
      }
      
      setUser(session.user);
      await fetchProfile(session.user.id);
      setIsLoading(false);
    };

    checkAuth();

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setProfile(null);
      } else {
        setUser(session.user);
        await fetchProfile(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // 로그아웃
  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // 프로필 다시 가져오기
  const refetchProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
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

