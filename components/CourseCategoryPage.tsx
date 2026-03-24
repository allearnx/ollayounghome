'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { Course, Teacher, CATEGORY_LABELS, CourseCategory } from '@/lib/domain';
import { CATEGORY_PAGE_CONFIG } from '@/lib/courseCategoryConfig';
import { formatPrice } from '@/lib/utils';

interface CourseWithTeacher extends Course {
  teachers: Teacher | null;
}

export default function CourseCategoryPage({ category }: { category: CourseCategory }) {
  const theme = CATEGORY_PAGE_CONFIG[category];
  const [courses, setCourses] = useState<CourseWithTeacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`/api/public/courses?category=${category}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || '강의 목록을 불러오는데 실패했습니다.');
        setCourses(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, [category]);


  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className={`pt-36 pb-16 px-4 bg-gradient-to-b ${theme.heroBgClass}`}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#86868b] text-lg mb-4">{theme.englishTitle}</p>
          <h1 className="text-4xl md:text-6xl font-black text-[#1d1d1f] tracking-tight">
            <span className={`bg-gradient-to-r ${theme.heroTitleGradientClass} bg-clip-text text-transparent`}>
              {theme.highlightedTitle}
            </span>
            {theme.titleSuffix ?? ''}
          </h1>
          <p className="text-xl text-[#86868b] mt-6">{theme.description}</p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <svg className={`animate-spin h-10 w-10 ${theme.loadingColorClass}`} viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold text-[#1d1d1f] mb-2">오류가 발생했습니다</h2>
              <p className="text-[#86868b]">{error}</p>
              <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-slate-700 text-white rounded-full">
                다시 시도
              </button>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20">
              <div className={`inline-flex items-center justify-center w-20 h-20 ${theme.emptyBgClass} rounded-full mb-6`}>
                <svg className={`w-10 h-10 ${theme.emptyIconClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#1d1d1f] mb-2">준비 중인 강의입니다</h2>
              <p className="text-[#86868b]">곧 멋진 강의로 찾아뵙겠습니다!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-24">
              {courses.map((course) => (
                <a key={course.id} href={`/courses/detail/${course.id}`} className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="aspect-[16/9] bg-gray-100 relative overflow-hidden">
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                        <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className={`px-3 py-1 ${theme.badgeColorClass} text-white text-xs font-bold rounded-full`}>
                        {CATEGORY_LABELS[course.category]}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className={`text-xl font-bold text-[#1d1d1f] mb-4 transition-colors line-clamp-2 ${theme.cardHoverTextClass}`}>
                      {course.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {course.teachers?.image_url ? (
                          <img
                            src={course.teachers.image_url}
                            alt={course.teachers.name}
                            className={`w-10 h-10 rounded-full object-cover border-2 ${theme.teacherBorderClass}`}
                            style={{ objectPosition: (course.teachers as any)?.image_position || 'center' }}
                          />
                        ) : (
                          <div className={`w-10 h-10 rounded-full ${theme.teacherFallbackBgClass} flex items-center justify-center`}>
                            <svg className={`w-5 h-5 ${theme.teacherFallbackIconClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                        <span className="text-base font-medium text-[#424245]">{course.teachers?.name || '담당 선생님'}</span>
                      </div>
                      <span className={`text-xl font-bold ${theme.priceColorClass}`}>{formatPrice(course.price)}원</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className={`py-16 px-4 ${theme.ctaBgClass}`}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1d1d1f] mb-4">어떤 강의가 맞는지 모르겠다면?</h2>
          <p className="text-[#86868b] mb-6">무료 레벨테스트로 딱 맞는 강의를 추천받으세요!</p>
          <a
            href="/#consultation-form"
            className="inline-block px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-violet-400 to-purple-400 hover:from-violet-500 hover:to-purple-500 rounded-full transition-all shadow-lg shadow-violet-300/30"
          >
            무료 상담 신청하기
          </a>
        </div>
      </section>
    </main>
  );
}
