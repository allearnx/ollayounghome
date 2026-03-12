/**
 * 숫자를 한국식 천 단위 구분 포맷으로 반환합니다. (예: 1,000)
 */
export const formatPrice = (price: number): string =>
  new Intl.NumberFormat('ko-KR').format(price);

/**
 * 숫자를 ₩ 접두사와 함께 한국식 통화 포맷으로 반환합니다. (예: ₩1,000)
 */
export const formatKRW = (price: number): string =>
  `₩${new Intl.NumberFormat('ko-KR').format(price)}`;

/**
 * ISO 날짜 문자열을 "YYYY. MM. DD. HH:MM" 형식으로 반환합니다.
 * 결제 관리 등 숫자형 날짜가 필요한 곳에 사용합니다.
 */
export const formatDateTime = (dateString: string): string =>
  new Date(dateString).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

/**
 * ISO 날짜 문자열을 "YYYY년 M월 D일 오전/오후 HH:MM" 형식으로 반환합니다.
 * 결제 완료 등 사용자에게 보여주는 곳에 사용합니다.
 */
export const formatDateTimeLong = (dateString: string): string =>
  new Date(dateString).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

/**
 * ISO 날짜 문자열을 "YYYY-MM-DD HH:MM" 형식으로 반환합니다.
 * 테이블 등 컴팩트한 날짜 표시가 필요한 곳에 사용합니다.
 */
export const formatDateTimeShort = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};
