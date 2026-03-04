'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FAQ_CATEGORY_LABELS, FAQCategory } from '@/lib/supabase';
import AdminLayout from '@/components/AdminLayout';
import { adminFetch } from '@/lib/adminApi.client';

export default function NewFAQPage() {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState<FAQCategory>('general');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) {
      alert('질문을 입력해주세요.');
      return;
    }

    if (!answer.trim()) {
      alert('답변을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await adminFetch('/api/admin/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim(),
          answer: answer.trim(),
          category,
          display_order: displayOrder
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '등록에 실패했습니다.');

      alert('FAQ가 등록되었습니다!');
      router.push('/backoffice/faqs');
    } catch (err) {
      console.error('Error creating FAQ:', err);
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
            href="/backoffice/faqs"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-violet-600 mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            목록으로
          </Link>
          <h2 className="text-2xl font-bold text-slate-800">❓ 새 FAQ 등록</h2>
          <p className="text-slate-500 mt-1">자주 묻는 질문과 답변을 등록하세요</p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-violet-100 shadow-sm p-6 space-y-6">
          {/* 카테고리 */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              카테고리 <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as FAQCategory)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-all"
              disabled={isSubmitting}
            >
              {(Object.entries(FAQ_CATEGORY_LABELS) as [FAQCategory, string][]).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* 질문 */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              질문 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="예: 수업 시간은 어떻게 되나요?"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-all"
              disabled={isSubmitting}
            />
          </div>

          {/* 답변 */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              답변 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="질문에 대한 자세한 답변을 작성해주세요"
              rows={6}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-all resize-none"
              disabled={isSubmitting}
            />
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

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <Link
              href="/backoffice/faqs"
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



