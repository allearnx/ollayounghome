import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

