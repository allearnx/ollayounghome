'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { supabase, Course, Teacher, CATEGORY_LABELS, CourseCategory } from '@/lib/supabase';
import AdminLayout from '@/components/AdminLayout';
import { formatPrice } from '@/lib/utils';

interface CourseWithTeacher extends Course {
  teachers: Teacher | null;
  is_active: boolean;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseWithTeacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<CourseWithTeacher | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory | 'all'>('all');
  const [hasPayments, setHasPayments] = useState<boolean | null>(null);
  const [isCheckingPayments, setIsCheckingPayments] = useState(false);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`*, teachers (*)`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // 삭제 버튼 클릭 시: 결제 이력 확인 후 모달 열기
  const openDeleteModal = async (course: CourseWithTeacher) => {
    setDeleteTarget(course);
    setHasPayments(null);
    setIsCheckingPayments(true);

    try {
      const [pgResult, manualResult] = await Promise.all([
        supabase.from('payments').select('id', { count: 'exact', head: true }).eq('course_id', course.id),
        supabase.from('manual_payments').select('id', { count: 'exact', head: true }).eq('course_id', course.id),
      ]);
      const total = (pgResult.count ?? 0) + (manualResult.count ?? 0);
      setHasPayments(total > 0);
    } catch (err) {
      console.error('Error checking payments:', err);
      setHasPayments(false);
    } finally {
      setIsCheckingPayments(false);
    }
  };

  // 삭제 또는 비활성화 실행
  const handleDeleteOrDeactivate = async () => {
    if (!deleteTarget) return;

    try {
      if (hasPayments) {
        // 결제 이력 있음 → 비활성화
        const { error } = await supabase
          .from('courses')
          .update({ is_active: false })
          .eq('id', deleteTarget.id);
        if (error) throw error;
        setCourses(prev => prev.map(c => c.id === deleteTarget.id ? { ...c, is_active: false } : c));
        alert(`"${deleteTarget.title}" 강의가 비활성화되었습니다.\n결제 이력이 보존되며, 공개 페이지에서만 숨겨집니다.`);
      } else {
        // 결제 이력 없음 → 완전 삭제
        const { error } = await supabase
          .from('courses')
          .delete()
          .eq('id', deleteTarget.id);
        if (error) throw error;
        setCourses(prev => prev.filter(c => c.id !== deleteTarget.id));
      }
      setDeleteTarget(null);
    } catch (err) {
      console.error('Error deleting/deactivating course:', err);
      alert('처리 중 오류가 발생했습니다.');
    }
  };

