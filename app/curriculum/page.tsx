'use client';

import Header from '@/components/Header';
import Image from 'next/image';
import { useState } from 'react';

// 문법 커리큘럼 데이터
const grammarCurriculum = [
  {
    level: '초등',
    color: 'bg-violet-400',
    gradeColor: 'bg-violet-100',
    courseBg: 'bg-violet-50/50',
    grades: [
      {
        grade: '초5~6',
        courses: [
          { name: '구해영 중학 영문법', detail: '레벨 0' },
          { name: '구해영 중학 영문법', detail: '레벨 1' },
        ]
      }
    ]
  },
  {
    level: '중등',
    color: 'bg-purple-500',
    gradeColor: 'bg-purple-100',
    courseBg: 'bg-purple-50/50',
    grades: [
      {
        grade: '중1',
        courses: [
          { name: '해커스 중학영문법', detail: '중1' },
          { name: '중학영문법 3800제', detail: '중1' },
        ]
      },
      {
        grade: '중2',
        courses: [
          { name: '해커스 중학영문법', detail: '중2' },
          { name: '중학영문법 3800제', detail: '중2' },
        ]
      },
      {
        grade: '중3',
        courses: [
          { name: '해커스 중학 영문법', detail: '중3' },
          { name: '중학영문법 3800제', detail: '중3' },
        ]
      }
    ]
  },
  {
    level: '고등',
    color: 'bg-indigo-500',
    gradeColor: 'bg-indigo-100',
    courseBg: 'bg-indigo-50/50',
    grades: [
      {
        grade: '고1',
        courses: [
          { name: 'Grammar Zone', detail: '고교 기본' },
          { name: 'Grammar Zone', detail: '고교 필수' },
        ]
      }
    ]
  },
];

// 탭 데이터
const tabs = [
  { id: 'grammar', label: '문법', englishLabel: 'Grammar' },
  { id: 'vocabulary', label: '단어', englishLabel: 'Vocabulary', comingSoon: true },
  { id: 'reading', label: '리딩', englishLabel: 'Reading', comingSoon: true },
];

export default function CurriculumPage() {
  const [activeTab, setActiveTab] = useState('grammar');

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      {/* 히어로 섹션 */}
      <section className="pt-36 pb-8 px-4 bg-gradient-to-b from-violet-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-black text-[#1d1d1f] mb-6 tracking-tight">
            올라영 <span className="bg-gradient-to-r from-violet-600 via-purple-500 to-cyan-400 bg-clip-text text-transparent">커리큘럼</span>
          </h1>
          <p className="text-xl text-[#86868b] leading-relaxed">
            체계적인 단계별 학습으로 영어 실력을 완성하세요
          </p>
        </div>
      </section>

      {/* 탭 네비게이션 */}
      <section className="py-8 px-4 bg-white sticky top-20 z-40 border-b border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => !tab.comingSoon && setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-full font-bold text-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-300/30'
                    : tab.comingSoon
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-[#424245] hover:bg-gray-200'
                }`}
                disabled={tab.comingSoon}
              >
                {tab.label}
                {tab.comingSoon && <span className="ml-2 text-xs">(준비중)</span>}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 문법 커리큘럼 */}
      {activeTab === 'grammar' && (
        <section className="py-16 px-4">
          <div className="max-w-[700px] mx-auto">
            {/* 섹션 타이틀 */}
            <div className="text-center mb-12">
              <p className="text-[#86868b] text-lg mb-2">Grammar Curriculum</p>
              <h2 className="text-3xl md:text-4xl font-black text-[#1d1d1f] tracking-tight">
                문법 커리큘럼
              </h2>
            </div>

            {/* 커리큘럼 테이블 */}
            <div className="rounded-3xl overflow-hidden border border-gray-200 shadow-lg">
              {grammarCurriculum.map((levelData) => (
                <div key={levelData.level} className="flex border-b border-gray-100 last:border-b-0">
                  {/* 레벨 (세로로 합쳐진 셀) */}
                  <div 
                    className={`${levelData.color} text-white font-bold text-xl w-20 md:w-24 flex items-center justify-center`}
                  >
                    {levelData.level}
                  </div>
                  
                  {/* 학년 + 강의 목록 */}
                  <div className="flex-1">
                    {levelData.grades.map((gradeData, gradeIndex) => (
                      <div 
                        key={gradeData.grade}
                        className={`flex ${gradeIndex !== levelData.grades.length - 1 ? 'border-b border-gray-100' : ''}`}
                      >
                        {/* 학년 */}
                        <div className={`${levelData.gradeColor} text-gray-700 font-bold text-lg w-20 md:w-28 flex items-center justify-center py-6`}>
                          {gradeData.grade}
                        </div>
                        
                        {/* 강의 목록 */}
                        <div className={`flex-1 ${levelData.courseBg}`}>
                          {gradeData.courses.map((course, courseIndex) => (
                            <div 
                              key={`${course.name}-${course.detail}`}
                              className={`flex items-center px-6 py-5 ${courseIndex !== gradeData.courses.length - 1 ? 'border-b border-gray-50' : ''}`}
                            >
                              <div className="flex-1">
                                <p className="text-[#1d1d1f] font-medium text-lg">{course.name}</p>
                                <p className="text-violet-600 font-bold">{course.detail}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            </div>
          
          {/* 문법 수업 특징 - 700px 컨테이너 밖으로 분리 */}
          <div className="mt-32 px-4">
            <h3 className="text-3xl md:text-4xl font-black text-[#1d1d1f] text-center mb-12">
              올라영 문법 수업의 <span className="text-violet-600">특징</span>
            </h3>
            
            <div className="max-w-[1400px] mx-auto grid md:grid-cols-3 gap-6">
              <div className="bg-[#f5f5f7] rounded-3xl p-10 md:p-12">
                <h4 className="text-xl md:text-2xl font-bold text-[#1d1d1f] mb-4">단계별 체계적 학습</h4>
                <p className="text-[#86868b] text-base md:text-lg leading-relaxed">학년과 수준에 맞는 교재로 기초부터 심화까지</p>
              </div>
              <div className="bg-[#f5f5f7] rounded-3xl p-10 md:p-12">
                <h4 className="text-xl md:text-2xl font-bold text-[#1d1d1f] mb-4">검증된 베스트셀러 교재</h4>
                <p className="text-[#86868b] text-base md:text-lg leading-relaxed">구해영, 해커스, Grammar Zone 등 검증된 교재 사용</p>
              </div>
              <div className="bg-[#f5f5f7] rounded-3xl p-10 md:p-12">
                <h4 className="text-xl md:text-2xl font-bold text-[#1d1d1f] mb-4">내신 + 수능 동시 대비</h4>
                <p className="text-[#86868b] text-base md:text-lg leading-relaxed">개념 이해부터 문제 풀이 전략까지 균형있게</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 단어/리딩 Coming Soon */}
      {(activeTab === 'vocabulary' || activeTab === 'reading') && (
        <section className="py-32 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-6xl mb-6">🚧</p>
            <h2 className="text-3xl font-bold text-[#1d1d1f] mb-4">준비 중입니다</h2>
            <p className="text-[#86868b]">곧 업데이트될 예정입니다!</p>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 px-4 bg-[#f5f5f7]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1d1d1f] mb-6">
            어떤 강의가 맞는지 모르겠다면?
          </h2>
          <p className="text-lg text-[#86868b] mb-8">
            무료 레벨테스트로 딱 맞는 강의를 추천받으세요!
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
              <a href="/privacy" className="hover:underline hover:text-[#424245]">개인정보처리방침</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
