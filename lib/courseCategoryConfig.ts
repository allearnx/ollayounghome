import type { CourseCategory } from '@/lib/domain';

export type CategoryPageTheme = {
  englishTitle: string;
  highlightedTitle: string;
  titleSuffix?: string;
  description: string;
  heroBgClass: string;
  heroTitleGradientClass: string;
  loadingColorClass: string;
  badgeColorClass: string;
  cardHoverTextClass: string;
  teacherBorderClass: string;
  teacherFallbackBgClass: string;
  teacherFallbackIconClass: string;
  priceColorClass: string;
  emptyBgClass: string;
  emptyIconClass: string;
  ctaBgClass: string;
};

export const CATEGORY_PAGE_CONFIG: Record<CourseCategory, CategoryPageTheme> = {
  grammar: {
    englishTitle: 'Grammar Course',
    highlightedTitle: '문법',
    titleSuffix: ' 강의',
    description: '체계적인 문법 학습으로 영어의 기초를 완성하세요',
    heroBgClass: 'from-violet-50 to-white',
    heroTitleGradientClass: 'from-violet-600 via-purple-500 to-cyan-400',
    loadingColorClass: 'text-violet-500',
    badgeColorClass: 'bg-violet-500',
    cardHoverTextClass: 'group-hover:text-violet-600',
    teacherBorderClass: 'border-violet-100',
    teacherFallbackBgClass: 'bg-violet-100',
    teacherFallbackIconClass: 'text-violet-500',
    priceColorClass: 'text-violet-600',
    emptyBgClass: 'bg-violet-100',
    emptyIconClass: 'text-violet-400',
    ctaBgClass: 'bg-violet-50',
  },
  voca: {
    englishTitle: 'Vocabulary Course',
    highlightedTitle: '올톡보카',
    description: '실시간 소통으로 완성하는 어휘력',
    heroBgClass: 'from-rose-50 to-white',
    heroTitleGradientClass: 'from-rose-500 via-pink-500 to-orange-400',
    loadingColorClass: 'text-rose-500',
    badgeColorClass: 'bg-rose-500',
    cardHoverTextClass: 'group-hover:text-rose-600',
    teacherBorderClass: 'border-rose-100',
    teacherFallbackBgClass: 'bg-rose-100',
    teacherFallbackIconClass: 'text-rose-500',
    priceColorClass: 'text-rose-600',
    emptyBgClass: 'bg-rose-100',
    emptyIconClass: 'text-rose-400',
    ctaBgClass: 'bg-rose-50',
  },
  reading: {
    englishTitle: 'Reading Course',
    highlightedTitle: '리딩',
    titleSuffix: ' 강의',
    description: '독해력과 읽기 능력을 한 단계 높여주는 리딩 수업',
    heroBgClass: 'from-amber-50 to-white',
    heroTitleGradientClass: 'from-amber-600 via-orange-500 to-yellow-400',
    loadingColorClass: 'text-amber-500',
    badgeColorClass: 'bg-amber-500',
    cardHoverTextClass: 'group-hover:text-amber-600',
    teacherBorderClass: 'border-amber-100',
    teacherFallbackBgClass: 'bg-amber-100',
    teacherFallbackIconClass: 'text-amber-500',
    priceColorClass: 'text-amber-600',
    emptyBgClass: 'bg-amber-100',
    emptyIconClass: 'text-amber-400',
    ctaBgClass: 'bg-amber-50',
  },
  school_exam: {
    englishTitle: 'School Exam Course',
    highlightedTitle: '내신',
    titleSuffix: ' 강의',
    description: '내신 영어 만점을 향한 체계적인 학습',
    heroBgClass: 'from-emerald-50 to-white',
    heroTitleGradientClass: 'from-emerald-600 via-teal-500 to-cyan-400',
    loadingColorClass: 'text-emerald-500',
    badgeColorClass: 'bg-emerald-500',
    cardHoverTextClass: 'group-hover:text-emerald-600',
    teacherBorderClass: 'border-emerald-100',
    teacherFallbackBgClass: 'bg-emerald-100',
    teacherFallbackIconClass: 'text-emerald-500',
    priceColorClass: 'text-emerald-600',
    emptyBgClass: 'bg-emerald-100',
    emptyIconClass: 'text-emerald-400',
    ctaBgClass: 'bg-emerald-50',
  },
  international: {
    englishTitle: 'International School & Study Abroad',
    highlightedTitle: '국제학교/유학생',
    titleSuffix: ' 강의',
    description: '국제학교 재학생과 해외 유학생을 위한 맞춤형 영어 수업',
    heroBgClass: 'from-sky-50 to-white',
    heroTitleGradientClass: 'from-sky-600 via-blue-500 to-indigo-400',
    loadingColorClass: 'text-sky-500',
    badgeColorClass: 'bg-sky-500',
    cardHoverTextClass: 'group-hover:text-sky-600',
    teacherBorderClass: 'border-sky-100',
    teacherFallbackBgClass: 'bg-sky-100',
    teacherFallbackIconClass: 'text-sky-500',
    priceColorClass: 'text-sky-600',
    emptyBgClass: 'bg-sky-100',
    emptyIconClass: 'text-sky-400',
    ctaBgClass: 'bg-sky-50',
  },
};

export function isCourseCategory(value: string): value is CourseCategory {
  return value in CATEGORY_PAGE_CONFIG;
}
