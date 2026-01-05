'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, REVIEW_GRADE_OPTIONS } from '@/lib/supabase';
import AdminLayout from '@/components/AdminLayout';

export default function NewReviewPage() {
  const router = useRouter();
  const [grade, setGrade] = useState('');
  const [courseName, setCourseName] = useState('');
  const [content, setContent] = useState('');
  const [achievement, setAchievement] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!grade) {
      alert('학년을 선택해주세요.');
      return;
    }

    if (!courseName.trim()) {
      alert('수강 과정을 입력해주세요.');
      return;
    }

    if (!content.trim()) {
      alert('후기 내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          grade,
          course_name: courseName.trim(),
          content: content.trim(),
          achievement: achievement.trim() || null,
          display_order: displayOrder,
          is_visible: true,
        });

      if (error) throw error;

      alert('수강후기가 등록되었습니다!');
      router.push('/admin/reviews');
    } catch (err) {
      console.error('Error creating review:', err);
      alert('등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <Link
            href="/admin/reviews"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-violet-600 mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            목록으로
          </Link>
          <h2 className="text-2xl font-bold text-slate-800">⭐ 새 수강후기 등록</h2>
          <p className="text-slate-500 mt-1">학생 후기 정보를 입력하면 예쁜 카드로 자동 생성됩니다</p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-violet-100 shadow-sm p-6 space-y-6">
          {/* 학년 선택 */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              학년 <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {REVIEW_GRADE_OPTIONS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGrade(g)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    grade === g
                      ? 'bg-violet-500 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-violet-100'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* 수강 과정 */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              수강 과정 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="예: 내신 문법반, 중등 올톡보카"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-all"
              disabled={isSubmitting}
            />
          </div>

          {/* 후기 내용 */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              후기 내용 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="학생의 솔직한 후기를 입력해주세요..."
              rows={5}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-all resize-none"
              disabled={isSubmitting}
            />
            <p className="text-xs text-slate-400 mt-1">자연스럽게 작성해주세요</p>
          </div>

          {/* 성과 (선택) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              성과 <span className="text-slate-400 font-normal">(선택)</span>
            </label>
            <input
              type="text"
              value={achievement}
              onChange={(e) => setAchievement(e.target.value)}
              placeholder="예: 중간고사 100점!, 전교 3등!, 수능 영어 1등급"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-all"
              disabled={isSubmitting}
            />
            <p className="text-xs text-slate-400 mt-1">입력하면 카드에 특별히 강조됩니다</p>
          </div>

          {/* 표시 순서 */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              표시 순서
            </label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
              min="0"
              className="w-32 px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-all"
              disabled={isSubmitting}
            />
            <p className="text-xs text-slate-500 mt-1">숫자가 작을수록 먼저 표시됩니다</p>
          </div>

          {/* 미리보기 */}
          {(grade || courseName || content) && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                📱 카드 미리보기
              </label>
              <div className="bg-gradient-to-br from-violet-100/50 via-purple-50/30 to-pink-100/50 p-6 rounded-2xl">
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/50">
                  {/* 따옴표 아이콘 */}
                  <div className="text-4xl text-violet-300 mb-3">❝</div>
                  
                  {/* 후기 내용 */}
                  <p className="text-slate-700 text-lg leading-relaxed mb-5">
                    {content || '후기 내용이 여기에 표시됩니다...'}
                  </p>
                  
                  {/* 학년 & 과정 */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-100/80 text-violet-700 rounded-full text-sm font-medium">
                      🎓 {grade || '학년'}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-600 font-medium">
                      {courseName || '수강 과정'}
                    </span>
                  </div>
                  
                  {/* 성과 */}
                  {achievement && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl">
                      <span className="text-lg">🏆</span>
                      <span className="text-amber-700 font-semibold">{achievement}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <Link
              href="/admin/reviews"
              className="flex-1 py-3 text-center border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              {isSubmitting ? '등록 중...' : '등록하기'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
