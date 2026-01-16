'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { GRADE_OPTIONS } from '@/lib/domain';
import Header from '@/components/Header';

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// 후기 이미지 (1.png ~ 13.png)
const reviewImages = Array.from({ length: 13 }, (_, i) => `/review/${i + 1}.png`);

// 커리큘럼 데이터
const curriculumData = [
  {
    title: '실시간 수업',
    shortDesc: '실시간 수업으로 학생의\n수업 참여도+ 집중력 UP',
    detailTitle: '실시간 수업으로 학생의\n수업 참여도+ 집중력 UP',
    detailDesc: '듣기만 하는 인강은 가라~ 인강은 귀찮기도 하고.. 자꾸 딴 생각이 나기도 하고... 선생님과 다른 학생들과의 실시간 수업은 그럴 시간이 없어요! 철저한 개념 이해를 위한 실시간 필기와 질문과 대답을 통한 소통이 수업의 몰입도를 올려 줍니다.',
    icon: '🎥',
  },
  {
    title: '1:1 피드백',
    shortDesc: '숙제와 오답 1:1 피드백으로\n진짜 영어실력을 올리세요!',
    detailTitle: '숙제와 오답 1:1 피드백\n으로 진짜 영어 실력을\n올리세요.',
    detailDesc: '매주 수업 후 내주는 숙제는 많은 부모님들이 정말 왜 올라영으로 문법이 끝날 수 있는지 알겠다고 입모아 말씀하세요. 게다가 오답은 피드백 설명이 제공됩니다. 다음 수업 전까지 오답 설명까지 완료! 아이들이 모르는 것을 다 해결하고 다음 수업을 들을 수 있어 수업의 효과를 최대로 끌어 올릴 수 있어요!',
    icon: '💡',
  },
  {
    title: '실력&점수 UP',
    shortDesc: '실력만큼 점수도 올리세요!',
    detailTitle: '실력만큼 점수도\n올리세요!',
    detailDesc: '실력은 올라갔다는데 점수는 안 오른다?? 실력만큼 내신 점수가 나오지 않는다면 안되겠죠? 올라영은 성취감에서 자신감이 나온다고 믿습니다. 한번이라도 점수가 오른 아이들은 눈빛이 다르거든요!',
    icon: '🏆',
  },
];

// 스크롤 애니메이션 훅
function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

