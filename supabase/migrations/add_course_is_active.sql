-- courses 테이블에 비활성화 컬럼 추가
-- 결제 이력이 있는 강의는 삭제 대신 비활성화(is_active=false)로만 처리
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN courses.is_active IS '강의 활성화 여부. 결제 이력이 있는 강의는 삭제 대신 false로 설정.';
