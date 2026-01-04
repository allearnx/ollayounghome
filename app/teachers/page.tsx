'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { supabase, Teacher } from '@/lib/supabase';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeachers = async () => {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching teachers:', error);
      } else {
        setTeachers(data || []);
      }
      setIsLoading(false);
    };

    fetchTeachers();
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      {/* 히어로 섹션 */}
      <section className="pt-36 pb-16 px-4 bg-gradient-to-b from-violet-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#86868b] text-lg mb-4">Our Teachers</p>
          <h1 className="text-4xl md:text-6xl font-black text-[#1d1d1f] tracking-tight">
            <span className="bg-gradient-to-r from-violet-600 via-purple-500 to-cyan-400 bg-clip-text text-transparent">올라영</span> 선생님
          </h1>
          <p className="text-xl text-[#86868b] mt-6">
            학생의 성장을 함께하는 최고의 선생님들을 소개합니다
          </p>
        </div>
      </section>

      {/* 선생님 목록 */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <svg className="animate-spin h-10 w-10 text-violet-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : teachers.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-violet-100 rounded-full mb-6">
                <svg className="w-10 h-10 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#1d1d1f] mb-2">선생님 정보 준비 중</h2>
              <p className="text-[#86868b]">곧 멋진 선생님들을 소개해드릴게요!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teachers.map((teacher) => (
                <a
                  key={teacher.id}
                  href={`/teachers/${teacher.id}`}
                  className="group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                >
                  {/* 프로필 이미지 */}
                  <div className="aspect-[4/5] bg-gradient-to-br from-violet-100 via-purple-50 to-cyan-50 relative overflow-hidden">
                    {teacher.image_url ? (
                      <img 
                        src={teacher.image_url} 
                        alt={teacher.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        style={{ objectPosition: teacher.image_position || 'center' }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-32 h-32 text-violet-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                    {/* 그라데이션 오버레이 */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  {/* 정보 */}
                  <div className="p-6">
                    <h3 className="text-2xl font-black text-[#1d1d1f] group-hover:text-violet-600 transition-colors">
                      {teacher.name}
                    </h3>
                    {teacher.bio && (
                      <p className="text-[#86868b] mt-3 line-clamp-2 leading-relaxed">{teacher.bio}</p>
                    )}
                    
                    {/* 더보기 화살표 */}
                    <div className="mt-4 flex items-center text-violet-500 font-medium text-sm group-hover:text-violet-600">
                      <span>프로필 보기</span>
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-violet-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1d1d1f] mb-4">
            올라영 선생님과 함께 시작하세요
          </h2>
          <p className="text-[#86868b] mb-6">
            무료 상담을 통해 학생에게 맞는 선생님을 만나보세요!
          </p>
          <a
            href="/#consultation-form"
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
              <a href="/privacy" className="hover:underline hover:text-[#424245]">개인정보처리방침</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

