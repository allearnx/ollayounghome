const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

export async function sendTelegramMessage(text: string): Promise<void> {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!process.env.TELEGRAM_BOT_TOKEN || !chatId) {
    console.warn('[Telegram] 환경변수 미설정 — 알림 건너뜀');
    return;
  }

  try {
    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error('[Telegram] 전송 실패:', err);
    }
  } catch (e) {
    console.error('[Telegram] 네트워크 오류:', e);
  }
}

export function buildPaymentNotification({
  courseName,
  customerName,
  customerPhone,
  customerEmail,
  amount,
  method,
  approvedAt,
  orderId,
}: {
  courseName: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  amount: number;
  method: string;
  approvedAt: string;
  orderId: string;
}): string {
  const dateStr = new Date(approvedAt).toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });

  return [
    `✅ <b>결제 완료</b>`,
    ``,
    `📚 강의: ${courseName}`,
    `👤 이름: ${customerName}`,
    `📱 연락처: ${customerPhone}`,
    `📧 이메일: ${customerEmail}`,
    `💰 금액: ₩${amount.toLocaleString()}`,
    `💳 결제 방법: ${method}`,
    `🕐 결제 시각: ${dateStr}`,
    `🔑 주문번호: <code>${orderId}</code>`,
  ].join('\n');
}
