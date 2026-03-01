'use client';

import Header from '@/components/Header';

// 수업 타입 정의
type ClassType = 'grammar' | 'reading' | 'international' | 'hackers' | 'guhaeyoung' | 'voca';

interface ClassItem {
  name: string;
  subName?: string;
  time: string;
  teacher: string;
  isNew?: boolean;
  tags?: string[];
  type: ClassType;
}

interface ScheduleCell {
  classes: ClassItem[];
}

// 색상 매핑 (애플 스타일 - 왼쪽 컬러 바)
const typeColors: Record<ClassType, string> = {
  grammar: 'border-l-violet-500',
  reading: 'border-l-cyan-500',
  international: 'border-l-slate-500',
  hackers: 'border-l-emerald-500',
  guhaeyoung: 'border-l-amber-500',
  voca: 'border-l-rose-500',
};

const typeLabels: Record<ClassType, string> = {
  grammar: '문법',
  reading: '리딩',
  international: '국제',
  hackers: '문법',
  guhaeyoung: '문법',
  voca: '단어',
};

// 시간표 데이터
const scheduleData: Record<string, Record<string, ScheduleCell>> = {
  // 오전반
  'am-9': {
    '월': { classes: [] },
    '화': { classes: [] },
    '수': { classes: [] },
    '목': { classes: [] },
    '토': { classes: [
      { name: '해커스', subName: '중학영문법 1학년', time: '8:40-9:50', teacher: '유혜령 T', type: 'hackers' },
      { name: '리딩 4.0 해외반', time: '9:00-10:20', teacher: 'Jean T', isNew: true, tags: ['국제학교', '리딩'], type: 'reading' },
      { name: '구해영', subName: '중학영문법 Level 1', time: '9:00-10:20', teacher: '이다은 T', isNew: true, type: 'guhaeyoung' },
    ]},
    '일': { classes: [] },
  },
  'am-10': {
    '월': { classes: [] },
    '화': { classes: [] },
    '수': { classes: [] },
    '목': { classes: [] },
    '토': { classes: [
      { name: '중학 영문법', subName: '3800제 2학년', time: '10:00-11:20', teacher: '유혜령 T', isNew: true, type: 'grammar' },
    ]},
    '일': { classes: [] },
  },
  'am-11': {
    '월': { classes: [] },
    '화': { classes: [] },
    '수': { classes: [] },
    '목': { classes: [] },
    '토': { classes: [] },
    '일': { classes: [] },
  },
  // 오후반
  'pm-6': {
    '월': { classes: [] },
    '화': { classes: [
      { name: '리딩', time: '5:30-6:50', teacher: '안홍미 T', isNew: true, tags: ['리딩'], type: 'reading' },
    ]},
    '수': { classes: [
      { name: '구해영', subName: '중학영문법 Level 0', time: '6:30-7:50', teacher: '', isNew: true, type: 'guhaeyoung' },
    ]},
    '목': { classes: [
      { name: '해커스', subName: '중학영문법 2학년', time: '5:30-6:50', teacher: 'Jean T', type: 'hackers' },
    ]},
    '토': { classes: [] },
    '일': { classes: [] },
  },
  'pm-7': {
    '월': { classes: [
      { name: '해커스', subName: '중학영문법 2학년', time: '7:00-8:20', teacher: '안홍미 T', isNew: true, type: 'hackers' },
    ]},
    '화': { classes: [] },
    '수': { classes: [
      { name: '중학 영문법', subName: '3800제 3학년', time: '7:00-8:00', teacher: '안홍미 T', isNew: true, type: 'grammar' },
    ]},
    '목': { classes: [
      { name: '리딩 4.0 국내 A반', time: '7:00-8:20', teacher: 'Jean T', isNew: true, tags: ['리딩'], type: 'reading' },
    ]},
    '토': { classes: [] },
    '일': { classes: [
      { name: '구해영', subName: '독해 Level 3', time: '7:00-8:20', teacher: '황지환 T', isNew: true, type: 'reading' },
    ]},
  },
  'pm-8': {
    '월': { classes: [
      { name: 'Grammar Zone', subName: '고등 기본', time: '8:30-9:50', teacher: '안홍미 T', isNew: true, type: 'hackers' },
    ]},
    '화': { classes: [] },
    '수': { classes: [
      { name: 'G6 Writing', time: '8:30-9:40', teacher: 'Samuel T', isNew: true, tags: ['국제학교'], type: 'international' },
    ]},
    '목': { classes: [] },
    '토': { classes: [] },
    '일': { classes: [
      { name: '고2 모의고사', subName: '기출', time: '8:30-9:50', teacher: '황지환 T', isNew: true, type: 'reading' },
    ]},
  },
  'pm-9': {
    '월': { classes: [
      { name: '올톡보카', time: '9:00-10:00', teacher: '', type: 'voca' },
    ]},
    '화': { classes: [] },
    '수': { classes: [
      { name: '올톡보카', time: '9:00-10:00', teacher: '', type: 'voca' },
    ]},
    '목': { classes: [
      { name: '올톡보카', time: '9:00-10:00', teacher: '', type: 'voca' },
    ]},
    '토': { classes: [] },
    '일': { classes: [
      { name: '올톡보카', time: '9:00-10:00', teacher: '', type: 'voca' },
    ]},
  },
};

