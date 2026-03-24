'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase, Student, STATUS_LABELS, getGradeShortLabel } from '@/lib/supabase';
import AdminLayout from '@/components/AdminLayout';
import { formatDateTimeShort } from '@/lib/utils';

export default function AdminPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string>('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);

  const getAccessToken = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  };

  const fetchStudents = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    if (!silent) {
      setIsLoading(true);
    }
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error('인증이 필요합니다.');
      }

      const [studentsRes, { data: courseData, error: courseError }] = await Promise.all([
        fetch('/api/students', {
          cache: 'no-store',
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        supabase
          .from('courses')
          .select('id, title')
          .order('created_at', { ascending: false }),
      ]);

      if (courseError) throw courseError;
      const studentsData = await studentsRes.json();
      if (!studentsRes.ok) {
        throw new Error(studentsData?.error || '학생 목록을 불러오지 못했습니다.');
      }

      const consultationStudents = (studentsData || []).filter(
        (student: any) => student.is_consultation !== false
      );

      setStudents(consultationStudents);
      setCourses(courseData || []);
      setFetchError('');
    } catch (err) {
      console.error('Error fetching students:', err);
      const message =
        err instanceof Error ? err.message : '상담 신청 목록을 불러오지 못했습니다.';
      setFetchError(message);
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    const pollInterval = setInterval(() => {
      void fetchStudents({ silent: true });
    }, 15000);

    const refreshOnFocus = () => {
      void fetchStudents({ silent: true });
    };

    const refreshOnVisible = () => {
      if (document.visibilityState === 'visible') {
        void fetchStudents({ silent: true });
      }
    };

    window.addEventListener('focus', refreshOnFocus);
    document.addEventListener('visibilitychange', refreshOnVisible);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('focus', refreshOnFocus);
      document.removeEventListener('visibilitychange', refreshOnVisible);
    };
  }, [fetchStudents]);

  const updateStudent = async (id: string, field: 'status' | 'memo', value: string) => {
    setSavingId(id);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error('인증이 필요합니다.');
      }

      const res = await fetch(`/api/students/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [field]: value }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || '저장 중 오류가 발생했습니다.');
      }

      setStudents(prev =>
        prev.map(s => (s.id === id ? { ...s, [field]: value } : s))
      );
    } catch (err) {
      console.error('Error updating student:', err);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSavingId(null);
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('인증이 필요합니다.');
      }

      const res = await fetch(`/api/students/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || '삭제 중 오류가 발생했습니다.');
      }

      setStudents(prev => prev.filter(s => s.id !== id));
      setDeleteTarget(null);
    } catch (err) {
      console.error('Error deleting student:', err);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const getInterestCourses = (courseIds?: string[] | null) => {
    if (!courseIds?.length) return '-';
    const titles = courseIds
      .map((id) => courses.find((course) => course.id === id)?.title)
      .filter(Boolean) as string[];
    return titles.length ? titles.join(', ') : '-';
  };


  const getStatusColor = (status: Student['status']) => {
    switch (status) {
      case 'new':
        return 'bg-violet-100 text-violet-700 border-violet-200';
      case 'payment_requested':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'paid':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'completed':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getStatusDotColor = (status: Student['status']) => {
    switch (status) {
      case 'new':
        return 'bg-violet-400';
      case 'payment_requested':
        return 'bg-amber-400';
      case 'paid':
        return 'bg-emerald-400';
      case 'completed':
        return 'bg-slate-400';
      default:
        return 'bg-slate-400';
    }
  };

  return (
    <AdminLayout>
      {/* 새로고침 버튼 */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            void fetchStudents();
          }}
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2.5 text-base font-medium text-white bg-gradient-to-r from-violet-400 to-purple-400 hover:from-violet-500 hover:to-purple-500 rounded-lg transition-all shadow-md shadow-violet-200 disabled:opacity-50"
        >
          <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="hidden sm:inline">새로고침</span>
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {(['new', 'payment_requested', 'paid', 'completed'] as const).map(status => {
          const count = students.filter(s => s.status === status).length;
          return (
            <div 
              key={status} 
              className="bg-white rounded-xl p-4 border border-violet-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2.5 h-2.5 rounded-full ${getStatusDotColor(status)}`}></span>
                <p className="text-xs font-medium text-slate-500">{STATUS_LABELS[status]}</p>
              </div>
              <p className="text-3xl font-bold text-slate-800">{count}</p>
            </div>
          );
        })}
      </div>

      {fetchError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {fetchError}
        </div>
      )}

      {/* 테이블 */}
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
        ) : students.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-slate-600 font-medium mb-1">아직 신청이 없습니다</p>
            <p className="text-slate-400 text-sm">새로운 신청이 들어오면 여기에 표시됩니다</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    학생 이름
                  </th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    학년
                  </th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    학부모 연락처
                  </th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    관심 수업
                  </th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    신청일
                  </th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    관리자 메모
                  </th>
                  <th className="text-center py-3.5 px-5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    삭제
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map(student => (
                  <tr 
                    key={student.id} 
                    className={`transition-colors ${
                      savingId === student.id 
                        ? 'bg-violet-50' 
                        : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-4 px-5">
                      <span className="font-semibold text-slate-800">
                        {student.student_name}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span className="inline-flex items-center px-2.5 py-1 bg-violet-100 text-violet-700 text-sm font-medium rounded-lg">
                        {getGradeShortLabel(student.grade)}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <a 
                        href={`tel:${student.parent_phone}`}
                        className="text-violet-600 hover:text-violet-700 hover:underline font-medium"
                      >
                        {student.parent_phone}
                      </a>
                    </td>
                    <td className="py-4 px-5 text-sm text-slate-600">
                      {getInterestCourses((student as any).interest_course_ids)}
                    </td>
                    <td className="py-4 px-5 text-sm text-slate-500 font-mono">
                      {formatDateTimeShort(student.created_at)}
                    </td>
                    <td className="py-4 px-5">
                      <select
                        value={student.status}
                        onChange={(e) => updateStudent(student.id, 'status', e.target.value)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg border cursor-pointer focus:ring-2 focus:ring-violet-300 focus:ring-offset-1 transition-colors ${getStatusColor(student.status)}`}
                        disabled={savingId === student.id}
                      >
                        <option value="new">신규</option>
                        <option value="payment_requested">결제요청</option>
                        <option value="paid">결제완료</option>
                        <option value="completed">처리완료</option>
                      </select>
                    </td>
                    <td className="py-4 px-5">
                      <input
                        type="text"
                        value={student.memo || ''}
                        onChange={(e) => {
                          const newMemo = e.target.value;
                          setStudents(prev =>
                            prev.map(s => (s.id === student.id ? { ...s, memo: newMemo } : s))
                          );
                        }}
                        onBlur={(e) => {
                          updateStudent(student.id, 'memo', e.target.value);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            updateStudent(student.id, 'memo', e.currentTarget.value);
                            e.currentTarget.blur();
                          }
                        }}
                        placeholder="메모 입력 후 엔터..."
                        className="w-full min-w-[220px] px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-300 focus:border-violet-300 transition-all placeholder:text-slate-400"
                        disabled={savingId === student.id}
                      />
                    </td>
                    <td className="py-4 px-5 text-center">
                      <button
                        onClick={() => setDeleteTarget(student)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="삭제"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 범례 */}
      <div className="mt-6 p-4 bg-white rounded-xl border border-violet-100">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">상태 안내</p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-violet-400"></span>
            <span><strong className="font-medium">신규</strong> — 학부모가 방금 신청</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400"></span>
            <span><strong className="font-medium">결제요청</strong> — 청구서 발송 완료</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
            <span><strong className="font-medium">결제완료</strong> — 결제 확인됨</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-400"></span>
            <span><strong className="font-medium">처리완료</strong> — 모든 처리 완료</span>
          </div>
        </div>
      </div>

      {/* 총 건수 */}
      <div className="mt-4 text-right text-sm text-slate-500">
        총 <strong className="text-slate-700">{students.length}</strong>건의 신청
      </div>

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
                신청을 삭제하시겠습니까?
              </h3>
              <p className="text-slate-600 text-sm mb-6">
                <strong className="text-slate-800">{deleteTarget.student_name}</strong> 학생의 신청 정보가<br />
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
                  onClick={() => deleteStudent(deleteTarget.id)}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
