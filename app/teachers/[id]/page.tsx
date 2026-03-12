'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import { Teacher, Course, CATEGORY_LABELS } from '@/lib/domain';
import { formatPrice } from '@/lib/utils';

export default function TeacherDetailPage() {
  const params = useParams();
  const teacherId = params.id as string;
  
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/public/teachers/${teacherId}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || '선생님 정보를 불러올 수 없습니다.');
        setTeacher(data.teacher);
        setCourses(data.courses || []);
      } catch (err) {
        console.error('Error fetching teacher:', err);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (teacherId) {
      fetchData();
    }
  }, [teacherId]);


  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'grammar': return 'bg-violet-500';
      case 'school_exam': return 'bg-emerald-500';
      case 'international': return 'bg-sky-500';
      case 'voca': return 'bg-rose-500';
      default: return 'bg-slate-500';
    }
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

  if (notFound || !teacher) {
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
            <h1 className="text-2xl font-bold text-[#1d1d1f] mb-2">선생님을 찾을 수 없습니다</h1>
            <p className="text-[#86868b] mb-6">요청하신 선생님 정보가 존재하지 않거나 삭제되었습니다.</p>
            <a
              href="/teachers"
              className="inline-block px-6 py-3 text-white bg-violet-500 hover:bg-violet-600 rounded-full font-medium transition-colors"
            >
              선생님 목록으로
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      {/* 프로필 섹션 */}
      <section className="pt-36 pb-16 px-4 bg-gradient-to-b from-violet-50 via-purple-50/50 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center lg:items-start">
            {/* 프로필 이미지 */}
            <div className="flex-shrink-0">
              <div className="w-64 h-64 lg:w-80 lg:h-80 rounded-3xl overflow-hidden shadow-2xl shadow-violet-200/50 border-4 border-white">
                {teacher.image_url ? (
                  <img 
                    src={teacher.image_url} 
                    alt={teacher.name}
                    className="w-full h-full object-cover"
                    style={{ objectPosition: teacher.image_position || 'center' }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                    <svg className="w-32 h-32 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* 정보 */}
            <div className="flex-1 text-center lg:text-left">
              {/* 이름 */}
              <h1 className="text-4xl md:text-5xl font-black text-[#1d1d1f] mb-6">
                {teacher.name}
                <span className="text-violet-500 ml-2">선생님</span>
              </h1>

              {/* 소개글 */}
              {teacher.bio && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-violet-100 shadow-lg">
                  <p className="text-lg text-[#424245] leading-relaxed whitespace-pre-line">
                    {teacher.bio}
                  </p>
                </div>
              )}

              {/* CTA */}
              <div className="mt-8">
                <a
                  href="https://www.allrounderenglish.co.kr/#consultation-form"
                  className="inline-block px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-violet-400 to-purple-400 hover:from-violet-500 hover:to-purple-500 rounded-full transition-all shadow-lg shadow-violet-300/30"
                >
                  {teacher.name} 선생님께 상담 신청하기
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 담당 강의 섹션 */}
      {courses.length > 0 && (
        <section className="py-16 px-4 bg-[#f5f5f7]">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-black text-[#1d1d1f] mb-8 text-center">
              {teacher.name} 선생님의 <span className="text-violet-600">강의</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {courses.map((course) => (
                <a
                  key={course.id}
                  href={`/courses/detail/${course.id}`}
                  className="group flex bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* 썸네일 */}
                  <div className="w-32 h-32 flex-shrink-0 bg-gray-100 relative overflow-hidden">
                    {course.thumbnail_url ? (
                      <img 
                        src={course.thumbnail_url} 
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-100 to-purple-100">
                        <svg className="w-10 h-10 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    )}
                    {/* 카테고리 뱃지 */}
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-0.5 ${getCategoryColor(course.category)} text-white text-xs font-bold rounded`}>
                        {CATEGORY_LABELS[course.category]}
                      </span>
                    </div>
                  </div>
                  
                  {/* 정보 */}
                  <div className="flex-1 p-4 flex flex-col justify-center">
                    <h3 className="text-lg font-bold text-[#1d1d1f] group-hover:text-violet-600 transition-colors line-clamp-1">
                      {course.title}
                    </h3>
                    {course.description && (
                      <p className="text-sm text-[#86868b] mt-1 line-clamp-1">{course.description}</p>
                    )}
                    <p className="text-lg font-bold text-violet-600 mt-2">
                      {formatPrice(course.price)}원
                    </p>
                  </div>
                  
                  {/* 화살표 */}
                  <div className="flex items-center px-4">
                    <svg className="w-5 h-5 text-[#86868b] group-hover:text-violet-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1d1d1f] mb-4">
            {teacher.name} 선생님과 함께 시작하세요
          </h2>
          <p className="text-[#86868b] mb-6">
            무료 상담을 통해 맞춤 학습 플랜을 받아보세요!
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
    </main>
  );
}