// 애니메이션 섹션 컴포넌트
function AnimatedSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, isVisible } = useScrollAnimation();
  
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function HomePage() {
  const [studentName, setStudentName] = useState('');
  const [studentGrade, setStudentGrade] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setParentPhone(formatted);
  };

  const scrollToForm = () => {
    const element = document.getElementById('consultation-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!studentName.trim()) {
      setError('학생 이름을 입력해주세요.');
      return;
    }

    if (!studentGrade) {
      setError('학년을 선택해주세요.');
      return;
    }

    const phoneNumbers = parentPhone.replace(/[^\d]/g, '');
    if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
      setError('올바른 연락처를 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_name: studentName.trim(),
          grade: studentGrade,
          parent_phone: parentPhone,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || '신청 중 오류가 발생했습니다. 다시 시도해주세요.');
      }

      setShowModal(true);
      setStudentName('');
      setStudentGrade('');
      setParentPhone('');
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : '신청 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf5ff] overflow-x-hidden">
      {/* 네비게이션 헤더 */}
      <Header />

      {/* ===== 1. 히어로 배너 (Hero Section) - Apple Style ===== */}
      <section className="relative min-h-[70vh] bg-white pt-40 pb-24 overflow-hidden flex items-center">
        {/* 콘텐츠 */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* 상단 뱃지 */}
          <AnimatedSection>
            <p className="text-[#86868b] text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight mb-8">
              온라인 실시간 수업
            </p>
          </AnimatedSection>
          
          {/* 메인 타이틀 - 그라데이션 */}
          <AnimatedSection delay={100}>
            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight mb-10">
              <span className="bg-gradient-to-r from-violet-600 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                성적의 한계를 뛰어넘다.
              </span>
            </h1>
          </AnimatedSection>
          
          {/* 서브 카피 */}
          <AnimatedSection delay={150}>
            <p className="text-[#1d1d1f] text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight mb-12">
              영어, 이제는 온라인에서 끝내세요.
            </p>
          </AnimatedSection>
          
        </div>
      </section>

      {/* ===== 2. 수강생 후기 (Testimonials) ===== */}
      <section className="py-24 px-4 bg-violet-50 relative">
        <div className="max-w-6xl mx-auto">
          {/* 섹션 타이틀 */}
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#1d1d1f] mb-5 tracking-tight">
              올라영과 함께<br className="md:hidden" />
              <span className="bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent"> 기적</span>을 만든 학생들
            </h2>
            <p className="text-[#86868b] text-lg max-w-xl mx-auto leading-relaxed">
              실제 수강생들의 생생한 후기를 확인하세요
            </p>
          </AnimatedSection>

          {/* 후기 이미지 슬라이더 */}
          <AnimatedSection delay={100}>
            <div className="relative">
              <Swiper
                modules={[Autoplay, Navigation, Pagination]}
                spaceBetween={24}
                slidesPerView={1}
                centeredSlides={true}
                loop={true}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
                }}
                pagination={{
                  clickable: true,
                  bulletClass: 'swiper-pagination-bullet !bg-violet-300 !opacity-50',
                  bulletActiveClass: '!bg-violet-500 !opacity-100',
                }}
                navigation={{
                  prevEl: '.swiper-button-prev-custom',
                  nextEl: '.swiper-button-next-custom',
                }}
                breakpoints={{
                  640: {
                    slidesPerView: 2,
                    centeredSlides: false,
                  },
                  1024: {
                    slidesPerView: 3,
                    centeredSlides: false,
                  },
                }}
                className="pb-12"
              >
                {reviewImages.map((src, index) => (
                  <SwiperSlide key={index}>
                    <div className="rounded-2xl overflow-hidden shadow-lg shadow-gray-200/50 bg-white border border-gray-100">
                      <Image
                        src={src}
                        alt={`수강생 후기 ${index + 1}`}
                        width={400}
                        height={500}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* 커스텀 네비게이션 버튼 */}
              <button className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-violet-500 hover:bg-violet-50 transition-all -ml-4 lg:-ml-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-violet-500 hover:bg-violet-50 transition-all -mr-4 lg:-mr-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ===== 3. 대표 강의 (Curriculum) ===== */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* 섹션 타이틀 */}
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#1d1d1f] mb-5 tracking-tight">
              올라영만의<br className="md:hidden" />
              <span className="bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent"> 특별한</span> 3가지
            </h2>
            <p className="text-[#86868b] text-lg max-w-xl mx-auto leading-relaxed">
              올라영이 특별한 이유, 직접 확인해보세요
            </p>
          </AnimatedSection>

          {/* 커리큘럼 카드 */}
          <div className="grid md:grid-cols-3 gap-8">
            {curriculumData.map((item, index) => (
              <AnimatedSection key={index} delay={index * 100}>
                {/* 플립 카드 컨테이너 - 아이폰 스타일 */}
                <div className="group h-[480px] cursor-pointer" style={{ perspective: '1000px' }}>
                  <div 
                    className="relative w-full h-full transition-transform duration-700 ease-out group-hover:[transform:rotateY(180deg)]"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* 앞면 (Front) - 아이폰 베젤 스타일 */}
                    <div 
                      className="absolute inset-0 bg-white rounded-[44px] p-8 flex flex-col items-center text-center justify-center"
                      style={{ 
                        backfaceVisibility: 'hidden',
                        boxShadow: '0 0 0 2px #1d1d1f, 0 0 0 6px #a1a1aa, 0 25px 50px -12px rgba(0,0,0,0.15)'
                      }}
                    >
                      <div className="text-[120px] mb-6 leading-none">{item.icon}</div>
                      <h3 className="text-4xl md:text-5xl font-black text-[#1d1d1f] mb-4 tracking-tight leading-tight">{item.title}</h3>
                      <p className="text-[#424245] text-xl md:text-2xl font-bold leading-snug px-2 whitespace-pre-line">{item.shortDesc}</p>
                    </div>

                    {/* 뒷면 (Back) - 아이폰 베젤 스타일 + 연보라 배경 */}
                    <div 
                      className="absolute inset-0 bg-violet-50 rounded-[44px] p-6 md:p-8 flex flex-col justify-center"
                      style={{ 
                        backfaceVisibility: 'hidden', 
                        transform: 'rotateY(180deg)',
                        boxShadow: '0 0 0 2px #1d1d1f, 0 0 0 6px #a1a1aa, 0 25px 50px -12px rgba(0,0,0,0.15)'
                      }}
                    >
                      <h4 className="text-2xl md:text-3xl font-black mb-4 leading-tight whitespace-pre-line text-[#424245]">{item.detailTitle}</h4>
                      <p className="text-[#424245] text-lg md:text-xl font-semibold leading-relaxed">{item.detailDesc}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 4. 상담 신청 폼 (Consultation Form) ===== */}
      <section id="consultation-form" className="py-24 px-4 bg-white">
        <div className="max-w-xl mx-auto">
          {/* 섹션 타이틀 */}
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#1d1d1f] mb-5 tracking-tight">
              지금 바로<br className="md:hidden" />
              <span className="bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent"> 상담 신청</span>하세요
            </h2>
            <p className="text-[#86868b] text-lg leading-relaxed">
              학생의 현재 상태를 남겨주시면,<br className="md:hidden" />
              전문 컨설턴트가 연락드립니다.
            </p>
          </AnimatedSection>

          {/* 폼 카드 (글라스 효과) */}
          <AnimatedSection delay={100}>
            <div className="rounded-3xl p-8 md:p-10 bg-white/70 backdrop-blur-xl border border-gray-200/50 shadow-xl shadow-gray-200/50">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 학생 이름 */}
                <div>
                  <label htmlFor="studentName" className="block text-sm font-bold text-slate-700 mb-2 tracking-tight">
                    학생 이름
                  </label>
                  <input
                    type="text"
                    id="studentName"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="예: 김철수"
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-slate-800 placeholder:text-slate-400 font-medium bg-white/80"
                    disabled={isLoading}
                  />
                </div>

                {/* 학년 선택 */}
                <div>
                  <label htmlFor="studentGrade" className="block text-sm font-bold text-slate-700 mb-2 tracking-tight">
                    학년 선택
                  </label>
                  <select
                    id="studentGrade"
                    value={studentGrade}
                    onChange={(e) => setStudentGrade(e.target.value)}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-slate-800 bg-white/80 appearance-none cursor-pointer font-medium"
                    disabled={isLoading}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%238b5cf6' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 1.25rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                    }}
                  >
                    <option value="" disabled>학년을 선택해주세요</option>
                    {GRADE_OPTIONS.map((grade) => (
                      <option key={grade.value} value={grade.value}>
                        {grade.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 학부모 연락처 */}
                <div>
                  <label htmlFor="parentPhone" className="block text-sm font-bold text-slate-700 mb-2 tracking-tight">
                    학부모 연락처
                  </label>
                  <input
                    type="tel"
                    id="parentPhone"
                    value={parentPhone}
                    onChange={handlePhoneChange}
                    placeholder="010-0000-0000"
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-slate-800 placeholder:text-slate-400 font-medium bg-white/80"
                    disabled={isLoading}
                    maxLength={13}
                  />
                  <p className="mt-2 text-sm text-slate-500">
                    입력하신 번호로 상담 안내 연락을 드립니다
                  </p>
                </div>

                {/* 에러 메시지 */}
                {error && (
                  <div className="p-4 bg-red-50 border-2 border-red-100 rounded-2xl">
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                  </div>
                )}

                {/* 신청 버튼 */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-5 bg-gradient-to-r from-violet-400 to-purple-400 hover:from-violet-500 hover:to-purple-500 text-white text-lg font-bold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-violet-300/30"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      신청 중...
                    </span>
                  ) : (
                    '무료 상담 신청하기'
                  )}
                </button>
              </form>

              {/* 안내 문구 */}
              <p className="mt-6 text-center text-sm text-slate-500">
                📞 신청 후 24시간 내 연락드립니다
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ===== 5. 푸터 (Footer) - Apple Style ===== */}
      <footer className="bg-[#f5f5f7] pt-6 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* 구분선 */}
          <div className="border-t border-gray-300 mb-8"></div>
          
          {/* 메인 콘텐츠 */}
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
            {/* CONTACT US */}
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
            
            {/* BUSINESS INFORMATION */}
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
          
          {/* 저작권 및 약관 링크 */}
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

      {/* ===== 6. 플로팅 상담 버튼 (Floating CTA) ===== */}
      <button
        onClick={scrollToForm}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-violet-400 to-purple-400 hover:from-violet-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-2xl shadow-violet-300/40 hover:shadow-violet-400/50 transition-all duration-300 hover:scale-105"
        aria-label="상담 신청하기"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span className="hidden sm:inline">상담 신청</span>
      </button>

      {/* ===== 성공 모달 ===== */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-3xl p-10 max-w-sm w-full shadow-2xl animate-[fadeIn_0.3s_ease-out]">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-100 to-purple-100 rounded-3xl mb-6">
                <svg className="w-10 h-10 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">
                신청 완료!
              </h3>
              <p className="text-slate-600 mb-8 leading-relaxed">
                빠른 시일 내에 연락드리겠습니다.<br />
                감사합니다.
              </p>
              <button
                onClick={() => setShowModal(false)}
                className="btn-glow w-full py-4 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-violet-500/30"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
