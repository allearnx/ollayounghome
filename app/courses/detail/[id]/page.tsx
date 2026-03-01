'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import { Course, Teacher, CATEGORY_LABELS } from '@/lib/domain';
import PaymentWidget from '@/components/PaymentWidget';

interface CourseWithTeacher extends Course {
  teachers: Teacher | null;
}

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  
  const [course, setCourse] = useState<CourseWithTeacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  // 결제 관련 상태
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  
  // 고객 정보 입력 상태
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/public/courses/${courseId}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || '강좌 정보를 불러올 수 없습니다.');
        setCourse(data);
      } catch (err) {
        console.error('Error fetching course:', err);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'grammar': return 'bg-violet-500';
      case 'school_exam': return 'bg-emerald-500';
      case 'international': return 'bg-sky-500';
      case 'voca': return 'bg-rose-500';
      default: return 'bg-slate-500';
    }
  };

  // 결제 모달 열기 - 주문 생성
  const openPaymentModal = async () => {
    if (!course) return;
    
    setPaymentError(null);
    setIsCreatingOrder(true);
    
    try {
      if (!customerName.trim()) {
        throw new Error('이름을 입력해주세요.');
      }
      if (!customerPhone.trim()) {
        throw new Error('연락처를 입력해주세요.');
      }

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course.id,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '주문 생성에 실패했습니다.');
      }
      
      setOrderId(data.orderId);
      setShowPaymentModal(true);
    } catch (error) {
      console.error('Order creation error:', error);
      setPaymentError(error instanceof Error ? error.message : '주문 생성에 실패했습니다.');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // 결제 모달 닫기
  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setOrderId(null);
    setCustomerName('');
    setCustomerPhone('');
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="pt-36 flex items-center justify-center">
          <svg className="animate-spin h-12 w-12 text-violet-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </main>
    );
  }

  if (notFound || !course) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="pt-36 pb-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-6">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[#1d1d1f] mb-2">강의를 찾을 수 없습니다</h1>
            <p className="text-[#86868b] mb-6">요청하신 강의가 존재하지 않거나 삭제되었습니다.</p>
            <a
              href="/"
              className="inline-block px-6 py-3 text-white bg-violet-500 hover:bg-violet-600 rounded-full font-medium transition-colors"
            >
              홈으로 돌아가기
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      {/* 헤더 섹션 */}
      <section className="pt-36 pb-12 px-4 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* 썸네일 */}
            <div className="lg:w-1/2">
              <div className="aspect-[16/9] bg-gray-100 rounded-2xl overflow-hidden shadow-lg">
                {course.thumbnail_url ? (
                  <img 
                    src={course.thumbnail_url} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-100 to-purple-100">
                    <svg className="w-24 h-24 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* 강의 정보 */}
            <div className="lg:w-1/2 flex flex-col">
              {/* 카테고리 뱃지 */}
              <div className="mb-4">
                <span className={`inline-block px-4 py-1.5 ${getCategoryColor(course.category)} text-white text-sm font-bold rounded-full`}>
                  {CATEGORY_LABELS[course.category]}
                </span>
              </div>

              {/* 강의명 */}
              <h1 className="text-3xl md:text-4xl font-black text-[#1d1d1f] mb-4">
                {course.title}
              </h1>

              {/* 강의 설명 */}
              {course.description && (
                <p className="text-lg text-[#424245] mb-6 leading-relaxed whitespace-pre-line">
                  {course.description}
                </p>
              )}

              {/* 수강료 */}
              <div className="mb-6">
                <p className="text-sm text-[#86868b] mb-1">수강료</p>
                <p className="text-3xl font-black text-violet-600">
                  {formatPrice(course.price)}
                  <span className="text-lg font-medium text-[#424245]">원</span>
                </p>
              </div>

              {/* 담당 선생님 카드 */}
              {course.teachers && (
                <a
                  href={`/teachers/${course.teachers.id}`}
                  className="group flex items-center gap-4 p-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-violet-200 hover:shadow-lg transition-all"
                >
                  <div className="flex-shrink-0">
                    {course.teachers.image_url ? (
                      <img 
                        src={course.teachers.image_url} 
                        alt={course.teachers.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-violet-100 group-hover:border-violet-300 transition-colors"
                        style={{ objectPosition: course.teachers.image_position || 'center' }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center border-2 border-violet-200 group-hover:border-violet-300 transition-colors">
                        <svg className="w-8 h-8 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[#86868b]">담당 선생님</p>
                    <p className="text-xl font-bold text-[#1d1d1f] group-hover:text-violet-600 transition-colors">
                      {course.teachers.name}
                    </p>
                    {course.teachers.bio && (
                      <p className="text-sm text-[#424245] line-clamp-1 mt-1">{course.teachers.bio}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-[#86868b] group-hover:text-violet-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </a>
              )}

              {/* CTA 버튼 */}
              <div className="mt-6 space-y-3">
                {/* 바로 결제 버튼 */}
                <button
                  onClick={() => setShowPaymentModal(true)}
                  disabled={isCreatingOrder}
                  className="block w-full py-4 text-center text-lg font-bold text-white bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 rounded-full transition-all shadow-lg shadow-violet-300/30 disabled:opacity-50"
                >
                  {isCreatingOrder ? '처리 중...' : `${formatPrice(course.price)}원 결제하기`}
                </button>
                
                {/* 상담 신청 버튼 */}
                <a
                  href="https://www.allrounderenglish.co.kr/#consultation-form"
                  className="block w-full py-4 text-center text-lg font-bold text-violet-600 bg-white border-2 border-violet-200 hover:border-violet-400 hover:bg-violet-50 rounded-full transition-all"
                >
                  수강 상담 신청하기
                </a>
              </div>
              
              {paymentError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">{paymentError}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 상세 이미지 섹션 */}
      {course.detail_image_url && (
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-6 text-center">강의 상세 정보</h2>
            <div className="space-y-4">
              {(() => {
                // JSON 배열 파싱 시도
                try {
                  const urls = JSON.parse(course.detail_image_url);
                  if (Array.isArray(urls)) {
                    return urls.map((url: string, index: number) => (
                      <div key={index} className="rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                        <img 
                          src={url} 
                          alt={`${course.title} 상세 정보 ${index + 1}`}
                          className="w-full"
                        />
                      </div>
                    ));
                  }
                } catch {
                  // JSON 파싱 실패 시 단일 이미지로 처리
                }
                return (
                  <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                    <img 
                      src={course.detail_image_url} 
                      alt={`${course.title} 상세 정보`}
                      className="w-full"
                    />
                  </div>
                );
              })()}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 px-4 bg-violet-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1d1d1f] mb-4">
            이 강의에 관심이 있으신가요?
          </h2>
          <p className="text-[#86868b] mb-6">
            무료 상담을 통해 자세한 안내를 받아보세요!
          </p>
          <a
            href="https://www.allrounderenglish.co.kr/#consultation-form"
            className="inline-block px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-violet-400 to-purple-400 hover:from-violet-500 hover:to-purple-500 rounded-full transition-all shadow-lg shadow-violet-300/30"
          >
            무료 상담 신청하기
          </a>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-[#f5f5f7] pt-6 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="border-t border-gray-300 mb-8"></div>
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
            <div className="flex-shrink-0">
              <h3 className="text-lg font-bold text-[#1d1d1f] mb-4">CONTACT US</h3>
              <p className="text-2xl font-bold text-[#1d1d1f] mb-2">카카오톡 [올라영]</p>
              <p className="text-[#424245] text-sm mb-1">수업관련 문의 평일 AM 10:00 - PM 5:00</p>
              <p className="text-[#424245] text-sm mb-4">주말/공휴일 휴무</p>
              <div className="flex gap-2">
                <a href="#" className="px-4 py-2 bg-[#1d1d1f] text-white text-sm font-medium rounded hover:bg-[#424245] transition-colors">FAQ</a>
                <a href="#" className="px-4 py-2 bg-[#1d1d1f] text-white text-sm font-medium rounded hover:bg-[#424245] transition-colors">문의게시판</a>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-[#1d1d1f] mb-4">BUSINESS INFORMATION</h3>
              <div className="flex flex-col md:flex-row gap-8 text-[#424245] text-sm leading-relaxed">
                <div className="space-y-1">
                  <p>상호 : 올라운더영어</p>
                  <p>주소 : 인천광역시 연수구 해돋이로 107, 디동 209호</p>
                  <p>전화번호 : 010-4904-1247</p>
                  <p>개인정보관리책임자 : 안홍미</p>
                  <p>e-mail : michaela@allrounderenglish.com</p>
                </div>
                <div className="space-y-1">
                  <p>사업자등록번호 : 188-88-03474</p>
                  <p>통신판매업신고번호 : 제 2024-인천연수구-3892호</p>
                  <p>올라운더영어 대표 : 안홍미</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-6 border-t border-gray-200 text-center text-[#86868b] text-sm">
            <p>Copyright © allrounderenglish Inc. All Rights Reserved.</p>
            <div className="mt-2 flex justify-center gap-4 text-xs">
              <a href="/terms" className="hover:underline hover:text-[#424245]">이용약관</a>
              <span>|</span>
              <a href="/privacy" className="font-bold hover:underline hover:text-[#424245]">개인정보처리방침</a>
            </div>
          </div>
        </div>
      </footer>

      {/* 결제 모달 */}
      {showPaymentModal && course && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* 배경 오버레이 */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closePaymentModal}
          />
          
          {/* 모달 컨텐츠 */}
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
            {/* 모달 헤더 */}
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-xl font-bold text-slate-800">수강 결제</h3>
              <button
                onClick={closePaymentModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* 모달 바디 */}
            <div className="p-6">
              {/* 강좌 정보 */}
              <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500 mb-1">결제 강좌</p>
                <p className="text-lg font-bold text-slate-800">{course.title}</p>
              </div>
              
              {/* 고객 정보 입력 (주문 생성 전) */}
              {!orderId && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      학생이름 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="홍길동"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none transition-all"
                      required
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
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none transition-all"
                      required
                    />
                  </div>
                  
                  <button
                    onClick={openPaymentModal}
                    disabled={isCreatingOrder}
                    className="w-full py-4 rounded-xl font-semibold text-white text-lg bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all"
                  >
                    {isCreatingOrder ? '주문 생성 중...' : `${formatPrice(course.price)}원 결제 진행`}
                  </button>
                </div>
              )}
              
              {/* 결제 위젯 (주문 생성 후) */}
              {orderId && (
                <PaymentWidget
                  amount={course.price}
                  orderName={course.title}
                  orderId={orderId}
                  customerName={customerName}
                  customerPhone={customerPhone}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

