-- ============================================
-- 올킬보카 결제 후 계정 자동 생성을 위한 마이그레이션
-- ============================================

-- 1. payments 테이블에 customer_email 컬럼 추가
ALTER TABLE payments ADD COLUMN IF NOT EXISTS customer_email TEXT;

-- 2. voca 유저 테이블 생성 (Supabase Auth 연동)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,  -- Supabase Auth user id
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE users FROM anon;
REVOKE ALL ON TABLE users FROM authenticated;

-- 3. 서비스 활성화 테이블 생성
CREATE TABLE IF NOT EXISTS service_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service TEXT NOT NULL CHECK (service IN ('voca')),
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    source TEXT DEFAULT 'subscription' CHECK (source IN ('subscription', 'manual')),
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE  -- NULL = 만료 없음
);

CREATE INDEX IF NOT EXISTS idx_service_assignments_student_id ON service_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_service_assignments_service ON service_assignments(service);

ALTER TABLE service_assignments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE service_assignments FROM anon;
REVOKE ALL ON TABLE service_assignments FROM authenticated;
