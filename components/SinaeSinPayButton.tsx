'use client';

import { useState, useRef } from 'react';
import PaymentWidget from '@/components/PaymentWidget';
import { SCHOOL_EXAM_COURSE_ID } from '@/lib/constants';

export default function SinaeSinPayButton() {
  const [showModal, setShowModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

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

    const nameVal = (nameRef.current?.value ?? customerName).trim();
    const phoneVal = (phoneRef.current?.value ?? customerPhone).trim();
    const emailVal = (emailRef.current?.value ?? customerEmail).trim();

    if (nameVal !== customerName) setCustomerName(nameVal);
    if (phoneVal !== customerPhone) setCustomerPhone(phoneVal);
    if (emailVal !== customerEmail) setCustomerEmail(emailVal);

    if (!nameVal) { setError('학생 이름을 입력해주세요.'); return; }
    if (!phoneVal) { setError('연락처를 입력해주세요.'); return; }
    if (!emailVal) { setError('이메일을 입력해주세요.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      setError('올바른 이메일 형식으로 입력해주세요.');
      return;
    }

    if (!SCHOOL_EXAM_COURSE_ID) {
      setError('준비 중입니다. 카카오톡으로 문의해주세요.');
      return;
    }

    setIsCreatingOrder(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: SCHOOL_EXAM_COURSE_ID,
          customerName: nameVal,
          customerPhone: phoneVal,
          customerEmail: emailVal,
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
          display: 'block', width: '100%',
          background: '#3182F6', color: 'white', border: 'none',
          padding: '18px', borderRadius: 12,
          fontSize: '1rem', fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit',
          marginTop: 28, transition: 'all 0.25s',
          boxShadow: '0 4px 16px rgba(49,130,246,0.25)',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = '#1b6ef3';
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(49,130,246,0.35)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = '#3182F6';
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(49,130,246,0.25)';
        }}
      >
        결제하기
        <span style={{ fontSize: '0.78rem', fontWeight: 400, opacity: 0.8, display: 'block', marginTop: 2 }}>
          토스페이먼츠 · 안전한 결제
        </span>
      </button>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          {/* 배경 */}
          <div
            onClick={closeModal}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          />

          {/* 모달 */}
          <div style={{ position: 'relative', width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', background: 'white', borderRadius: 20, boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
            {/* 헤더 */}
            <div style={{ position: 'sticky', top: 0, background: 'white', borderBottom: '1px solid #f1f5f9', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '20px 20px 0 0' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>올인내신 수강 신청</h3>
              <button
                onClick={closeModal}
                style={{ padding: 8, border: 'none', background: 'none', cursor: 'pointer', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div style={{ padding: '24px 24px 32px' }}>
              {/* 상품 정보 */}
              <div style={{ marginBottom: 24, padding: '16px 18px', background: '#f8f7ff', borderRadius: 12, border: '1px solid rgba(99,102,241,0.12)' }}>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: 4 }}>결제 상품</p>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#1e1b4b' }}>올인내신 · 4주 수강</p>
                <p style={{ fontSize: '0.875rem', color: '#4338ca', fontWeight: 600, marginTop: 4 }}>₩180,000</p>
              </div>

              {!orderId ? (
                <div>
                  {/* 입력 필드들 */}
                  {[
                    { label: '학생 이름', ref: nameRef, value: customerName, setter: setCustomerName, type: 'text', placeholder: '홍길동' },
                    { label: '학부모 전화번호', ref: phoneRef, value: customerPhone, setter: setCustomerPhone, type: 'tel', placeholder: '010-0000-0000' },
                    { label: '이메일', ref: emailRef, value: customerEmail, setter: setCustomerEmail, type: 'email', placeholder: 'example@email.com' },
                  ].map(({ label, ref, value, setter, type, placeholder }) => (
                    <div key={label} style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                        {label} <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        ref={ref}
                        type={type}
                        value={value}
                        onChange={e => setter(e.target.value)}
                        onInput={e => setter((e.currentTarget as HTMLInputElement).value)}
                        placeholder={placeholder}
                        style={{
                          width: '100%', padding: '12px 14px',
                          border: '1.5px solid #e2e8f0', borderRadius: 10,
                          fontSize: '0.95rem', outline: 'none',
                          fontFamily: 'inherit', color: '#1e293b',
                          transition: 'border-color 0.2s',
                          boxSizing: 'border-box',
                        }}
                        onFocus={e => (e.currentTarget.style.borderColor = '#6366f1')}
                        onBlur={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
                      />
                    </div>
                  ))}

                  {error && (
                    <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, marginBottom: 16 }}>
                      <p style={{ fontSize: '0.875rem', color: '#dc2626' }}>{error}</p>
                    </div>
                  )}

                  <button
                    onClick={handleCreateOrder}
                    disabled={isCreatingOrder}
                    style={{
                      width: '100%', padding: '15px',
                      background: isCreatingOrder ? '#94a3b8' : '#3182F6',
                      color: 'white', border: 'none', borderRadius: 12,
                      fontSize: '1rem', fontWeight: 700,
                      cursor: isCreatingOrder ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit', transition: 'background 0.2s',
                    }}
                  >
                    {isCreatingOrder ? '처리 중...' : '180,000원 결제 진행'}
                  </button>
                </div>
              ) : (
                <PaymentWidget
                  amount={180000}
                  orderName="올인내신 4주 수강"
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
