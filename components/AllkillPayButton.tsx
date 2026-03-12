'use client';

import { useState } from 'react';
import PaymentWidget from '@/components/PaymentWidget';

// 올킬보카 DB 등록 후 여기에 courseId 입력
const ALLKILL_COURSE_ID = '';

export default function AllkillPayButton() {
  const [showForm, setShowForm] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (!customerName.trim()) { setError('이름을 입력해주세요.'); return; }
    if (!customerPhone.trim()) { setError('연락처를 입력해주세요.'); return; }
    if (!ALLKILL_COURSE_ID) { setError('준비 중입니다. 곧 오픈돼요!'); return; }

    setIsCreatingOrder(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: ALLKILL_COURSE_ID,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '주문 생성에 실패했습니다.');
      setOrderId(data.orderId);
      setShowPayment(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : '오류가 발생했습니다.');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const reset = () => {
    setShowForm(false);
    setShowPayment(false);
    setOrderId(null);
    setCustomerName('');
    setCustomerPhone('');
    setError(null);
  };

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        style={{
          width: '100%', padding: 16, borderRadius: 12, border: 'none',
          cursor: 'pointer', fontFamily: 'inherit', fontSize: 16, fontWeight: 700,
          background: '#A78BFA', color: 'white',
          boxShadow: '0 8px 24px rgba(167,139,250,0.35)',
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
      >
        지금 시작하기 →
      </button>

      {/* 고객 정보 입력 모달 */}
      {showForm && !showPayment && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}
          onClick={(e) => { if (e.target === e.currentTarget) reset(); }}
        >
          <div style={{ background: 'white', borderRadius: 24, padding: '40px 36px', width: '100%', maxWidth: 420, boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: 22, fontWeight: 900, color: '#2D2760', marginBottom: 6 }}>올킬보카 시작하기</h3>
            <p style={{ fontSize: 14, color: '#9E97C8', marginBottom: 28, lineHeight: 1.6 }}>정보를 입력하면 결제창으로 이동해요.</p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#5C5490', marginBottom: 6 }}>이름</label>
              <input
                type="text"
                placeholder="홍길동"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1.5px solid #E5E2FF', fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => { e.currentTarget.style.borderColor = '#A78BFA'; }}
                onBlur={e => { e.currentTarget.style.borderColor = '#E5E2FF'; }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#5C5490', marginBottom: 6 }}>연락처</label>
              <input
                type="tel"
                placeholder="010-0000-0000"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1.5px solid #E5E2FF', fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => { e.currentTarget.style.borderColor = '#A78BFA'; }}
                onBlur={e => { e.currentTarget.style.borderColor = '#E5E2FF'; }}
              />
            </div>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#DC2626', marginBottom: 16 }}>
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isCreatingOrder}
              style={{ width: '100%', padding: 14, borderRadius: 12, border: 'none', cursor: isCreatingOrder ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: 16, fontWeight: 700, background: isCreatingOrder ? '#C4B5FD' : '#A78BFA', color: 'white', marginBottom: 10 }}
            >
              {isCreatingOrder ? '처리 중...' : '결제하기 →'}
            </button>
            <button
              onClick={reset}
              style={{ width: '100%', padding: 12, borderRadius: 12, border: '1.5px solid #E5E2FF', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, background: 'transparent', color: '#9E97C8' }}
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 결제 위젯 모달 */}
      {showPayment && orderId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 24, padding: 32, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: '#2D2760' }}>결제</h3>
              <button onClick={reset} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#9E97C8' }}>✕</button>
            </div>
            <PaymentWidget
              orderId={orderId}
              amount={9900}
              orderName="올킬보카 월 구독"
              customerName={customerName}
              customerPhone={customerPhone}
              onFail={(code, msg) => { setError(`결제 실패: ${msg}`); setShowPayment(false); }}
            />
          </div>
        </div>
      )}
    </>
  );
}
