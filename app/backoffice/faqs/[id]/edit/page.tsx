'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { FAQ_CATEGORY_LABELS, FAQCategory } from '@/lib/supabase';
import AdminLayout from '@/components/AdminLayout';
import { adminFetch } from '@/lib/adminApi.client';

export default function EditFAQPage() {
  const router = useRouter();
  const params = useParams();
  const faqId = params.id as string;

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState<FAQCategory>('general');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadFAQ = async () => {
      try {
        const response = await adminFetch(`/api/admin/faqs/${faqId}`, { cache: 'no-store' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'FAQ를 불러오는데 실패했습니다.');
        const faq = data.faq;
        setQuestion(faq.question ?? '');
        setAnswer(faq.answer ?? '');
        setCategory((faq.category ?? 'general') as FAQCategory);
        setDisplayOrder(faq.display_order ?? 0);
        setIsVisible(Boolean(faq.is_visible));
      } catch (error) {
        alert(error instanceof Error ? error.message : 'FAQ를 불러오는데 실패했습니다.');
        router.push('/backoffice/faqs');
      } finally {
        setIsLoading(false);
      }
    };

    if (faqId) void loadFAQ();
  }, [faqId, router]);

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
      const response = await adminFetch(`/api/admin/faqs/${faqId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim(),
          answer: answer.trim(),
          category,
          display_order: displayOrder,
          is_visible: isVisible,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '수정에 실패했습니다.');

      alert('FAQ가 수정되었습니다.');
      router.push('/backoffice/faqs');
    } catch (error) {
      alert(error instanceof Error ? error.message : '수정 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="py-20 text-center text-slate-500">불러오는 중...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/backoffice/faqs" className="inline-flex items-center gap-2 text-slate-500 hover:text-violet-600 mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            목록으로
          </Link>
          <h2 className="text-2xl font-bold text-slate-800">FAQ 수정</h2>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-violet-100 shadow-sm p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">카테고리</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as FAQCategory)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
              disabled={isSubmitting}
            >
              {(Object.entries(FAQ_CATEGORY_LABELS) as [FAQCategory, string][]).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">질문</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">답변</label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl resize-none"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="block text-sm font-semibold text-slate-700">표시 순서</label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
              className="w-28 px-3 py-2 border border-slate-200 rounded-lg"
              disabled={isSubmitting}
            />
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={isVisible}
                onChange={(e) => setIsVisible(e.target.checked)}
                disabled={isSubmitting}
              />
              노출
            </label>
          </div>

          <div className="flex gap-3">
            <Link href="/backoffice/faqs" className="flex-1 py-3 text-center border-2 border-slate-200 text-slate-700 rounded-xl">
              취소
            </Link>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-violet-600 text-white rounded-xl disabled:opacity-50">
              {isSubmitting ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
