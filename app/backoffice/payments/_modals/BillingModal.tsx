'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/utils';
import type { Student, Course } from '../_types';

interface BillingModalProps {
  students: Student[];
  courses: Course[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function BillingModal({ students, courses, onClose, onSuccess }: BillingModalProps) {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isCreatingBilling, setIsCreatingBilling] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const createBilling = async () => {
    const course = courses.find(c => c.id === selectedCourse);
    const student = students.find(s => s.id === selectedStudent);
    const amount = customAmount ? parseInt(customAmount) : (course?.price || 0);
    const finalName = (customerName || student?.student_name || '').trim();
    const finalPhone = (customerPhone || student?.parent_phone || '').trim();

    if (amount <= 0) { alert('결제 금액을 입력해주세요.'); return; }
    if (!finalName) { alert('학생이름을 입력해주세요.'); return; }
    if (!finalPhone) { alert('학부모 연락처를 입력해주세요.'); return; }

    setIsCreatingBilling(true);
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent || null,
          courseId: selectedCourse || null,
          amount,
          customerName: finalName,
          customerPhone: finalPhone,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '청구서 생성에 실패했습니다.');

      setGeneratedLink(`${window.location.origin}/payment/checkout?orderId=${data.orderId}`);
      onSuccess();
    } catch (error) {
      console.error('Billing creation error:', error);
      alert(error instanceof Error ? error.message : '청구서 생성에 실패했습니다.');
    } finally {
      setIsCreatingBilling(false);
    }
  };

  const copyLink = async () => {
    if (!generatedLink) return;
    try {
      await navigator.clipboard.writeText(generatedLink);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = generatedLink;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-800">청구서 생성</h3>
          <p className="text-sm text-slate-500 mt-1">학부모에게 전송할 결제 링크를 생성합니다.</p>
        </div>
        <div className="p-6 space-y-4">
          {!generatedLink ? (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  학생 선택 <span className="text-slate-400">(선택)</span>
                </label>
                <select
                  value={selectedStudent}
                  onChange={(e) => {
                    setSelectedStudent(e.target.value);
                    const student = students.find(s => s.id === e.target.value);
                    if (student) {
                      setCustomerName(student.student_name);
                      setCustomerPhone(student.parent_phone);
                    }
                  }}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none"
                >
                  <option value="">학생을 선택하세요</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.student_name} ({student.parent_phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  강좌 선택 <span className="text-slate-400">(선택)</span>
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => {
                    setSelectedCourse(e.target.value);
                    const course = courses.find(c => c.id === e.target.value);
                    if (course) setCustomAmount(course.price.toString());
                  }}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none"
                >
                  <option value="">강좌를 선택하세요</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title} ({formatPrice(course.price)}원)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  결제 금액 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="100000"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  학생이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="학생이름 입력"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  학부모 연락처 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="010-1234-5678"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none"
                />
                <p className="mt-1 text-xs text-slate-400">하이픈(-) 포함 입력 가능</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={createBilling}
                  disabled={isCreatingBilling || !customAmount}
                  className="flex-1 py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isCreatingBilling ? '생성 중...' : '청구서 생성'}
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="font-semibold text-emerald-800">청구서가 생성되었습니다!</p>
                </div>
                <p className="text-sm text-emerald-700">아래 링크를 학부모에게 전송하세요.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm font-medium text-slate-600 mb-2">결제 링크</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={generatedLink}
                    readOnly
                    className="flex-1 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg font-mono"
                  />
                  <button
                    onClick={copyLink}
                    className={`px-4 py-2 font-semibold rounded-lg transition-colors ${
                      copySuccess ? 'bg-emerald-500 text-white' : 'bg-violet-600 text-white hover:bg-violet-700'
                    }`}
                  >
                    {copySuccess ? '복사됨!' : '복사'}
                  </button>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
              >
                닫기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
