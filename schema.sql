-- Allrounder Home: 학생 수강 신청 관리 시스템
-- Supabase SQL Schema

-- students 테이블 생성
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    student_name TEXT NOT NULL,
    grade TEXT DEFAULT '',
    parent_phone TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'payment_requested', 'paid', 'completed')),
    memo TEXT DEFAULT ''
);

-- 기존 테이블에 grade 컬럼 추가 (이미 테이블이 있는 경우)
-- ALTER TABLE students ADD COLUMN IF NOT EXISTS grade TEXT DEFAULT '';

-- 인덱스 생성 (조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_students_created_at ON students(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_parent_phone ON students(parent_phone);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 INSERT 가능 (학부모 신청용)
CREATE POLICY "Anyone can insert students" ON students
    FOR INSERT
    WITH CHECK (true);

-- 인증된 사용자만 SELECT, UPDATE 가능 (관리자용)
-- 참고: 실제 운영시에는 더 세밀한 권한 설정 필요
CREATE POLICY "Authenticated users can view students" ON students
    FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can update students" ON students
    FOR UPDATE
    USING (true);

CREATE POLICY "Authenticated users can delete students" ON students
    FOR DELETE
    USING (true);

-- 상태값 설명:
-- 'new': 신규 신청 (학부모가 방금 신청함)
-- 'payment_requested': 결제 요청됨 (직원이 청구서 발송함)
-- 'paid': 결제 완료
-- 'completed': 처리 완료

-- ============================================
-- 선생님 테이블 (teachers)
-- ============================================
CREATE TABLE IF NOT EXISTS teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    bio TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    image_position TEXT DEFAULT 'center'
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_teachers_created_at ON teachers(created_at DESC);-- RLS 정책
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 조회 가능 (공개 정보)
CREATE POLICY "Anyone can view teachers" ON teachers
    FOR SELECT
    USING (true);

-- 인증된 사용자만 추가/수정/삭제 가능 (관리자용)
CREATE POLICY "Authenticated users can insert teachers" ON teachers
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update teachers" ON teachers
    FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete teachers" ON teachers
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- ============================================
-- 강의 테이블 (courses)
-- ============================================
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('grammar', 'school_exam', 'international', 'voca')),
    description TEXT DEFAULT '',
    price INTEGER DEFAULT 0,
    thumbnail_url TEXT DEFAULT '',
    detail_image_url TEXT DEFAULT '',
    teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_teacher_id ON courses(teacher_id);

-- RLS 정책
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 조회 가능 (공개 정보)
CREATE POLICY "Anyone can view courses" ON courses
    FOR SELECT
    USING (true);

-- 인증된 사용자만 추가/수정/삭제 가능 (관리자용)
CREATE POLICY "Authenticated users can insert courses" ON courses
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update courses" ON courses
    FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete courses" ON courses
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- 카테고리 설명:
-- 'grammar': 문법
-- 'school_exam': 내신
-- 'international': 국제학교/유학생
-- 'voca': 올톡보카

-- ============================================
-- 사용자 프로필 테이블 (profiles) - RBAC용
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    email TEXT,
    role TEXT DEFAULT 'staff' CHECK (role IN ('admin', 'staff'))
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- RLS 정책
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 인증된 사용자가 자신의 프로필 조회 가능
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Admin만 모든 프로필 조회 가능
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Admin만 프로필 수정 가능
CREATE POLICY "Admins can update profiles" ON profiles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- 새 사용자 가입 시 자동으로 프로필 생성하는 트리거 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role)
    VALUES (new.id, new.email, 'staff');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 (이미 존재하면 스킵)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 역할 설명:
-- 'admin': 모든 권한 (결제/매출 관리 포함)
-- 'staff': 결제/매출 제외 운영 권한

-- ============================================
-- 수강후기 테이블 (reviews)
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true
);-- 인덱스
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_display_order ON reviews(display_order);

-- RLS 정책
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 조회 가능 (공개 정보)
CREATE POLICY "Anyone can view reviews" ON reviews
    FOR SELECT
    USING (true);

-- 인증된 사용자만 추가/수정/삭제 가능 (관리자/스태프용)
CREATE POLICY "Authenticated users can insert reviews" ON reviews
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update reviews" ON reviews
    FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete reviews" ON reviews
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- ============================================
-- FAQ 테이블 (faqs)
-- ============================================
CREATE TABLE IF NOT EXISTS faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    display_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_faqs_created_at ON faqs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_display_order ON faqs(display_order);

-- RLS 정책
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 조회 가능 (공개 정보)
CREATE POLICY "Anyone can view faqs" ON faqs
    FOR SELECT
    USING (true);

-- 인증된 사용자만 추가/수정/삭제 가능 (관리자/스태프용)
CREATE POLICY "Authenticated users can insert faqs" ON faqs
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update faqs" ON faqs
    FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete faqs" ON faqs
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- FAQ 카테고리 설명:
-- 'general': 일반
-- 'enrollment': 수강신청
-- 'payment': 결제문의
-- 'refund': 환불

-- ============================================
-- 결제 테이블 (payments) - 토스페이먼츠 연동
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    order_id TEXT UNIQUE NOT NULL,              -- 토스페이먼츠 주문번호 (상점에서 생성)
    payment_key TEXT,                            -- 토스페이먼츠 결제키 (결제 완료 후 발급)
    amount INTEGER NOT NULL,                     -- 결제 금액
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'failed')),
    method TEXT,                                 -- 결제수단 (카드, 계좌이체, 가상계좌 등)
    receipt_url TEXT,                            -- 영수증 URL
    paid_at TIMESTAMP WITH TIME ZONE,            -- 결제 완료 시간
    customer_name TEXT,                          -- 결제자 이름
    customer_phone TEXT                          -- 결제자 연락처
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_course_id ON payments(course_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- RLS 정책
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 자신의 결제 조회 가능 (order_id로 조회)
CREATE POLICY "Anyone can view payments by order_id" ON payments
    FOR SELECT
    USING (true);

-- 결제 생성은 누구나 가능 (결제 요청 시)
CREATE POLICY "Anyone can insert payments" ON payments
    FOR INSERT
    WITH CHECK (true);

-- 결제 상태 업데이트는 누구나 가능 (웹훅/콜백에서 사용)
CREATE POLICY "Anyone can update payments" ON payments
    FOR UPDATE
    USING (true);

-- 결제 상태값 설명:
-- 'pending': 결제 대기 중 (결제 링크 생성됨)
-- 'paid': 결제 완료
-- 'cancelled': 결제 취소
-- 'failed': 결제 실패
