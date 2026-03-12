'use client';

import { useState } from 'react';
import PaymentWidget from '@/components/PaymentWidget';

// 올킬보카 DB 등록 후 여기에 courseId 입력
const ALLKILL_COURSE_ID = '5ff21cf6-1fce-4a4e-b674-d4f099ee3368';

export default function AllkillPayButton() {
  const [showModal, setShowModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const closeModal = () => {
    setShowModal(false);
    setOrderId(null);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setError(null);
  };

  const handleCreateOrder = async () => {
    setError(null);
    if (!customerName.trim()) { setError('이름을 입력해주세요.'); return; }
    if (!customerPhone.trim()) { setError('연락처를 입력해주세요.'); return; }
    if (!customerEmail.trim()) { setError('이메일을 입력해주세요.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) { setError('올바른 이메일 형식으로 입력해주세요.'); return; }

    setIsCreatingOrder(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: ALLKILL_COURSE_ID,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '주문 생성에 실패했습니다.');
      setOrderId(data.orderId);
    } catch (e) {
      setError(e instanceof Error ? e.message : '오류가 발생했습니다.');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        style={{
          width: '100%', padding: '18px 24px', borderRadius: 14, border: 'none',
          cursor: 'pointer', fontFamily: 'inherit', fontSize: 17, fontWeight: 800,
          background: 'white',
          color: '#7C3AED',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          transition: 'transform 0.15s, box-shadow 0.15s',
          letterSpacing: '-0.2px',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 40px rgba(0,0,0,0.2)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.15)';
        }}
      >
        ✦ 올킬보카 시작하기 →
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* 배경 */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />

          {/* 모달 */}
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
            {/* 헤더 */}
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-xl font-bold text-slate-800">올킬보카 시작하기</h3>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 바디 */}
            <div className="p-6">
              {/* 상품 정보 */}
              <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500 mb-1">결제 상품</p>
                <p className="text-lg font-bold text-slate-800">올킬보카 월 구독</p>
                <p className="text-sm text-violet-600 font-semibold mt-1">월 9,900원 (얼리버드 특가)</p>
              </div>

              {/* 고객 정보 입력 (주문 생성 전) */}
              {!orderId && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      이름 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="홍길동"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      연락처 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      placeholder="010-0000-0000"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      이메일 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={e => setCustomerEmail(e.target.value)}
                      placeholder="example@email.com"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none transition-all"
                    />
                    <p className="text-xs text-slate-400 mt-1">이메일이 올킬보카 로그인 아이디가 됩니다.</p>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <button
                    onClick={handleCreateOrder}
                    disabled={isCreatingOrder}
                    className="w-full py-4 rounded-xl font-semibold text-white text-lg bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all"
                  >
                    {isCreatingOrder ? '처리 중...' : '9,900원 결제 진행'}
                  </button>
                </div>
              )}

              {/* 결제 위젯 (주문 생성 후) */}
              {orderId && (
                <PaymentWidget
                  amount={9900}
                  orderName="올킬보카 월 구독"
                  orderId={orderId}
                  customerName={customerName}
                  customerPhone={customerPhone}
                  customerEmail={customerEmail}
                  onFail={(code, msg) => {
                    setError(`결제 실패: ${msg}`);
                    setOrderId(null);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