  // 재활성화
  const reactivateCourse = async (course: CourseWithTeacher) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({ is_active: true })
        .eq('id', course.id);
      if (error) throw error;
      setCourses(prev => prev.map(c => c.id === course.id ? { ...c, is_active: true } : c));
    } catch (err) {
      console.error('Error reactivating course:', err);
      alert('재활성화 중 오류가 발생했습니다.');
    }
  };

  const getCategoryColor = (category: CourseCategory) => {
    switch (category) {
      case 'grammar': return 'bg-violet-100 text-violet-700';
      case 'school_exam': return 'bg-emerald-100 text-emerald-700';
      case 'international': return 'bg-sky-100 text-sky-700';
      case 'voca': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const filteredCourses = selectedCategory === 'all'
    ? courses
    : courses.filter(c => c.category === selectedCategory);

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">강의 목록</h2>
        <Link
          href="/backoffice/courses/new"
          className="flex items-center gap-2 px-5 py-2.5 text-base font-medium text-white bg-gradient-to-r from-violet-400 to-purple-400 hover:from-violet-500 hover:to-purple-500 rounded-lg transition-all shadow-md shadow-violet-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          새 강의 등록
        </Link>
      </div>

      {/* 카테고리 필터 */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`rounded-xl p-4 border transition-all text-left ${
            selectedCategory === 'all'
              ? 'bg-violet-500 border-violet-500 shadow-lg shadow-violet-200'
              : 'bg-white border-violet-100 hover:border-violet-300 shadow-sm'
          }`}
        >
          <p className={`text-xs font-medium mb-1 ${selectedCategory === 'all' ? 'text-violet-200' : 'text-slate-500'}`}>전체</p>
          <p className={`text-2xl font-bold ${selectedCategory === 'all' ? 'text-white' : 'text-slate-800'}`}>{courses.length}</p>
        </button>
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
          const count = courses.filter(c => c.category === key).length;
          const isSelected = selectedCategory === key;
          return (
            <button
              key={key}
              onClick={() => setSelectedCategory(key as CourseCategory)}
              className={`rounded-xl p-4 border transition-all text-left ${
                isSelected
                  ? 'bg-violet-500 border-violet-500 shadow-lg shadow-violet-200'
                  : 'bg-white border-violet-100 hover:border-violet-300 shadow-sm'
              }`}
            >
              <p className={`text-xs font-medium mb-1 ${isSelected ? 'text-violet-200' : 'text-slate-500'}`}>{label}</p>
              <p className={`text-2xl font-bold ${isSelected ? 'text-white' : 'text-slate-800'}`}>{count}</p>
            </button>
          );
        })}
      </div>

      {/* 강의 목록 */}
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
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-100 rounded-full mb-4">
              <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-slate-600 font-medium mb-1">
              {selectedCategory === 'all' ? '등록된 강의가 없습니다' : `${CATEGORY_LABELS[selectedCategory]} 강의가 없습니다`}
            </p>
            <p className="text-slate-400 text-sm mb-4">새 강의를 등록해주세요</p>
            <Link
              href="/backoffice/courses/new"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-400 to-purple-400 hover:from-violet-500 hover:to-purple-500 rounded-lg transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              새 강의 등록
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">강의명</th>
                  <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">카테고리</th>
                  <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">선생님</th>
                  <th className="text-right py-2.5 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">수강료</th>
                  <th className="text-center py-2.5 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">상태</th>
                  <th className="text-center py-2.5 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCourses.map(course => (
                  <tr
                    key={course.id}
                    className={`transition-colors ${course.is_active === false ? 'bg-slate-50 opacity-60' : 'bg-white hover:bg-slate-50'}`}
                  >
                    <td className="py-2.5 px-4">
                      <p className={`font-medium truncate max-w-[200px] ${course.is_active === false ? 'text-slate-400' : 'text-slate-800'}`}>
                        {course.title}
                      </p>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md ${getCategoryColor(course.category)}`}>
                        {CATEGORY_LABELS[course.category]}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-sm text-slate-600">
                      {course.teachers?.name || '-'}
                    </td>
                    <td className="py-2.5 px-4 text-right text-sm font-medium text-slate-800">
                      {formatPrice(course.price)}원
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      {course.is_active === false ? (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-500 rounded-full">
                          비활성
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
                          활성
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center justify-center gap-1">
                        {course.is_active !== false && (
                          <Link
                            href={`/backoffice/courses/${course.id}/edit`}
                            className="p-1.5 text-slate-400 hover:text-violet-500 hover:bg-violet-50 rounded-md transition-colors"
                            title="수정"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                        )}
                        {course.is_active === false ? (
                          <button
                            onClick={() => reactivateCourse(course)}
                            className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-md transition-colors"
                            title="재활성화"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                        ) : (
                          <button
                            onClick={() => openDeleteModal(course)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                            title="삭제/비활성화"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4 text-right text-sm text-slate-500">
        {selectedCategory === 'all' ? (
          <>총 <strong className="text-slate-700">{courses.length}</strong>개의 강의</>
        ) : (
          <>{CATEGORY_LABELS[selectedCategory]} <strong className="text-slate-700">{filteredCourses.length}</strong>개 (전체 {courses.length}개)</>
        )}
      </div>

      {/* 삭제/비활성화 확인 모달 */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center">
              {isCheckingPayments ? (
                <>
                  <svg className="animate-spin h-10 w-10 text-violet-400 mx-auto mb-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <p className="text-slate-500 text-sm">결제 이력 확인 중...</p>
                </>
              ) : hasPayments ? (
                <>
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-100 rounded-full mb-4">
                    <svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">결제 이력이 있는 강의입니다</h3>
                  <p className="text-slate-600 text-sm mb-1">
                    <strong className="text-slate-800">{deleteTarget.title}</strong>
                  </p>
                  <p className="text-slate-500 text-sm mb-6">
                    결제 기록 보존을 위해 삭제 대신 <strong className="text-amber-600">비활성화</strong>됩니다.<br />
                    공개 페이지에서 숨겨지지만 매출 리포트는 유지됩니다.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setDeleteTarget(null)}
                      className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleDeleteOrDeactivate}
                      className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors"
                    >
                      비활성화
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-red-100 rounded-full mb-4">
                    <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">강의를 삭제하시겠습니까?</h3>
                  <p className="text-slate-600 text-sm mb-6">
                    <strong className="text-slate-800">{deleteTarget.title}</strong> 강의가<br />
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
                      onClick={handleDeleteOrDeactivate}
                      className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
