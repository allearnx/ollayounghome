import { createClient } from '@supabase/supabase-js';

const FALLBACK_SUPABASE_URL = 'https://jtsfnnruhykytwsghtvx.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0c2ZubnJ1aHlreXR3c2dodHZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyNTU2NTYsImV4cCI6MjA4MjgzMTY1Nn0.CQ8U_urOADw2Nx1u45lh6dUqHqB9tuMcx7HloXp7VC4';

const normalize = (v: string | undefined) => (v ?? '').trim();
const looksLikeSupabaseUrl = (v: string) =>
  /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(v);

const envSupabaseUrl = normalize(process.env.NEXT_PUBLIC_SUPABASE_URL);
const envSupabaseAnonKey = normalize(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// 환경변수가 잘못 들어가도 앱이 무한로딩에 빠지지 않도록 최소 검증 후 fallback 사용
const supabaseUrl = looksLikeSupabaseUrl(envSupabaseUrl)
  ? envSupabaseUrl.replace(/\/$/, '')
  : FALLBACK_SUPABASE_URL;
const supabaseAnonKey = envSupabaseAnonKey || FALLBACK_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 사용자 역할 타입 정의
export type UserRole = 'admin' | 'staff';

// 프로필 데이터 타입 정의
export interface Profile {
  id: string;
  created_at: string;
  updated_at: string;
  email: string;
  role: UserRole;
}

// 역할 라벨 매핑
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: '관리자',
  staff: '스태프',
};

// 학생 데이터 타입 정의
export interface Student {
  id: string;
  created_at: string;
  student_name: string;
  grade: string;
  parent_phone: string;
  status: 'new' | 'payment_requested' | 'paid' | 'completed';
  memo: string;
}

// 선생님 데이터 타입 정의
export interface Teacher {
  id: string;
  created_at: string;
  name: string;
  bio: string;
  image_url: string;
  image_position: string; // 'top', 'center', 'bottom'
}

// 이미지 위치 옵션
export const IMAGE_POSITION_OPTIONS = [
  { value: 'top', label: '상단' },
  { value: 'center', label: '중앙' },
  { value: 'bottom', label: '하단' },
];

// 강의 카테고리 타입
export type CourseCategory = 'grammar' | 'school_exam' | 'international' | 'voca';

// 강의 데이터 타입 정의
export interface Course {
  id: string;
  created_at: string;
  title: string;
  category: CourseCategory;
  description: string;
  price: number;
  thumbnail_url: string;
  detail_image_url: string;
  teacher_id: string | null;
}

// 강의 + 선생님 정보 (조인된 데이터)
export interface CourseWithTeacher extends Course {
  teacher: Teacher | null;
}

// 카테고리 라벨 매핑
export const CATEGORY_LABELS: Record<CourseCategory, string> = {
  grammar: '문법',
  school_exam: '내신',
  international: '국제학교/유학생',
  voca: '올톡보카',
};

// 상태 라벨 매핑
export const STATUS_LABELS: Record<Student['status'], string> = {
  new: '신규',
  payment_requested: '결제요청',
  paid: '결제완료',
  completed: '처리완료',
};

// 학년 옵션
export const GRADE_OPTIONS = [
  { value: 'elementary_4', label: '초등 4학년', short: '초4' },
  { value: 'elementary_5', label: '초등 5학년', short: '초5' },
  { value: 'elementary_6', label: '초등 6학년', short: '초6' },
  { value: 'middle_1', label: '중등 1학년', short: '중1' },
  { value: 'middle_2', label: '중등 2학년', short: '중2' },
  { value: 'middle_3', label: '중등 3학년', short: '중3' },
];

// 학년 값으로 짧은 라벨 가져오기
export const getGradeShortLabel = (gradeValue: string): string => {
  const grade = GRADE_OPTIONS.find(g => g.value === gradeValue);
  return grade ? grade.short : gradeValue;
};

// 수강후기 데이터 타입 정의
export interface Review {
  id: string;
  created_at: string;
  grade: string;           // 학년 (예: "중2", "고1")
  course_name: string;     // 수강 과정 (예: "내신 문법반")
  content: string;         // 후기 내용
  achievement?: string;    // 성과 (선택, 예: "중간고사 100점!")
  display_order: number;
  is_visible: boolean;
}// 후기용 학년 옵션 (간단한 표시용)
export const REVIEW_GRADE_OPTIONS = [
  '초4', '초5', '초6',
  '중1', '중2', '중3',
  '고1', '고2', '고3',
];// FAQ 카테고리 타입
export type FAQCategory = 'general' | 'enrollment' | 'payment' | 'refund';// FAQ 데이터 타입 정의
export interface FAQ {
  id: string;
  created_at: string;
  question: string;
  answer: string;
  category: FAQCategory;
  display_order: number;
  is_visible: boolean;
}// FAQ 카테고리 라벨 매핑
export const FAQ_CATEGORY_LABELS: Record<FAQCategory, string> = {
  general: '일반',
  enrollment: '수강신청',
  payment: '결제문의',
  refund: '환불',
};
