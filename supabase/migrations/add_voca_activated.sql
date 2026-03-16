-- payments 테이블에 올킬보카 계정 활성화 추적 컬럼 추가
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS voca_activated BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS voca_activated_at TIMESTAMPTZ;

COMMENT ON COLUMN payments.voca_activated IS '올킬보카 계정 자동 생성 성공 여부 (Allkill 상품에만 해당)';
COMMENT ON COLUMN payments.voca_activated_at IS '올킬보카 계정 활성화 완료 시각';
