'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { supabase, Review } from '@/lib/supabase';
import AdminLayout from '@/components/AdminLayout';

export default function ReviewsAdminPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);

  // 수강후기 목록 불러오기
  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // 수강후기 삭제
  const deleteReview = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setReviews(prev => prev.filter(r => r.id !== id));
      setDeleteTarget(null);
    } catch (err) {
      console.error('Error deleting review:', err);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  // 노출 여부 토글
  const toggleVisibility = async (id: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_visible: !currentVisibility })
        .eq('id', id);

      if (error) throw error;

      setReviews(prev =>
        prev.map(r => (r.id === id ? { ...r, is_visible: !currentVisibility } : r))
      );
    } catch (err) {
      console.error('Error toggling visibility:', err);
      alert('상태 변경 중 오류가 발생했습니다.');
    }
  };

  return (
    <AdminLayout>
      {/* 헤더 액션 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">⭐ 수강후기 관리</h2>
          <p className="text-sm text-slate-500 mt-1">학생 후기를 입력하면 예쁜 카드로 자동 생성됩니다</p>
        </div>
        <Link
          href="/admin/reviews/new"
          className="flex items-center gap-2 px-5 py-2.5 text-base font-medium text-white bg-gradient-to-r from-violet-400 to-purple-400 hover:from-violet-500 hover:to-purple-500 rounded-lg transition-all shadow-md shadow-violet-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          새 후기 등록
        </Link>
      </div>

      {/* 수강후기 목록 */}
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
        ) : reviews.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <p className="text-slate-600 font-medium mb-1">등록된 수강후기가 없습니다</p>
            <p className="text-slate-400 text-sm mb-4">새 후기를 등록해주세요</p>
            <Link
              href="/admin/reviews/new"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-400 to-purple-400 hover:from-violet-500 hover:to-purple-500 rounded-lg transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              새 후기 등록
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {reviews.map(review => (
              <div 
                key={review.id} 
                className={`bg-white border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow ${
                  review.is_visible ? 'border-slate-200' : 'border-red-200 bg-red-50/30'
                }`}
              >
                {/* 카드 내용 - 글래스모피즘 미리보기 */}
                <div className="bg-gradient-to-br from-violet-100/50 via-purple-50/30 to-pink-100/50 p-4 relative">
                  {/* 비노출 배지 */}
                  {!review.is_visible && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded z-10">
                      비노출
                    </div>
                  )}
                  {/* 순서 배지 */}
                  <div className="absolute top-2 left-2 w-8 h-8 bg-violet-500 text-white text-sm font-bold rounded-full flex items-center justify-center z-10">
                    {review.display_order}
                  </div>

                  <div className="bg-white/70 backdrop-blur-lg rounded-xl p-4 border border-white/50 mt-6">
                    {/* 따옴표 */}
                    <div className="text-2xl text-violet-300 mb-2">❝</div>
                    
                    {/* 후기 내용 (2줄까지만) */}
                    <p className="text-slate-700 text-sm leading-relaxed line-clamp-2 mb-3">
                      {review.content}
                    </p>
                    
                    {/* 학년 & 과정 */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-1 bg-violet-100/80 text-violet-700 rounded-full font-medium">
                        🎓 {review.grade}
                      </span>
                      <span className="text-slate-500">{review.course_name}</span>
                    </div>
                    
                    {/* 성과 */}
                    {review.achievement && (
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-amber-50 border border-amber-200 rounded text-xs">
                        <span>🏆</span>
                        <span className="text-amber-700 font-medium">{review.achievement}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* 버튼 */}
                <div className="p-4 flex gap-2">
                  <button
                    onClick={() => toggleVisibility(review.id, review.is_visible)}
                    className={`flex-1 py-2 text-center text-sm font-medium rounded-lg transition-colors ${
                      review.is_visible
                        ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                        : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                    }`}
                  >
                    {review.is_visible ? '숨기기' : '노출하기'}
                  </button>
                  <Link
                    href={`/admin/reviews/${review.id}/edit`}
                    className="flex-1 py-2 text-center text-sm font-medium text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-lg transition-colors"
                  >
                    수정
                  </Link>
                  <button
                    onClick={() => setDeleteTarget(review)}
                    className="flex-1 py-2 text-center text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 text-right text-sm text-slate-500">
        총 <strong className="text-slate-700">{reviews.length}</strong>개의 수강후기
        {reviews.length > 0 && (
          <span className="ml-2">
            (노출: <strong className="text-emerald-600">{reviews.filter(r => r.is_visible).length}</strong>개)
          </span>
        )}
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
                후기를 삭제하시겠습니까?
              </h3>
              <p className="text-slate-600 text-sm mb-6">
                <strong className="text-slate-800">{deleteTarget.grade} · {deleteTarget.course_name}</strong> 후기가<br />
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
                  onClick={() => deleteReview(deleteTarget.id)}
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
