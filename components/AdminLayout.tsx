'use client';

import { useEffect, useState, ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase, ROLE_LABELS } from '@/lib/supabase';

interface AdminLayoutProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'staff'; // 페이지 접근에 필요한 최소 역할
}

// 메뉴 아이템 타입
interface MenuItem {
  href: string;
  label: string;
  icon: ReactNode;
  adminOnly?: boolean; // true면 admin만 볼 수 있음
}

// 공통 메뉴 (모든 사용자)
const commonMenuItems: MenuItem[] = [
  {
    href: '/backoffice',
    label: '상담 신청',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    href: '/backoffice/courses',
    label: '강의 관리',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    href: '/backoffice/teachers',
    label: '선생님 관리',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    href: '/backoffice/reviews',
    label: '수강후기',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    href: '/backoffice/faqs',
    label: 'FAQ',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

// Admin 전용 메뉴 (결제/매출 관련)
const adminOnlyMenuItems: MenuItem[] = [
  {
    href: '/backoffice/payments',
    label: '결제 관리',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    adminOnly: true,
  },
  {
    href: '/backoffice/revenue',
    label: '수납 현황',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    adminOnly: true,
  },
  {
    href: '/backoffice/reports',
    label: '매출 리포트',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    adminOnly: true,
  },
];

export default function AdminLayout({ children, requiredRole = 'staff' }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, role, isAdmin, isLoading, authCheckStatus, logout, retryAuth, refetchProfile } = useUserRole();
  
  // 비밀번호 변경 모달 상태
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // 인증 및 권한 확인
  useEffect(() => {
    if (!isLoading) {
      // 로그인하지 않은 경우
      if (!user && authCheckStatus !== 'degraded') {
        router.push('/login');
        return;
      }

      // 권한이 아직 확인되지 않은 경우: 리다이렉트하지 말고 대기
      if (requiredRole === 'admin' && role === null) {
        return;
      }

      // 권한이 없는 경우 (admin 페이지에 staff가 접근하려 할 때)
      if (requiredRole === 'admin' && role !== 'admin') {
        alert('권한이 없습니다. 관리자만 접근할 수 있는 페이지입니다.');
        router.push('/backoffice');
        return;
      }
    }
  }, [isLoading, user, role, isAdmin, requiredRole, router]);

  // 현재 메뉴가 활성화되어 있는지 확인
  const isActiveMenu = (href: string) => {
    if (href === '/backoffice') {
      return pathname === '/backoffice';
    }
    return pathname.startsWith(href);
  };

  // 비밀번호 변경 핸들러
  const handleChangePassword = async () => {
    setPasswordError('');
    
    // 유효성 검사
    if (newPassword.length < 6) {
      setPasswordError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsChangingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        setPasswordError(error.message);
        return;
      }

      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      
      // 2초 후 모달 닫기
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Password change error:', err);
      setPasswordError('비밀번호 변경 중 오류가 발생했습니다.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // 모달 닫기
  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordSuccess(false);
  };

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="min-h-screen bg-violet-50/30 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-violet-500 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-slate-600">인증 확인 중...</p>
        </div>
      </div>
    );
  }

  // 인증되지 않은 경우 (리다이렉트 중)
  if (!user && authCheckStatus === 'degraded') {
    return (
      <div className="min-h-screen bg-violet-50/30 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-violet-100 shadow-sm p-6 text-center">
          <p className="text-slate-800 font-bold text-lg">인증 확인이 지연되고 있어요</p>
          <p className="text-slate-500 text-sm mt-1">
            네트워크가 느리거나 Supabase 응답이 지연될 때 발생할 수 있습니다.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={retryAuth}
              className="px-4 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
            >
              다시 시도
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // 세션은 있는데 role을 못 불러온 경우(네트워크 지연/일시 오류)
  if (requiredRole === 'admin' && role === null) {
    return (
      <div className="min-h-screen bg-violet-50/30 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-violet-100 shadow-sm p-6 text-center">
          <svg className="animate-spin h-10 w-10 text-violet-500 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-slate-700 font-semibold">권한 확인 중...</p>
          <p className="text-slate-500 text-sm mt-1">
            네트워크가 느리면 잠시 걸릴 수 있어요. 계속되면 다시 시도하세요.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={refetchProfile}
              className="px-4 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
            >
              다시 시도
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 모든 메뉴 아이템 (역할에 따라 필터링)
  const allMenuItems = [
    ...commonMenuItems,
    ...(isAdmin ? adminOnlyMenuItems : []),
  ];

  return (
    <div className="min-h-screen bg-violet-50/30">
      {/* 헤더 */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-violet-100 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <Link href="/">
                <Image
                  src="/logo.png"
                  alt="올라영"
                  width={180}
                  height={60}
                  className="h-16 w-auto"
                />
              </Link>
              <div className="hidden sm:block h-8 w-px bg-slate-200"></div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold text-slate-800">관리자 대시보드</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* 로그인 사용자 정보 + 역할 표시 */}
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-violet-50 rounded-lg">
                <div className="w-8 h-8 bg-violet-200 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-violet-700 max-w-[180px] truncate">
                    {user?.email}
                  </span>
                  <span className={`text-xs font-semibold ${isAdmin ? 'text-amber-600' : 'text-slate-500'}`}>
                    {role ? ROLE_LABELS[role] : 'Staff'}
                  </span>
                </div>
              </div>

              {/* 비밀번호 변경 버튼 */}
              <button
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                title="비밀번호 변경"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <span className="hidden lg:inline">비밀번호 변경</span>
              </button>
              
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="hidden sm:inline">메인으로</span>
              </Link>
              
              {/* 로그아웃 버튼 */}
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">로그아웃</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 관리 메뉴 탭 (사이드바 대신 상단 탭 사용) */}
      <div className="bg-white border-b border-violet-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex gap-2 overflow-x-auto">
            {allMenuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-5 py-4 text-lg font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActiveMenu(item.href)
                    ? 'text-violet-600 border-violet-500 font-semibold'
                    : 'text-slate-500 hover:text-violet-600 border-transparent hover:border-violet-300'
                }`}
              >
                {item.icon}
                {item.label}
                {item.adminOnly && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-700 rounded">
                    Admin
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>

      {/* 비밀번호 변경 모달 */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            {passwordSuccess ? (
              // 성공 메시지
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  비밀번호가 변경되었습니다!
                </h3>
                <p className="text-slate-500 text-sm">
                  다음 로그인부터 새 비밀번호를 사용하세요.
                </p>
              </div>
            ) : (
              // 비밀번호 입력 폼
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">비밀번호 변경</h3>
                    <p className="text-sm text-slate-500">새 비밀번호를 입력해주세요</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      새 비밀번호
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="6자 이상 입력"
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-all"
                      disabled={isChangingPassword}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      비밀번호 확인
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="비밀번호 다시 입력"
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-all"
                      disabled={isChangingPassword}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleChangePassword();
                        }
                      }}
                    />
                  </div>

                  {/* 에러 메시지 */}
                  {passwordError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-sm text-red-600 font-medium">{passwordError}</p>
                    </div>
                  )}

                  {/* 버튼 */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={closePasswordModal}
                      disabled={isChangingPassword}
                      className="flex-1 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleChangePassword}
                      disabled={isChangingPassword || !newPassword || !confirmPassword}
                      className="flex-1 py-3 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isChangingPassword ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          변경 중...
                        </span>
                      ) : (
                        '비밀번호 변경'
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// 페이지 접근 차단용 가드 컴포넌트
export function AdminOnlyGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAdmin, isLoading } = useUserRole();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      alert('권한이 없습니다. 관리자만 접근할 수 있는 페이지입니다.');
      router.push('/backoffice');
    }
  }, [isLoading, isAdmin, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-violet-400 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-slate-500 text-sm">권한 확인 중...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}
