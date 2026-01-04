'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase, Teacher } from '@/lib/supabase';

export default function TeachersAdminPage() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Teacher | null>(null);

  // 인증 확인
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setAuthLoading(false);
    };
    checkAuth();
  }, [router]);

  // 선생님 목록 불러오기
  const fetchTeachers = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeachers(data || []);
    } catch (err) {
      console.error('Error fetching teachers:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      fetchTeachers();
    }
  }, [authLoading, fetchTeachers]);

  // 선생님 삭제
  const deleteTeacher = async (id: string) => {
    try {
      const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTeachers(prev => prev.filter(t => t.id !== id));
      setDeleteTarget(null);
    } catch (err) {
      console.error('Error deleting teacher:', err);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  if (authLoading) {
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

  return (
    <div className="min-h-screen bg-violet-50/30">
      {/* 헤더 */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-violet-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <a href="/admin">
                <Image
                  src="/logo.png"
                  alt="올라영"
                  width={180}
                  height={60}
                  className="h-16 w-auto"
                />
              </a>
              <div className="hidden sm:block h-8 w-px bg-slate-200"></div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold text-slate-800">선생님 관리</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/"
                className="flex items-center gap-2 px-5 py-2.5 text-base font-medium text-slate-600 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="hidden sm:inline">메인으로</span>
              </a>
              <a
                href="/admin/teachers/new"
                className="flex items-center gap-2 px-5 py-2.5 text-base font-medium text-white bg-gradient-to-r from-violet-400 to-purple-400 hover:from-violet-500 hover:to-purple-500 rounded-lg transition-all shadow-md shadow-violet-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                새 선생님 등록
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* 관리 메뉴 탭 */}
      <div className="bg-white border-b border-violet-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex gap-2">
            <a
              href="/admin"
              className="px-5 py-4 text-lg font-medium text-slate-500 hover:text-violet-600 border-b-2 border-transparent hover:border-violet-300 transition-colors"
            >
              📋 상담 신청
            </a>
            <a
              href="/admin/courses"
              className="px-5 py-4 text-lg font-medium text-slate-500 hover:text-violet-600 border-b-2 border-transparent hover:border-violet-300 transition-colors"
            >
              📚 강의 관리
            </a>
            <a
              href="/admin/teachers"
              className="px-5 py-4 text-lg font-semibold text-violet-600 border-b-2 border-violet-500"
            >
              👩‍🏫 선생님 관리
            </a>
          </nav>
        </div>
      </div>

      {/* 메인 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* 선생님 목록 */}
        <div className="bg-white rounded-xl border border-violet-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <svg className="animate-spin h-10 w-10 text-violet-400 mx-auto mb-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-slate-500 text-sm">데이터를 불러오는 중...</p>
              </div>
            </div>
          ) : teachers.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-slate-600 font-medium mb-1">등록된 선생님이 없습니다</p>
              <p className="text-slate-400 text-sm mb-4">새 선생님을 등록해주세요</p>
              <a
                href="/admin/teachers/new"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-400 to-purple-400 hover:from-violet-500 hover:to-purple-500 rounded-lg transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                새 선생님 등록
              </a>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {teachers.map(teacher => (
                <div key={teacher.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                  {/* 프로필 이미지 */}
                  <div className="aspect-square bg-gradient-to-br from-violet-100 to-purple-100 relative">
                    {teacher.image_url ? (
                      <img 
                        src={teacher.image_url} 
                        alt={teacher.name}
                        className="w-full h-full object-cover"
                        style={{ objectPosition: teacher.image_position || 'center' }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-24 h-24 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {/* 정보 */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-slate-800">{teacher.name}</h3>
                    {teacher.bio && (
                      <p className="text-sm text-slate-500 mt-2 line-clamp-2">{teacher.bio}</p>
                    )}
                    
                    {/* 버튼 */}
                    <div className="mt-4 flex gap-2">
                      <a
                        href={`/admin/teachers/${teacher.id}/edit`}
                        className="flex-1 py-2 text-center text-sm font-medium text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-lg transition-colors"
                      >
                        수정
                      </a>
                      <button
                        onClick={() => setDeleteTarget(teacher)}
                        className="flex-1 py-2 text-center text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 text-right text-sm text-slate-500">
          총 <strong className="text-slate-700">{teachers.length}</strong>명의 선생님
        </div>
      </main>

      {/* 삭제 확인 모달 */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-red-100 rounded-full mb-4">
                <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                선생님을 삭제하시겠습니까?
              </h3>
              <p className="text-slate-600 text-sm mb-6">
                <strong className="text-slate-800">{deleteTarget.name}</strong> 선생님 정보가<br />
                영구적으로 삭제됩니다.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={() => deleteTeacher(deleteTarget.id)}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

