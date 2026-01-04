# 올라운더 홈 - 수강 신청 시스템

학부모가 학생 정보를 입력하면, 직원이 확인 후 수동으로 결제 및 수강 처리를 하는 시스템입니다.

## 기술 스택

- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript
- **스타일**: Tailwind CSS
- **데이터베이스**: Supabase

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`env.example` 파일을 `.env.local`로 복사하고 Supabase 정보를 입력합니다:

```bash
cp env.example .env.local
```

`.env.local` 파일을 열어 실제 Supabase URL과 API 키를 입력하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Supabase 테이블 생성

Supabase 대시보드의 SQL Editor에서 `schema.sql` 파일의 내용을 실행하세요.

### 4. 개발 서버 실행

```bash
npm run dev
```

## 페이지 구조

### 메인 페이지 (`/`)
- **용도**: 학부모용 수강 신청 폼
- **기능**: 수강생 이름과 학부모 연락처 입력 → DB 저장 → 완료 모달

### 관리자 페이지 (`/admin`)
- **용도**: 직원용 신청 관리
- **기능**: 
  - 신청 목록 조회 (실시간 업데이트)
  - 상태 변경 (신규 → 결제요청 → 결제완료 → 처리완료)
  - 메모 입력

## 데이터베이스 스키마

### students 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | Primary Key |
| created_at | timestamp | 신청 일시 |
| student_name | text | 수강생 이름 |
| parent_phone | text | 학부모 연락처 |
| status | text | 상태 (new, payment_requested, paid, completed) |
| memo | text | 관리자 메모 |

## 상태 흐름

```
신규(new) → 결제요청(payment_requested) → 결제완료(paid) → 처리완료(completed)
```

- **신규**: 학부모가 방금 신청함
- **결제요청**: 직원이 청구서 발송 완료
- **결제완료**: 결제 확인됨
- **처리완료**: 모든 처리 완료

## 운영 가이드

1. 학부모가 메인 페이지에서 수강 신청
2. 직원이 관리자 페이지에서 신규 신청 확인
3. 학생 이름을 결제선생에 입력
4. 학부모 연락처로 청구서 발송 후 상태를 '결제요청'으로 변경
5. 결제 확인 시 상태를 '결제완료'로 변경
6. 모든 처리 완료 시 상태를 '처리완료'로 변경



