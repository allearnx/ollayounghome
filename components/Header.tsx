'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

// 드롭다운이 있는 메뉴와 일반 메뉴를 구분
const menuItems = [
  { 
    label: '올라운더영어 소개', 
    href: '#',
    hasDropdown: true,
    dropdownItems: [
      { label: '올라영 소개', href: '/about' },
      { label: '커리큘럼', href: '/curriculum' },
    ]
  },
  { label: '시간표', href: '/schedule', hasDropdown: false },
  { label: '선생님 소개', href: '/teachers', hasDropdown: false },
  { 
    label: '전체 강의', 
    href: '#',
    hasDropdown: true,
    dropdownItems: [
      { label: '문법', href: '/courses/grammar' },
      { label: '내신', href: '/courses/school_exam' },
      { label: '국제학교/유학생', href: '/courses/international' },
      { label: '올톡보카', href: '/courses/voca' },
      { label: '리딩', href: '/courses/reading' },
    ]
  },
  { 
    label: '학습운영센터', 
    href: '#',
    hasDropdown: true,
    dropdownItems: [
      { label: '수강후기', href: '/reviews' },
      { label: 'FAQ', href: '/faq' },
      { label: '자료실', href: 'https://cafe.naver.com/', isExternal: true },
    ]
  },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpenDropdown, setMobileOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-xl border-b border-gray-200/50' 
          : 'bg-white/50 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          {/* 로고 */}
          <a href="/" className="flex items-center flex-shrink-0">
            <Image
              src="/logo.png"
              alt="올라영"
              width={360}
              height={120}
              className="h-20 w-auto"
              priority
            />
          </a>

          {/* PC 메뉴 (lg 이상) - Apple Style */}
          <nav className="hidden lg:flex items-center gap-1">
            {menuItems.map((item) => (
              <div 
                key={item.label} 
                className="relative"
                onMouseEnter={() => item.hasDropdown && setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <a
                  href={item.hasDropdown ? '#' : item.href}
                  className="px-4 py-2 text-xl font-medium text-[#1d1d1f] hover:text-[#0071e3] transition-colors duration-200 flex items-center gap-1"
                  onClick={(e) => item.hasDropdown && e.preventDefault()}
                >
                  {item.label}
                  {item.hasDropdown && (
                    <svg 
                      className={`w-4 h-4 transition-transform duration-200 ${openDropdown === item.label ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </a>
                
                {/* PC 드롭다운 메뉴 */}
                {item.hasDropdown && item.dropdownItems && (
                  <div 
                    className={`absolute top-full left-0 mt-1 py-2 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-gray-100 min-w-[160px] transition-all duration-200 ${
                      openDropdown === item.label 
                        ? 'opacity-100 visible translate-y-0' 
                        : 'opacity-0 invisible -translate-y-2'
                    }`}
                  >
                    {item.dropdownItems.map((dropItem: { label: string; href: string; isExternal?: boolean }) => (
                      <a
                        key={dropItem.label}
                        href={dropItem.href}
                        target={dropItem.isExternal ? '_blank' : undefined}
                        rel={dropItem.isExternal ? 'noopener noreferrer' : undefined}
                        className="block px-4 py-2.5 text-base font-medium text-[#1d1d1f] hover:text-[#0071e3] hover:bg-gray-50 transition-colors text-center"
                      >
                        {dropItem.label}
                        {dropItem.isExternal && (
                          <svg className="inline-block w-3 h-3 ml-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        )}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {/* 올킬보카 강조 버튼 */}
            <a
              href="/allkill"
              className="ml-2 relative px-5 py-2.5 text-sm font-bold text-white rounded-full transition-all duration-200 shadow-lg hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #4DD9C0 100%)', boxShadow: '0 4px 20px rgba(167,139,250,0.4)' }}
            >
              <span className="absolute -top-2 -right-1 bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none">NEW</span>
              ✦ 올킬보카
            </a>
            {/* 올킬보카 시작하기 버튼 */}
            <a
              href="https://voca.allrounderenglish.co.kr/login"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 px-5 py-2.5 text-sm font-bold rounded-full transition-all duration-200 border-2"
              style={{ color: '#7C3AED', borderColor: '#A78BFA', background: 'white' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#F5F3FF'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'white'; }}
            >
              보카 시작하기
            </a>
            {/* 레벨테스트 버튼 */}
            <a
              href="/leveltest"
              className="ml-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-violet-400 to-purple-400 hover:from-violet-500 hover:to-purple-500 rounded-full transition-all duration-200 shadow-lg shadow-violet-300/30"
            >
              레벨테스트
            </a>
            {/* 로그인 버튼 */}
            <a
              href="https://learn.allrounderenglish.co.kr/start"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 px-5 py-2.5 text-sm font-medium text-[#1d1d1f] hover:text-[#0071e3] hover:bg-gray-100 rounded-full transition-all duration-200"
            >
              로그인
            </a>
          </nav>

          {/* 모바일 햄버거 버튼 (lg 미만) */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2.5 rounded-lg text-[#1d1d1f] hover:bg-gray-100 transition-all duration-200"
            aria-label="메뉴 열기"
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className={`block h-0.5 bg-[#1d1d1f] rounded-full transition-all duration-300 ${
                isMenuOpen ? 'rotate-45 translate-y-1.5' : ''
              }`} />
              <span className={`block h-0.5 bg-[#1d1d1f] rounded-full transition-all duration-300 ${
                isMenuOpen ? 'opacity-0' : ''
              }`} />
              <span className={`block h-0.5 bg-[#1d1d1f] rounded-full transition-all duration-300 ${
                isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
              }`} />
            </div>
          </button>
        </div>
      </div>

      {/* 모바일 드롭다운 메뉴 - Apple Style */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-out ${
          isMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="px-4 py-3 bg-white/95 backdrop-blur-xl border-t border-gray-100">
          {menuItems.map((item) => (
            <div key={item.label}>
              {item.hasDropdown ? (
                <>
                  <button
                    onClick={() => setMobileOpenDropdown(mobileOpenDropdown === item.label ? null : item.label)}
                    className="w-full flex items-center justify-between px-4 py-3 text-base font-medium text-[#1d1d1f] hover:text-[#0071e3] transition-colors"
                  >
                    {item.label}
                    <svg 
                      className={`w-4 h-4 transition-transform duration-200 ${mobileOpenDropdown === item.label ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {/* 모바일 서브메뉴 */}
                  <div className={`overflow-hidden transition-all duration-200 ${
                    mobileOpenDropdown === item.label ? 'max-h-60' : 'max-h-0'
                  }`}>
                    {item.dropdownItems?.map((dropItem: { label: string; href: string; isExternal?: boolean }) => (
                      <a
                        key={dropItem.label}
                        href={dropItem.href}
                        target={dropItem.isExternal ? '_blank' : undefined}
                        rel={dropItem.isExternal ? 'noopener noreferrer' : undefined}
                        className="block pl-8 pr-4 py-2.5 text-sm font-medium text-[#424245] hover:text-[#0071e3] transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {dropItem.label}
                        {dropItem.isExternal && (
                          <svg className="inline-block w-3 h-3 ml-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        )}
                      </a>
                    ))}
                  </div>
                </>
              ) : (
                <a
                  href={item.href}
                  className="block px-4 py-3 text-base font-medium text-[#1d1d1f] hover:text-[#0071e3] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              )}
            </div>
          ))}
          {/* 올킬보카 강조 버튼 (모바일) */}
          <a
            href="/allkill"
            className="relative block mt-3 px-4 py-3 text-base font-bold text-white text-center rounded-full transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #4DD9C0 100%)', boxShadow: '0 4px 20px rgba(167,139,250,0.4)' }}
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full leading-none whitespace-nowrap">NEW</span>
            ✦ 올킬보카
          </a>
          {/* 올킬보카 시작하기 버튼 (모바일) */}
          <a
            href="https://voca.allrounderenglish.co.kr/login"
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-3 px-4 py-3 text-base font-bold text-center rounded-full transition-all border-2"
            style={{ color: '#7C3AED', borderColor: '#A78BFA', background: 'white' }}
            onClick={() => setIsMenuOpen(false)}
          >
            올킬보카 시작하기
          </a>
          {/* 레벨테스트 버튼 */}
          <a
            href="/leveltest"
            className="block mt-3 px-4 py-3 text-base font-medium text-white text-center bg-gradient-to-r from-violet-400 to-purple-400 hover:from-violet-500 hover:to-purple-500 rounded-full transition-all shadow-lg shadow-violet-300/30"
            onClick={() => setIsMenuOpen(false)}
          >
            레벨테스트 신청하기
          </a>
          {/* 로그인 버튼 */}
          <a
            href="https://learn.allrounderenglish.co.kr/start"
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-3 px-4 py-3 text-base font-medium text-[#1d1d1f] text-center border border-gray-200 rounded-full hover:bg-gray-50 transition-all"
            onClick={() => setIsMenuOpen(false)}
          >
            로그인
          </a>
        </nav>
      </div>
    </header>
  );
}
