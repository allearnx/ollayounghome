type UnknownRecord = Record<string, unknown>;

export type TossWebhookSummary = {
  createdAt?: string;
  eventType?: string;
  mId?: string;
  orderId?: string;
  paymentKeyMasked?: string;
  status?: string;
  cancelStatus?: string;
  cancelAmount?: number;
  cancelCount?: number;
};

export function isProdRuntime(): boolean {
  // On Vercel, Preview deploys often run with NODE_ENV=production.
  // We only treat VERCEL_ENV=production as real production.
  const vercelEnv = (process.env.VERCEL_ENV || '').trim();
  if (vercelEnv) return vercelEnv === 'production';
  return process.env.NODE_ENV === 'production';
}

export function maskPaymentKey(paymentKey: unknown): string | undefined {
  if (typeof paymentKey !== 'string') return undefined;
  const v = paymentKey.trim();
  if (!v) return undefined;
  if (v.length <= 10) return `${v.slice(0, 2)}***${v.slice(-2)}`;
  return `${v.slice(0, 6)}***${v.slice(-4)}`;
}

export function summarizeTossWebhook(body: unknown): TossWebhookSummary {
  const b = (body && typeof body === 'object') ? (body as UnknownRecord) : {};
  const data = (b.data && typeof b.data === 'object') ? (b.data as UnknownRecord) : {};

  const cancels = Array.isArray(data.cancels) ? (data.cancels as unknown[]) : [];
  const latestCancel = cancels.length > 0 && typeof cancels[cancels.length - 1] === 'object'
    ? (cancels[cancels.length - 1] as UnknownRecord)
    : undefined;

  return {
    createdAt: typeof b.createdAt === 'string' ? b.createdAt : undefined,
    eventType: typeof b.eventType === 'string' ? b.eventType : undefined,
    mId: typeof data.mId === 'string' ? data.mId : undefined,
    orderId: typeof data.orderId === 'string' ? data.orderId : undefined,
    paymentKeyMasked: maskPaymentKey(data.paymentKey),
    status: typeof data.status === 'string' ? data.status : undefined,
    cancelStatus: latestCancel && typeof latestCancel.cancelStatus === 'string' ? (latestCancel.cancelStatus as string) : undefined,
    cancelAmount: latestCancel && typeof latestCancel.cancelAmount === 'number' ? (latestCancel.cancelAmount as number) : undefined,
    cancelCount: cancels.length || undefined,
  };
}

export function sanitizeTossWebhookPayload(body: unknown): unknown {
  // Always remove sensitive fields even in dev/preview logs.
  if (!body || typeof body !== 'object') return body;
  const b = body as UnknownRecord;
  const data = (b.data && typeof b.data === 'object') ? ({ ...(b.data as UnknownRecord) }) : undefined;

  if (data) {
    delete data.secret;
    delete data.card;
    delete data.checkout;
    delete data.receipt;
    // cancels can contain user-provided reason; keep only counts/status summary
    if (Array.isArray(data.cancels)) {
      const cancels = data.cancels as unknown[];
      const last = cancels.length > 0 && typeof cancels[cancels.length - 1] === 'object'
        ? (cancels[cancels.length - 1] as UnknownRecord)
        : undefined;
      data.cancels = [
        {
          cancelStatus: last?.cancelStatus,
          cancelAmount: last?.cancelAmount,
        },
      ];
    }
  }

  return {
    ...b,
    ...(data ? { data } : {}),
  };
}

export function logTossWebhookReceived(body: unknown) {
  const summary = summarizeTossWebhook(body);
  if (isProdRuntime()) {
    console.info(
      JSON.stringify({
        msg: 'toss_webhook_received',
        ...summary,
      })
    );
  } else {
    console.info('toss_webhook_received', {
      summary,
      payload: sanitizeTossWebhookPayload(body),
    });
  }
}

export function logTossWebhookResult(body: unknown, result: string, extra?: UnknownRecord) {
  const summary = summarizeTossWebhook(body);
  const payload: UnknownRecord = {
    msg: 'toss_webhook_result',
    result,
    ...summary,
    ...(extra ? { extra } : {}),
  };
  console.info(JSON.stringify(payload));
}

export function logTossWebhookError(body: unknown, error: unknown, extra?: UnknownRecord) {
  const summary = summarizeTossWebhook(body);
  const err =
    error instanceof Error
      ? { name: error.name, message: error.message }
      : { message: String(error) };
  console.error(
    JSON.stringify({
      msg: 'toss_webhook_error',
      ...summary,
      err,
      ...(extra ? { extra } : {}),
    })
  );
}