const days = ['월', '화', '수', '목', '토', '일'];
const amHours = ['9', '10', '11'];
const pmHours = ['6', '7', '8', '9'];

// 요일별 배경색 (아주 연한 파스텔)
const dayBgColors: Record<string, string> = {
  '월': 'bg-rose-50/50',
  '화': 'bg-amber-50/50',
  '수': 'bg-emerald-50/50',
  '목': 'bg-sky-50/50',
  '토': 'bg-violet-50/50',
  '일': 'bg-orange-50/50',
};

// 수업 카드 컴포넌트 (애플 스타일)
function ClassCard({ classItem }: { classItem: ClassItem }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 ${typeColors[classItem.type]} p-3 h-full hover:shadow-md transition-shadow`}>
      {/* 상단: NEW 뱃지 + 카테고리 */}
      <div className="flex items-center gap-2 mb-2">
        {classItem.isNew && (
          <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></span>
        )}
        <span className="text-[10px] font-medium text-[#86868b] uppercase tracking-wider">
          {typeLabels[classItem.type]}
          {classItem.tags?.includes('국제학교') && ' · 국제'}
        </span>
      </div>
      
      {/* 수업명 */}
      <p className="font-semibold text-[13px] text-[#1d1d1f] leading-snug">{classItem.name}</p>
      {classItem.subName && (
        <p className="font-medium text-[12px] text-[#424245] leading-snug">{classItem.subName}</p>
      )}
      
      {/* 시간 */}
      <p className="text-[11px] text-[#86868b] mt-2 font-medium">{classItem.time}</p>
      
      {/* 선생님 */}
      {classItem.teacher && (
        <p className="text-[11px] text-[#86868b] mt-0.5">{classItem.teacher}</p>
      )}
    </div>
  );
}

export default function SchedulePage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* 히어로 섹션 */}
      <section className="pt-32 pb-12 px-4 bg-gradient-to-b from-violet-50 to-white">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-black text-[#1d1d1f] mb-6 tracking-tight">
            수업 <span className="bg-gradient-to-r from-violet-600 via-purple-500 to-cyan-400 bg-clip-text text-transparent">시간표</span>
          </h1>
          <p className="text-xl text-[#424245] leading-relaxed">
            올라영의 실시간 온라인 수업 시간표를 확인하세요
          </p>
        </div>
      </section>

      {/* 시간표 테이블 */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto overflow-x-auto">
          <div className="min-w-[1200px] rounded-2xl shadow-lg overflow-hidden border border-gray-200">
            {/* 테이블 헤더 */}
            <div className="grid grid-cols-[100px_60px_1fr_1fr_1fr_1fr_3fr_1fr] bg-[#e8e8ed] border-b border-gray-200">
              <div className="p-4 font-bold text-center text-[#86868b] text-sm border-r border-gray-100"></div>
              <div className="p-4 font-bold text-center text-[#86868b] text-sm border-r border-gray-100"></div>
              {days.map((day) => (
                <div key={day} className="p-4 font-bold text-center text-[#1d1d1f] border-r border-gray-100 last:border-r-0 bg-[#e8e8ed]">{day}</div>
              ))}
            </div>

            {/* 오전반 */}
            <div className="grid grid-cols-[100px_60px_1fr_1fr_1fr_1fr_3fr_1fr]">
              {/* 오전반 레이블 */}
              <div className="row-span-3 bg-[#e8e8ed] flex items-center justify-center font-bold text-[#1d1d1f] border-b border-r border-gray-200">
                <div className="text-center">
                  <p className="text-[#1d1d1f]">오전반</p>
                  <p className="text-xs text-[#86868b] font-medium">(AM)</p>
                </div>
              </div>
              
              {amHours.map((hour, hourIdx) => (
                <div key={`am-${hour}`} className="contents">
                  <div className={`p-3 text-center font-semibold text-[#1d1d1f] border-b border-r border-gray-100 bg-[#fafafa] ${hourIdx === amHours.length - 1 ? 'border-b-2 border-b-gray-200' : ''}`}>
                    {hour}시
                  </div>
                  {days.map((day) => {
                    const cell = scheduleData[`am-${hour}`]?.[day];
                    const isSaturday = day === '토';
                    return (
                      <div 
                        key={`am-${hour}-${day}`} 
                        className={`p-2 border-b border-r border-gray-100 last:border-r-0 min-h-[120px] ${dayBgColors[day]} ${hourIdx === amHours.length - 1 ? 'border-b-2 border-b-gray-200' : ''}`}
                      >
                        {isSaturday ? (
                          <div className="grid grid-cols-3 gap-2 h-full">
                            {[0, 1, 2].map((slotIdx) => (
                              <div key={slotIdx}>
                                {cell?.classes[slotIdx] && (
                                  <ClassCard classItem={cell.classes[slotIdx]} />
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          cell?.classes.map((classItem, idx) => (
                            <ClassCard key={idx} classItem={classItem} />
                          ))
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* 오후반 */}
            <div className="grid grid-cols-[100px_60px_1fr_1fr_1fr_1fr_3fr_1fr]">
              {/* 오후반 레이블 */}
              <div className="row-span-4 bg-[#e8e8ed] flex items-center justify-center font-bold text-[#1d1d1f] border-r border-gray-200">
                <div className="text-center">
                  <p className="text-[#1d1d1f]">오후반</p>
                  <p className="text-xs text-[#86868b] font-medium">(PM)</p>
                </div>
              </div>
              
              {pmHours.map((hour, hourIdx) => (
                <div key={`pm-${hour}`} className="contents">
                  <div className={`p-3 text-center font-semibold text-[#1d1d1f] border-b border-r border-gray-100 bg-[#fafafa] ${hourIdx === pmHours.length - 1 ? 'border-b-0' : ''}`}>
                    {hour}시
                  </div>
                  {days.map((day) => {
                    const cell = scheduleData[`pm-${hour}`]?.[day];
                    const isSaturday = day === '토';
                    return (
                      <div 
                        key={`pm-${hour}-${day}`} 
                        className={`p-2 border-b border-r border-gray-100 last:border-r-0 min-h-[120px] ${dayBgColors[day]} ${hourIdx === pmHours.length - 1 ? 'border-b-0' : ''}`}
                      >
                        {isSaturday ? (
                          <div className="grid grid-cols-3 gap-2 h-full">
                            {[0, 1, 2].map((slotIdx) => (
                              <div key={slotIdx}>
                                {cell?.classes[slotIdx] && (
                                  <ClassCard classItem={cell.classes[slotIdx]} />
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          cell?.classes.map((classItem, idx) => (
                            <ClassCard key={idx} classItem={classItem} />
                          ))
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 범례 */}
        <div className="max-w-6xl mx-auto mt-8">
          <div className="flex flex-wrap gap-6 justify-center items-center">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-violet-500"></div>
              <span className="text-sm text-[#424245]">3800제</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-emerald-500"></div>
              <span className="text-sm text-[#424245]">해커스 / Grammar Zone</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-amber-500"></div>
              <span className="text-sm text-[#424245]">구해영</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-cyan-500"></div>
              <span className="text-sm text-[#424245]">리딩</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-rose-500"></div>
              <span className="text-sm text-[#424245]">단어</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-slate-500"></div>
              <span className="text-sm text-[#424245]">국제학교</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></div>
              <span className="text-sm text-[#424245]">신규 개설</span>
            </div>
          </div>
        </div>
      </section>

      {/* 수업 안내 */}
      <section className="py-16 px-4 bg-[#f5f5f7]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-[#1d1d1f] text-center mb-12">
            수업 <span className="text-violet-600">안내</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-8">
              <h3 className="text-xl font-bold text-[#1d1d1f] mb-4">⏰ 수업 시간</h3>
              <p className="text-[#424245] leading-relaxed">
                평일 오후 5시 ~ 10시<br />
                토요일 오전 9시 ~ 12시<br />
                <span className="text-sm text-[#86868b]">* 시간대는 상담 시 조율 가능</span>
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8">
              <h3 className="text-xl font-bold text-[#1d1d1f] mb-4">📚 수업 구성</h3>
              <p className="text-[#424245] leading-relaxed">
                주 1회 / 주 2회 선택 가능<br />
                수업 시간: 60분 ~ 90분<br />
                <span className="text-sm text-[#86868b]">* 레벨에 따라 상이</span>
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8">
              <h3 className="text-xl font-bold text-[#1d1d1f] mb-4">💻 수업 방식</h3>
              <p className="text-[#424245] leading-relaxed">
                Zoom 실시간 화상 수업<br />
                녹화 영상 다시보기 제공<br />
                <span className="text-sm text-[#86868b]">* 태블릿/PC 권장</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1d1d1f] mb-6">
            원하는 시간대가 있으신가요?
          </h2>
          <p className="text-lg text-[#424245] mb-8">
            상담을 통해 학생에게 맞는 시간대를 안내해드립니다.
          </p>
          <a
            href="/leveltest"
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
              <a href="/privacy" className="font-bold hover:underline hover:text-[#424245]">개인정보처리방침</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

