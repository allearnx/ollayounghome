type TossHttpMethod = 'GET' | 'POST';

function getTossSecretKey() {
  const key = process.env.TOSS_SECRET_KEY;
  if (!key) {
    throw new Error('TOSS_SECRET_KEY is required');
  }
  return key;
}

function getAuthHeader() {
  const auth = Buffer.from(`${getTossSecretKey()}:`).toString('base64');
  return `Basic ${auth}`;
}

async function requestToss(path: string, method: TossHttpMethod, body?: unknown) {
  const response = await fetch(`https://api.tosspayments.com/v1${path}`, {
    method,
    headers: {
      Authorization: getAuthHeader(),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await response.json();
  return { ok: response.ok, status: response.status, data };
}

export async function confirmTossPayment(input: { paymentKey: string; orderId: string; amount: number }) {
  return requestToss('/payments/confirm', 'POST', input);
}

export async function cancelTossPayment(paymentKey: string, input: Record<string, unknown>) {
  return requestToss(`/payments/${paymentKey}/cancel`, 'POST', input);
}

export async function inquireTossPayment(paymentKey: string) {
  return requestToss(`/payments/${paymentKey}`, 'GET');
}
