'use client';

import { useState } from 'react';
import { adminFetch } from '@/lib/adminApi.client';
import { formatPrice } from '@/lib/utils';
import type { Student, Course } from '../_types';

interface ManualPaymentModalProps {
  students: Student[];
  courses: Course[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function ManualPaymentModal({ students, courses, onClose, onSuccess }: ManualPaymentModalProps) {
  const [studentTab, setStudentTab] = useState<'existing' | 'new'>('existing');
  const [newStudent, setNewStudent] = useState({ student_name: '', parent_phone: '', grade: '' });
  const [manualPayment, setManualPayment] = useState({
    student_id: '',
    course_id: '',
    amount: '',
    category: 'TUITION',
    method: 'CASH',
    memo: '',
    paid_at: new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' }),
  });
  const [isCreatingManualPayment, setIsCreatingManualPayment] = useState(false);

  const createManualPayment = async () => {
    if (studentTab === 'new') {
      if (!newStudent.student_name.trim()) { alert('학생 이름을 입력해주세요.'); return; }
      if (!newStudent.parent_phone.trim()) { alert('학부모 연락처를 입력해주세요.'); return; }
    } else {
      if (!manualPayment.student_id) { alert('학생을 선택해주세요.'); return; }
    }
    if (!manualPayment.course_id) { alert('강좌를 선택해주세요.'); return; }
    if (!manualPayment.amount || parseInt(manualPayment.amount) <= 0) { alert('유효한 금액을 입력해주세요.'); return; }

    setIsCreatingManualPayment(true);
    try {
      const response = await adminFetch('/api/manual-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(studentTab === 'existing'
            ? { student_id: manualPayment.student_id }
            : { student_name: newStudent.student_name.trim(), parent_phone: newStudent.parent_phone.trim() }),
          course_id: manualPayment.course_id,
          amount: parseInt(manualPayment.amount),
          category: manualPayment.category,
          method: manualPayment.method,
          memo: manualPayment.memo || null,
          paid_at: manualPayment.paid_at ? new Date(`${manualPayment.paid_at}T00:00:00+09:00`).toISOString() : null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '수기 결제 등록에 실패했습니다.');

      alert('수기 결제가 등록되었습니다.');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Manual payment creation error:', error);
      alert(error instanceof Error ? error.message : '수기 결제 등록에 실패했습니다.');
    } finally {
      setIsCreatingManualPayment(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-800">💵 수기 결제 등록</h3>
          <p className="text-slate-500 text-sm mt-1">현금, 결제선생, 계좌이체 등의 결제를 등록합니다.</p>
        </div>
        <div className="p-6 space-y-4">
          {/* 학생 탭 */}
          <div>
            <div className="flex border-b border-slate-200 mb-4">
              <button
                type="button"
                onClick={() => setStudentTab('existing')}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  studentTab === 'existing' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                기존 학생
              </button>
              <button
                type="button"
                onClick={() => setStudentTab('new')}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  studentTab === 'new' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                신규 학생 등록
              </button>
            </div>

            {studentTab === 'existing' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  학생 <span className="text-red-500">*</span>
                </label>
                <select
                  value={manualPayment.student_id}
                  onChange={(e) => setManualPayment((prev) => ({ ...prev, student_id: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none"
                >
                  <option value="">학생을 선택하세요</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.student_name} ({student.parent_phone || '연락처 없음'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {studentTab === 'new' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    학생 이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newStudent.student_name}
                    onChange={(e) => setNewStudent((prev) => ({ ...prev, student_name: e.target.value }))}
                    placeholder="학생 이름"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    학부모 연락처 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={newStudent.parent_phone}
                    onChange={(e) => setNewStudent((prev) => ({ ...prev, parent_phone: e.target.value }))}
                    placeholder="010-0000-0000"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    학년 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newStudent.grade}
                    onChange={(e) => setNewStudent((prev) => ({ ...prev, grade: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none"
                  >
                    <option value="">학년을 선택하세요</option>
                    <optgroup label="초등학교">
                      {['초등 1학년','초등 2학년','초등 3학년','초등 4학년','초등 5학년','초등 6학년'].map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </optgroup>
                    <optgroup label="중학교">
                      {['중등 1학년','중등 2학년','중등 3학년'].map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </optgroup>
                    <optgroup label="고등학교">
                      {['고등 1학년','고등 2학년','고등 3학년'].map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>
            )}
          </div>

          <hr className="border-slate-200" />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              강좌 <span className="text-red-500">*</span>
            </label>
            <select
              value={manualPayment.course_id}
              onChange={(e) => {
                const courseId = e.target.value;
                const course = courses.find((c) => c.id === courseId);
                setManualPayment((prev) => ({
                  ...prev,
                  course_id: courseId,
                  amount: course ? course.price.toString() : prev.amount,
                }));
              }}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none"
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
              금액 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={manualPayment.amount}
              onChange={(e) => setManualPayment((prev) => ({ ...prev, amount: e.target.value }))}
              placeholder="결제 금액"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              카테고리 <span className="text-red-500">*</span>
            </label>
            <select
              value={manualPayment.category}
              onChange={(e) => setManualPayment((prev) => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none"
            >
              <option value="TUITION">수강료</option>
              <option value="MATERIAL">교재비</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              결제 수단 <span className="text-red-500">*</span>
            </label>
            <select
              value={manualPayment.method}
              onChange={(e) => setManualPayment((prev) => ({ ...prev, method: e.target.value }))}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none"
            >
              <option value="CASH">현금</option>
              <option value="PAYMENT_TEACHER">결제선생</option>
              <option value="TRANSFER">계좌이체</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              결제일 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={manualPayment.paid_at}
              onChange={(e) => setManualPayment((prev) => ({ ...prev, paid_at: e.target.value }))}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">메모</label>
            <textarea
              value={manualPayment.memo}
              onChange={(e) => setManualPayment((prev) => ({ ...prev, memo: e.target.value }))}
              placeholder="추가 정보 (선택)"
              rows={2}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={createManualPayment}
              disabled={isCreatingManualPayment}
              className="flex-1 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
            >
              {isCreatingManualPayment ? '등록 중...' : '등록하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
