'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { supabase, FAQ, FAQ_CATEGORY_LABELS, FAQCategory } from '@/lib/supabase';
import AdminLayout from '@/components/AdminLayout';

export default function FAQsAdminPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<FAQ | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // FAQ 목록 불러오기
  const fetchFAQs = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setFaqs(data || []);
    } catch (err) {
      console.error('Error fetching FAQs:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFAQs();
  }, [fetchFAQs]);

  // FAQ 삭제
  const deleteFAQ = async (id: string) => {
    try {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFaqs(prev => prev.filter(f => f.id !== id));
      setDeleteTarget(null);
    } catch (err) {
      console.error('Error deleting FAQ:', err);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  // 노출 여부 토글
  const toggleVisibility = async (id: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase
        .from('faqs')
        .update({ is_visible: !currentVisibility })
        .eq('id', id);

      if (error) throw error;

      setFaqs(prev =>
        prev.map(f => (f.id === id ? { ...f, is_visible: !currentVisibility } : f))
      );
    } catch (err) {
      console.error('Error toggling visibility:', err);
      alert('상태 변경 중 오류가 발생했습니다.');
    }
  };

  // 카테고리 색상
  const getCategoryColor = (category: FAQCategory) => {
    switch (category) {
      case 'general':
        return 'bg-slate-100 text-slate-700';
      case 'enrollment':
        return 'bg-violet-100 text-violet-700';
      case 'payment':
        return 'bg-emerald-100 text-emerald-700';
      case 'refund':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  // 필터링된 FAQ
  const filteredFAQs = filterCategory === 'all' 
    ? faqs 
    : faqs.filter(f => f.category === filterCategory);

  return (
    <AdminLayout>
      {/* 헤더 액션 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">❓ FAQ 관리</h2>
          <p className="text-sm text-slate-500 mt-1">자주 묻는 질문을 관리하세요</p>
        </div>
        <Link
          href="/backoffice/faqs/new"
          className="flex items-center gap-2 px-5 py-2.5 text-base font-medium text-white bg-gradient-to-r from-violet-400 to-purple-400 hover:from-violet-500 hover:to-purple-500 rounded-lg transition-all shadow-md shadow-violet-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          새 FAQ 등록
        </Link>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            filterCategory === 'all'
              ? 'bg-violet-500 text-white'
              : 'bg-white text-slate-600 hover:bg-violet-50 border border-slate-200'
          }`}
        >
          전체 ({faqs.length})
        </button>
        {(Object.entries(FAQ_CATEGORY_LABELS) as [FAQCategory, string][]).map(([key, label]) => {
          const count = faqs.filter(f => f.category === key).length;
          return (
            <button
              key={key}
              onClick={() => setFilterCategory(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filterCategory === key
                  ? 'bg-violet-500 text-white'
                  : 'bg-white text-slate-600 hover:bg-violet-50 border border-slate-200'
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* FAQ 목록 */}
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
        ) : filteredFAQs.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-slate-600 font-medium mb-1">등록된 FAQ가 없습니다</p>
            <p className="text-slate-400 text-sm mb-4">새 FAQ를 등록해주세요</p>
            <Link
              href="/backoffice/faqs/new"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-400 to-purple-400 hover:from-violet-500 hover:to-purple-500 rounded-lg transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              새 FAQ 등록
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredFAQs.map(faq => (
              <div 
                key={faq.id} 
                className={`p-5 hover:bg-slate-50 transition-colors ${
                  !faq.is_visible ? 'bg-red-50/30' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* 순서 */}
                  <div className="w-8 h-8 bg-violet-100 text-violet-600 text-sm font-bold rounded-full flex items-center justify-center flex-shrink-0">
                    {faq.display_order}
                  </div>
                  
                  {/* 내용 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${getCategoryColor(faq.category)}`}>
                        {FAQ_CATEGORY_LABELS[faq.category]}
                      </span>
                      {!faq.is_visible && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600 rounded">
                          비노출
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-1">Q. {faq.question}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2">A. {faq.answer}</p>
                  </div>
                  
                  {/* 액션 버튼 */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleVisibility(faq.id, faq.is_visible)}
                      className={`p-2 rounded-lg transition-colors ${
                        faq.is_visible
                          ? 'text-amber-500 hover:bg-amber-50'
                          : 'text-emerald-500 hover:bg-emerald-50'
                      }`}
                      title={faq.is_visible ? '숨기기' : '노출하기'}
                    >
                      {faq.is_visible ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                    <Link
                      href={`/backoffice/faqs/${faq.id}/edit`}
                      className="p-2 text-violet-500 hover:bg-violet-50 rounded-lg transition-colors"
                      title="수정"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => setDeleteTarget(faq)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="삭제"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 text-right text-sm text-slate-500">
        총 <strong className="text-slate-700">{faqs.length}</strong>개의 FAQ
        {faqs.length > 0 && (
          <span className="ml-2">
            (노출: <strong className="text-emerald-600">{faqs.filter(f => f.is_visible).length}</strong>개)
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
                FAQ를 삭제하시겠습니까?
              </h3>
              <p className="text-slate-600 text-sm mb-6">
                이 FAQ가 영구적으로 삭제됩니다.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={() => deleteFAQ(deleteTarget.id)}
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



