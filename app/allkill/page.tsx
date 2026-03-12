import type { Metadata } from 'next';
import { Nanum_Pen_Script, Montserrat } from 'next/font/google';
import Header from '@/components/Header';
import AllkillPayButton from '@/components/AllkillPayButton';

const nanumPen = Nanum_Pen_Script({ weight: ['400'], preload: false });
const montserrat = Montserrat({ weight: ['700', '900'], subsets: ['latin'], preload: false });

export const metadata: Metadata = {
  title: '올킬보카 | 수능 영어 단어, 이제 올킬',
  description: '7단계 학습 시스템으로 진짜 내 단어를 만드세요. AI 영작 채점, 학부모 리포트, 틀린 단어 집중 복습.',
};

const C = {
  lavender: '#A78BFA',
  lavenderDark: '#7C3AED',
  lavenderLight: '#F5F3FF',
  mint: '#4DD9C0',
  mintLight: '#D9F7FC',
  mintDark: '#0B7A6A',
  gray50: '#F9F8FF',
  gray400: '#9E97C8',
  gray600: '#5C5490',
  gray800: '#2D2760',
};

export default function AllkillPage() {
  return (
    <>
      <style suppressHydrationWarning>{`
        .allkill-montserrat { font-family: var(--font-montserrat), sans-serif; }
        .allkill-pen { font-family: 'Nanum Pen Script', cursive; }

        /* 가격 카드 반응형 */
        .allkill-price-plan-label { font-size: 16px; font-weight: 700; margin-bottom: 12px; }
        .allkill-price-amount { font-size: 52px; font-weight: 900; margin-bottom: 6px; }
        .allkill-price-amount-unit { font-size: 20px; font-weight: 500; }
        .allkill-price-discount { font-size: 15px; margin-bottom: 18px; }
        .allkill-price-notice { font-size: 14px; line-height: 1.6; padding: 12px 16px; border-radius: 10px; margin-bottom: 22px; }
        .allkill-price-feature { font-size: 16px; }
        .allkill-price-btn { width: 100%; padding: 16px; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; font-family: inherit; }
        .allkill-price-subtitle { font-size: 15px; margin-bottom: 28px; }
        @media (max-width: 768px) {
          .allkill-price-plan-label { font-size: 13px; }
          .allkill-price-amount { font-size: 36px; }
          .allkill-price-amount-unit { font-size: 15px; }
          .allkill-price-discount { font-size: 13px; }
          .allkill-price-notice { font-size: 12px; padding: 10px 14px; }
          .allkill-price-feature { font-size: 14px; }
          .allkill-price-btn { padding: 14px; font-size: 14px; }
          .allkill-price-subtitle { font-size: 13px; }
        }

        /* Bento 카드 반응형 */
        .allkill-bento-body { font-size: 15px; line-height: 1.75; }
        .allkill-bento-h3-lg { font-size: 24px; font-weight: 900; color: white; margin-bottom: 10px; }
        .allkill-bento-h3-md { font-size: 22px; font-weight: 900; color: white; margin-bottom: 10px; }
        .allkill-stat-label { font-size: 14px; letter-spacing: 0.3px; padding-top: 8px; border-top: 1px solid rgba(77,217,192,0.3); margin-top: 4px; white-space: nowrap; }
        @media (max-width: 768px) {
          .allkill-bento-body { font-size: 13px; }
          .allkill-bento-h3-lg { font-size: 19px; }
          .allkill-bento-h3-md { font-size: 17px; }
          .allkill-stat-label { font-size: 11px; }
        }

        /* 학부모/학생 카드 반응형 */
        .allkill-persona-tag { font-size: 13px; font-weight: 700; padding: 5px 14px; border-radius: 100px; display: inline-block; margin-bottom: 20px; }
        .allkill-persona-title { font-size: 26px; font-weight: 900; line-height: 1.4; margin-bottom: 12px; white-space: pre-line; }
        .allkill-persona-desc { font-size: 16px; line-height: 1.8; margin-bottom: 28px; white-space: pre-line; }
        .allkill-persona-point { font-size: 16px; }
        @media (max-width: 768px) {
          .allkill-persona-tag { font-size: 11px; padding: 4px 12px; }
          .allkill-persona-title { font-size: 20px; }
          .allkill-persona-desc { font-size: 14px; }
          .allkill-persona-point { font-size: 14px; }
        }

        /* 학습 흐름 카드 반응형 */
        .allkill-flow-num { width: 52px; height: 52px; font-size: 20px; }
        .allkill-flow-step-name { font-size: 18px; font-weight: 900; margin-bottom: 10px; white-space: nowrap; }
        .allkill-flow-pass { font-size: 13px; font-weight: 700; padding: 4px 12px; border-radius: 100px; display: inline-block; margin-bottom: 10px; }
        .allkill-flow-desc { font-size: 16px; line-height: 1.8; margin-top: 16px; padding-top: 16px; text-align: center; word-break: keep-all; }
        .allkill-flow-label-title { font-size: 22px; font-weight: 900; }
        .allkill-flow-round-badge { font-size: 18px; font-weight: 900; padding: 7px 20px; border-radius: 100px; }
        @media (max-width: 768px) {
          .allkill-flow-num { width: 40px; height: 40px; font-size: 15px; }
          .allkill-flow-step-name { font-size: 14px; }
          .allkill-flow-pass { font-size: 11px; padding: 3px 10px; }
          .allkill-flow-desc { font-size: 12px; }
          .allkill-flow-label-title { font-size: 17px; }
          .allkill-flow-round-badge { font-size: 14px; padding: 5px 14px; }
        }

        /* 수록 단어 — 비주얼 사이드 */
        .allkill-vocab-visual { display: flex; flex-direction: column; gap: 8px; flex-shrink: 0; }
        .allkill-vocab-pub-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; flex-shrink: 0; min-width: 200px; }
        @media (max-width: 768px) {
          .allkill-vocab-visual { display: none; }
          .allkill-vocab-pub-grid { display: none; }
        }

        /* 수록 단어 섹션 반응형 */
        .allkill-vocab-card-heading { font-size: 24px; font-weight: 700; color: white; }
        .allkill-vocab-badge { font-size: 16px; font-weight: 900; padding: 10px 22px; border-radius: 12px; }
        .allkill-vocab-chip { font-size: 15px; font-weight: 700; padding: 9px 22px; border-radius: 100px; white-space: nowrap; }
        .allkill-vocab-grade { font-size: 16px; font-weight: 900; min-width: 28px; }
        .allkill-vocab-years { font-size: 13px; white-space: nowrap; color: rgba(255,255,255,0.4); }
        .allkill-vocab-subtitle { font-size: 20px; font-weight: 700; color: white; margin-bottom: 8px; }
        .allkill-vocab-desc { font-size: 16px; color: rgba(255,255,255,0.5); line-height: 1.7; }

        .allkill-bento { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        .allkill-bento-span2 { grid-column: span 2; }
        .allkill-bento-span3 { grid-column: span 3; }
        .allkill-bento-card { transition: transform 0.25s, border-color 0.25s; }
        .allkill-bento-card:hover { transform: translateY(-6px); }
        .allkill-flow-1 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .allkill-flow-2 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .allkill-parent-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
        .allkill-stats-inner { display: flex; align-items: center; justify-content: space-between; gap: 40px; }
        .allkill-price-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; max-width: 800px; margin: 0 auto; }
        .allkill-vocab-bottom { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }

        .allkill-card:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(167,139,250,0.12); }
        .allkill-price-card:hover { transform: translateY(-4px); }
        .allkill-stat-item:hover { background: rgba(255,255,255,0.08) !important; transform: translateY(-4px); }
        .allkill-flow-card:hover { border-color: #A78BFA !important; transform: translateY(-4px); }
        .allkill-btn-white:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(0,0,0,0.18); }

        @media (max-width: 768px) {
          .allkill-hero-title { font-size: 40px !important; }
          .allkill-hero-desc { font-size: 32px !important; }
          .allkill-section { padding: 64px 20px !important; }
          .allkill-vocab-card-heading { font-size: 18px; }
          .allkill-vocab-badge { font-size: 14px; padding: 8px 18px; }
          .allkill-vocab-chip { font-size: 13px; padding: 7px 16px; }
          .allkill-vocab-grade { font-size: 13px; min-width: 24px; }
          .allkill-vocab-years { font-size: 11px; }
          .allkill-vocab-subtitle { font-size: 16px; }
          .allkill-vocab-desc { font-size: 14px; }
          .allkill-bento { grid-template-columns: repeat(2, 1fr); }
          .allkill-bento-span2, .allkill-bento-span3 { grid-column: span 2; }
          .allkill-flow-1 { grid-template-columns: repeat(2, 1fr) !important; }
          .allkill-flow-2 { grid-template-columns: 1fr 1fr !important; }
          .allkill-parent-grid { grid-template-columns: 1fr; }
          .allkill-stats-inner { flex-direction: column; align-items: flex-start; }
          .allkill-stats-nums { width: 100%; justify-content: space-between; gap: 10px; }
          .allkill-stat-item { padding: 20px 12px !important; flex: 1; }
          .allkill-stat-num { font-size: 28px !important; }
          .allkill-price-grid { grid-template-columns: 1fr; max-width: 100%; }
          .allkill-vocab-bottom { grid-template-columns: 1fr; }
          .allkill-round-label-desc { display: none; }
          .allkill-section-title { font-size: 26px !important; }
          .allkill-final-cta h2 { font-size: 28px !important; }
          .allkill-stats-text h2 { font-size: 24px !important; }
        }
        @media (max-width: 600px) {
          .allkill-bento { grid-template-columns: 1fr; }
          .allkill-bento-span2, .allkill-bento-span3 { grid-column: span 1; }
        }
        @media (max-width: 480px) {
          .allkill-flow-1 { grid-template-columns: 1fr !important; }
          .allkill-flow-2 { grid-template-columns: 1fr !important; }
          .allkill-hero-title { font-size: 32px !important; }
        }
      `}</style>

      <main style={{ fontFamily: "'Pretendard', sans-serif", background: '#ffffff', color: C.gray800, overflowX: 'hidden', ['--font-montserrat' as string]: montserrat.style.fontFamily }}>
        <Header />

        {/* ① 히어로 */}
        <section style={{ minHeight: '60vh', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 60px 80px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'rgba(167,139,250,0.06)', top: -200, right: -200, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(167,139,250,0.05)', bottom: -100, left: '10%', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', width: 150, height: 150, borderRadius: '50%', background: 'rgba(77,217,192,0.08)', top: '30%', left: '45%', pointerEvents: 'none' }} />

          <div style={{ maxWidth: 900, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: C.lavenderLight, border: `1.5px solid ${C.lavender}`, color: C.lavenderDark, fontSize: 15, fontWeight: 700, padding: '8px 20px', borderRadius: 100, marginBottom: 28, letterSpacing: '0.3px' }}>
              ✦ <span style={{ color: C.mintDark }}>올라영</span> × 올킬보카
            </div>

            <h1 className="allkill-hero-title" style={{ fontSize: 84, fontWeight: 900, color: C.gray800, lineHeight: 1.15, marginBottom: 24 }}>
              <span style={{ color: '#A78BFA' }}>올킬보카</span>만의 7단계 학습<br />
              <span style={{ color: '#A78BFA' }}>진짜 내 단어</span>로<br />
              만드세요.
            </h1>

            <p className="allkill-hero-desc" style={{ fontFamily: nanumPen.style.fontFamily, fontSize: 64, color: 'rgba(0,0,0,0.82)', lineHeight: 1.8, marginTop: 32, marginBottom: 40, textAlign: 'center' }}>
              방금 시험봤는데 돌아서면 대답을 못하는 아이들.<br />
              이제는 그만.
            </p>

          </div>
        </section>

        {/* ② WHY 올킬보카 — Dark Bento Grid */}
        <section id="why" className="allkill-section" style={{ padding: '96px 60px', background: '#0D1117', position: 'relative', overflow: 'hidden' }}>
          {/* Ambient glow */}
          <div style={{ position: 'absolute', top: -200, left: -150, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -200, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(77,217,192,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            {/* Header */}
            <div style={{ display: 'inline-block', background: 'rgba(167,139,250,0.12)', color: '#A78BFA', border: '1px solid rgba(167,139,250,0.25)', fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 100, marginBottom: 20, letterSpacing: '1px' }}>WHY 올킬보카</div>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 48px)', fontWeight: 900, color: 'white', lineHeight: 1.3, marginBottom: 12 }}>
              단어 공부,{' '}
              <span style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #4DD9C0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>이렇게 달라요</span>
            </h2>
            <p style={{ fontSize: 'clamp(15px, 1.4vw, 18px)', color: 'rgba(255,255,255,0.4)', lineHeight: 1.8, marginBottom: 48 }}>기존 단어장과는 다릅니다. 단계별 학습으로 진짜 내 단어를 만들어 드려요.</p>

            {/* Bento Grid — 4 columns */}
            <div className="allkill-bento">

              {/* Card 01 — 4단계 통과 시스템 (span 2) */}
              <div className="allkill-bento-card allkill-bento-span2" style={{ background: 'linear-gradient(135deg, rgba(77,217,192,0.07) 0%, rgba(77,217,192,0.02) 100%)', border: '1px solid rgba(77,217,192,0.18)', borderRadius: 24, padding: '40px 44px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -80, right: -80, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(77,217,192,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ display: 'inline-block', background: 'rgba(77,217,192,0.12)', color: '#4DD9C0', border: '1px solid rgba(77,217,192,0.25)', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 100, marginBottom: 24, letterSpacing: '0.8px' }}>PASS / FAIL 시스템</div>
                <div className="allkill-montserrat" style={{ fontSize: 88, fontWeight: 900, color: '#4DD9C0', lineHeight: 1, marginBottom: 6, textShadow: '0 0 48px rgba(77,217,192,0.35)' }}>7단계</div>
                <h3 className="allkill-bento-h3-lg">통과 시스템</h3>
                <p className="allkill-bento-body" style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 32, maxWidth: 380 }}>플래시카드 → 퀴즈 → 스펠링 → 매칭.<br />7단계를 모두 통과해야 진짜 내 단어가 됩니다.</p>
                {/* Mini step flow */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {[
                    { label: '플래시카드', active: false },
                    { label: '퀴즈 80%', active: false },
                    { label: '스펠링 80%', active: false },
                    { label: '매칭 90%', active: true },
                  ].map((step, i) => (
                    <div key={step.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ background: step.active ? '#4DD9C0' : 'rgba(77,217,192,0.1)', border: '1px solid rgba(77,217,192,0.35)', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, color: step.active ? '#0D1117' : '#4DD9C0', whiteSpace: 'nowrap' as const }}>{step.label}</div>
                      {i < 3 && <span style={{ color: 'rgba(77,217,192,0.35)', fontSize: 16, fontWeight: 300 }}>→</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 02 — 2회독 */}
              <div className="allkill-bento-card" style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.07) 0%, rgba(167,139,250,0.02) 100%)', border: '1px solid rgba(167,139,250,0.18)', borderRadius: 24, padding: '36px 32px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', bottom: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ display: 'inline-block', background: 'rgba(167,139,250,0.12)', color: '#A78BFA', border: '1px solid rgba(167,139,250,0.25)', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 100, marginBottom: 24, letterSpacing: '0.8px' }}>심화 학습 시스템</div>
                <div className="allkill-montserrat" style={{ fontSize: 72, fontWeight: 900, color: '#A78BFA', lineHeight: 1, marginBottom: 6, textShadow: '0 0 40px rgba(167,139,250,0.35)' }}>2회독</div>
                <h3 className="allkill-bento-h3-md">완전 정복</h3>
                <p className="allkill-bento-body" style={{ color: 'rgba(255,255,255,0.45)' }}>1회독으로 외우고, 2회독에서 유의어·반의어·숙어까지. 9가지 유형으로 완전히 내 것으로.</p>
              </div>

              {/* Card 03 — AI 채점 */}
              <div className="allkill-bento-card" style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.07) 0%, rgba(251,191,36,0.02) 100%)', border: '1px solid rgba(251,191,36,0.18)', borderRadius: 24, padding: '36px 32px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', bottom: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ display: 'inline-block', background: 'rgba(251,191,36,0.12)', color: '#FCD34D', border: '1px solid rgba(251,191,36,0.25)', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 100, marginBottom: 24, letterSpacing: '0.8px' }}>AI 채점 시스템</div>
                <div className="allkill-montserrat" style={{ fontSize: 72, fontWeight: 900, color: '#FCD34D', lineHeight: 1, marginBottom: 6, textShadow: '0 0 40px rgba(251,191,36,0.35)' }}>AI</div>
                <h3 className="allkill-bento-h3-md">영작 채점</h3>
                <p className="allkill-bento-body" style={{ color: 'rgba(255,255,255,0.45)' }}>2회독에서는 뜻을 직접 영작합니다. AI가 의미 이해 기반으로 채점해 진짜 이해를 확인합니다.</p>
              </div>

              {/* Card 04 — 틀린 단어 재시험 */}
              <div className="allkill-bento-card" style={{ background: 'linear-gradient(135deg, rgba(244,63,94,0.07) 0%, rgba(244,63,94,0.02) 100%)', border: '1px solid rgba(244,63,94,0.18)', borderRadius: 24, padding: '36px 32px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', bottom: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(244,63,94,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ display: 'inline-block', background: 'rgba(244,63,94,0.12)', color: '#F87171', border: '1px solid rgba(244,63,94,0.25)', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 100, marginBottom: 24, letterSpacing: '0.8px' }}>오답 집중 복습</div>
                <div className="allkill-montserrat" style={{ fontSize: 60, fontWeight: 900, color: '#F87171', lineHeight: 1, marginBottom: 6, textShadow: '0 0 40px rgba(244,63,94,0.35)' }}>오답만</div>
                <h3 className="allkill-bento-h3-md">재시험</h3>
                <p className="allkill-bento-body" style={{ color: 'rgba(255,255,255,0.45)' }}>틀린 단어만 자동으로 모아서 다시 시험볼 수 있습니다. 약한 단어를 집중 공략하세요.</p>
              </div>

              {/* Card 05 — 학부모 리포트 (span 3) */}
              <div className="allkill-bento-card allkill-bento-span3" style={{ background: 'linear-gradient(135deg, rgba(56,189,248,0.07) 0%, rgba(56,189,248,0.02) 100%)', border: '1px solid rgba(56,189,248,0.18)', borderRadius: 24, padding: '40px 44px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                  {/* Left: text */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'inline-block', background: 'rgba(56,189,248,0.12)', color: '#38BDF8', border: '1px solid rgba(56,189,248,0.25)', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 100, marginBottom: 24, letterSpacing: '0.8px' }}>실시간 리포트</div>
                    <div className="allkill-montserrat" style={{ fontSize: 80, fontWeight: 900, color: '#38BDF8', lineHeight: 1, marginBottom: 6, textShadow: '0 0 48px rgba(56,189,248,0.35)' }}>리포트</div>
                    <h3 className="allkill-bento-h3-lg">학부모 공유</h3>
                    <p className="allkill-bento-body" style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 360 }}>학습 완료 후 리포트 링크를 학부모에게 바로 공유. 어떤 단어를 틀렸는지, 몇 단계까지 완료했는지 한눈에 확인하세요.</p>
                  </div>
                  {/* Right: mini report UI */}
                  <div style={{ flexShrink: 0, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: 16, padding: '24px 28px', minWidth: 220 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 16, letterSpacing: '0.5px' }}>학습 리포트</div>
                    {[
                      { label: '플래시카드', pct: '100%', done: true },
                      { label: '퀴즈', pct: '88%', done: true },
                      { label: '스펠링', pct: '76%', done: true },
                      { label: '매칭', pct: '40%', done: false },
                    ].map((row) => (
                      <div key={row.label} style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>{row.label}</span>
                          <span style={{ fontSize: 12, color: row.done ? '#4DD9C0' : '#38BDF8', fontWeight: 700 }}>{row.pct}</span>
                        </div>
                        <div style={{ height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 100 }}>
                          <div style={{ height: '100%', width: row.pct, background: row.done ? 'linear-gradient(90deg, #4DD9C0, #38BDF8)' : '#38BDF8', borderRadius: 100, transition: 'width 0.3s' }} />
                        </div>
                      </div>
                    ))}
                    <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.07)', fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>링크 하나로 바로 공유</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ③ 수록 단어 */}
        <section className="allkill-section" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)', padding: '96px 60px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -150, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -100, left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(77,217,192,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.2)', fontSize: 16, fontWeight: 700, padding: '8px 20px', borderRadius: 100, marginBottom: 16 }}>수록 단어</div>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 900, color: 'white', lineHeight: 1.3, marginBottom: 14 }}>
              중학부터 수능까지,<br /><span style={{ color: '#4DD9C0' }}>필요한 단어는 다 있어요</span>
            </h2>
            <p style={{ fontSize: 'clamp(15px, 1.4vw, 18px)', color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, marginBottom: 56 }}>교과서부터 모의고사, 수능 기출까지.<br />학년과 목표에 맞게 골라서 공부하세요.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* 중학 */}
              <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 24, padding: '36px 40px', backdropFilter: 'blur(8px)', wordBreak: 'keep-all' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 32 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                      <div className="allkill-vocab-badge" style={{ background: '#A78BFA', color: 'white' }}>중학교</div>
                      <div className="allkill-vocab-card-heading">전학년 전교과서 단어</div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      {['중1 전교과서', '중2 전교과서', '중3 전교과서'].map((t) => (
                        <span key={t} className="allkill-vocab-chip" style={{ background: 'rgba(167,139,250,0.25)', color: '#C4B5FD', border: '1px solid rgba(167,139,250,0.4)' }}>{t}</span>
                      ))}
                    </div>
                  </div>
                  {/* 출판사 그리드 */}
                  <div className="allkill-vocab-pub-grid">
                    {[
                      { name: '천재교육', color: '#F87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)' },
                      { name: '비상교육', color: '#60A5FA', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.3)' },
                      { name: 'YBM', color: '#34D399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.3)' },
                      { name: '동아출판', color: '#FBBF24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.3)' },
                      { name: '미래엔', color: '#A78BFA', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.3)' },
                      { name: '지학사', color: '#F472B6', bg: 'rgba(244,114,182,0.1)', border: 'rgba(244,114,182,0.3)' },
                    ].map((pub) => (
                      <div key={pub.name} style={{ background: pub.bg, border: `1px solid ${pub.border}`, borderRadius: 10, padding: '10px 14px', fontSize: 13, fontWeight: 800, color: pub.color, textAlign: 'center', letterSpacing: '-0.2px' }}>
                        {pub.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 고등 모의고사 */}
              <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 24, padding: '36px 40px', backdropFilter: 'blur(8px)', wordBreak: 'keep-all' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 40 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                      <div className="allkill-vocab-badge" style={{ background: '#4DD9C0', color: '#0F172A' }}>모의고사</div>
                      <div className="allkill-vocab-card-heading">최근 5개년 · 고1–3</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {['고1', '고2', '고3'].map((grade) => (
                        <div key={grade} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span className="allkill-vocab-grade" style={{ color: '#4DD9C0' }}>{grade}</span>
                          {['3월', '6월', '9월', '11월'].map((month) => (
                            <span key={month} className="allkill-vocab-chip" style={{ background: 'rgba(77,217,192,0.15)', color: '#4DD9C0', border: '1px solid rgba(77,217,192,0.35)' }}>{month}</span>
                          ))}
                          <span className="allkill-vocab-years">× 5개년</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* 연도 스택 */}
                  <div className="allkill-vocab-visual" style={{ alignItems: 'flex-end' }}>
                    {[
                      { year: '2024', active: true },
                      { year: '2023', active: false },
                      { year: '2022', active: false },
                      { year: '2021', active: false },
                      { year: '2020', active: false },
                    ].map((item, i) => (
                      <div key={item.year} style={{ background: item.active ? '#4DD9C0' : `rgba(77,217,192,${0.06 + (4 - i) * 0.03})`, border: `1px solid rgba(77,217,192,${item.active ? 0.9 : 0.15 + (4 - i) * 0.05})`, borderRadius: 10, padding: '10px 28px', fontSize: 15, fontWeight: 900, color: item.active ? '#0F172A' : `rgba(255,255,255,${0.25 + (4 - i) * 0.12})`, textAlign: 'center', letterSpacing: '0.5px', width: 110 }}>
                        {item.year}년
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 수능 기출 + 교과서 */}
              <div className="allkill-vocab-bottom">
                <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 24, padding: '36px 40px', backdropFilter: 'blur(8px)', wordBreak: 'keep-all' }}>
                  <div className="allkill-vocab-badge" style={{ background: '#FEF08A', color: '#713F12', display: 'inline-block', marginBottom: 20 }}>수능 기출</div>
                  <div className="allkill-vocab-subtitle">수능 기출 단어</div>
                  <div className="allkill-vocab-desc" style={{ marginBottom: 20 }}>실제 수능에 출제된 단어만 엄선했습니다.</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {['2024수능', '2023수능', '2022수능', '2021수능', '2020수능'].map((y, i) => (
                      <span key={y} style={{ background: i === 0 ? 'rgba(254,240,138,0.2)' : 'rgba(254,240,138,0.07)', border: `1px solid rgba(254,240,138,${i === 0 ? 0.5 : 0.2})`, borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, color: i === 0 ? '#FEF08A' : 'rgba(254,240,138,0.45)' }}>{y}</span>
                    ))}
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 24, padding: '36px 40px', backdropFilter: 'blur(8px)', wordBreak: 'keep-all' }}>
                  <div className="allkill-vocab-badge" style={{ background: '#C4B5FD', color: '#3B0764', display: 'inline-block', marginBottom: 20 }}>교과서</div>
                  <div className="allkill-vocab-subtitle">고등 교과서 단어</div>
                  <div className="allkill-vocab-desc" style={{ marginBottom: 20 }}>고등 영어 교과서 핵심 단어를 수록했습니다.</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {[
                      { name: '천재교육', color: '#F87171' },
                      { name: '비상교육', color: '#60A5FA' },
                      { name: 'YBM', color: '#34D399' },
                      { name: '동아출판', color: '#FBBF24' },
                    ].map((pub) => (
                      <span key={pub.name} style={{ background: `rgba(196,181,253,0.1)`, border: `1px solid rgba(196,181,253,0.25)`, borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, color: '#C4B5FD' }}>{pub.name}</span>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ④ 7단계 학습 흐름 */}
        <section className="allkill-section" style={{ padding: '96px 60px', background: 'white' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'inline-block', background: C.lavenderLight, color: C.lavenderDark, fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 100, marginBottom: 16 }}>학습 시스템</div>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 48px)', fontWeight: 900, color: C.gray800, lineHeight: 1.3, marginBottom: 14 }}>
              1회독 + 2회독, <span style={{ color: C.lavenderDark }}>총 7단계</span><br />
              외우고, 이해하고,<br />완전히 내 것으로.
            </h2>
            <p style={{ fontSize: 'clamp(15px, 1.4vw, 18px)', color: C.gray400, lineHeight: 1.8, marginBottom: 56 }}>
              각 단계마다 통과 기준이 있습니다.<br />
              2회 연속 실패하면 오답만 모아서 다시 테스트합니다.<br />
              모르는 단어는 끝까지 잡아드려요.
            </p>

            {/* 1회독 */}
            <div style={{ background: 'linear-gradient(135deg, rgba(209,250,250,0.6), rgba(207,250,254,0.4))', border: '1px solid rgba(255,255,255,0.8)', borderRadius: 28, padding: '40px 32px', marginBottom: 32, backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(6,182,212,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <span className="allkill-flow-round-badge" style={{ background: 'rgba(6,182,212,0.15)', color: '#0891B2', border: '1px solid rgba(6,182,212,0.25)' }}>1회독</span>
                <span className="allkill-flow-label-title" style={{ color: C.gray800 }}>단어 암기</span>
                <span className="allkill-round-label-desc" style={{ marginLeft: 'auto', fontSize: 13, color: C.gray400, fontWeight: 500 }}>4단계 통과 시스템</span>
              </div>
              <div className="allkill-flow-1">
                {[
                  { n: 1, name: '플래시카드', pass: '자유 학습', passColor: '#0D9E8A', desc: '단어·뜻·예문을 카드로 확인하고 앞뒤로 넘기며 자유롭게 학습하세요.', borderColor: '#4DD9C0', dark: false },
                  { n: 2, name: '퀴즈', pass: '80점 통과', passColor: '#7C3AED', desc: '4지선다 객관식으로 단어 뜻을 확인합니다. 80점 이상이어야 다음 단계로 넘어가요.', borderColor: '#06B6D4', dark: false },
                  { n: 3, name: '스펠링', pass: '80점 통과', passColor: '#7C3AED', desc: '뜻을 보고 영어 단어를 직접 입력합니다. 80점 이상이어야 다음 단계로 넘어가요.', borderColor: '#0891B2', dark: false },
                  { n: 4, name: '매칭', pass: '90점 통과', passColor: '#1E3A5F', desc: '단어와 뜻을 연결하는 최종 단계. 90점 이상이어야 1회독 완료!', borderColor: '#3B82F6', dark: true, bg: '#1E3A5F' },
                ].map((step) => (
                  <div key={step.n} style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="allkill-flow-num" style={{ borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, margin: '0 auto 16px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', color: C.gray800 }}>{step.n}</div>
                    <div className="allkill-flow-card" style={{ background: step.bg || 'white', borderRadius: 16, padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1, transition: 'border-color 0.2s, transform 0.2s', border: `2px solid transparent`, borderTopWidth: 4, borderTopColor: step.borderColor, borderTopStyle: 'solid' }}>
                      <div className="allkill-flow-step-name" style={{ color: step.dark ? 'white' : C.gray800 }}>{step.name}</div>
                      <span className="allkill-flow-pass" style={{ background: 'white', color: step.passColor, border: `1.5px solid ${step.passColor}` }}>{step.pass}</span>
                      <div className="allkill-flow-desc" style={{ color: step.dark ? 'rgba(255,255,255,0.85)' : C.gray600, borderTop: step.dark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.06)' }}>{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2회독 */}
            <div style={{ background: 'linear-gradient(135deg, rgba(237,233,254,0.6), rgba(221,214,254,0.4))', border: '1px solid rgba(255,255,255,0.8)', borderRadius: 28, padding: '40px 32px', backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(124,58,237,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <span className="allkill-flow-round-badge" style={{ background: 'rgba(124,58,237,0.12)', color: '#7C3AED', border: '1px solid rgba(124,58,237,0.2)' }}>2회독</span>
                <span className="allkill-flow-label-title" style={{ color: C.gray800 }}>완전 정복</span>
                <span className="allkill-round-label-desc" style={{ marginLeft: 'auto', fontSize: 13, color: C.gray400, fontWeight: 500 }}>심화 학습 · AI 채점</span>
              </div>
              <div className="allkill-flow-2">
                {[
                  { n: 5, name: '플래시카드 심화', pass: '유의어·반의어·숙어', passColor: '#7C3AED', desc: '유의어, 반의어, 숙어까지 확장 학습합니다. 단어의 쓰임새를 폭넓게 익히세요.', borderColor: '#A78BFA', dark: false },
                  { n: 6, name: '종합문제', pass: '9가지 유형', passColor: '#7C3AED', desc: '9가지 유형의 종합문제로 단어를 다각도로 확인합니다. AI가 영작 답안을 직접 채점합니다.', borderColor: '#7C3AED', dark: false },
                  { n: 7, name: '심화 매칭', pass: '2회독 완료', passColor: '#3B0764', desc: '심화 매칭으로 2회독을 마무리합니다. 여기까지 완료하면 진짜 내 단어!', borderColor: '#7C3AED', dark: true, bg: '#3B0764' },
                ].map((step) => (
                  <div key={step.n} style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="allkill-flow-num" style={{ borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, margin: '0 auto 16px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', color: C.gray800 }}>{step.n}</div>
                    <div className="allkill-flow-card" style={{ background: step.bg || 'white', borderRadius: 16, padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1, transition: 'border-color 0.2s, transform 0.2s', border: `2px solid transparent`, borderTopWidth: 4, borderTopColor: step.borderColor, borderTopStyle: 'solid' }}>
                      <div className="allkill-flow-step-name" style={{ color: step.dark ? 'white' : C.gray800 }}>{step.name}</div>
                      <span className="allkill-flow-pass" style={{ background: 'white', color: step.passColor, border: `1.5px solid ${step.passColor}` }}>{step.pass}</span>
                      <div className="allkill-flow-desc" style={{ color: step.dark ? 'rgba(255,255,255,0.85)' : C.gray600, borderTop: step.dark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.06)' }}>{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ⑤ 학부모/학생 포인트 */}
        <section className="allkill-section" style={{ padding: '96px 60px', background: C.gray50 }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'inline-block', background: C.lavenderLight, color: C.lavenderDark, fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 100, marginBottom: 16 }}>학부모 &amp; 학생</div>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 48px)', fontWeight: 900, color: C.gray800, lineHeight: 1.3, marginBottom: 14 }}>
              학부모도, 학생도<br /><span style={{ color: C.lavenderDark }}>모두 만족하는 이유</span>
            </h2>
            <p style={{ fontSize: 'clamp(15px, 1.4vw, 18px)', color: C.gray400, lineHeight: 1.8, marginBottom: 56 }}>
              올킬보카는 학생의 자기주도 학습을 돕고,<br />학부모의 불안을 해소합니다.
            </p>

            <div className="allkill-parent-grid">
              {[
                {
                  tag: '👨‍👩‍👧 학부모', tagBg: C.lavenderLight, tagColor: C.lavenderDark,
                  title: '우리 아이가\n진짜 외웠는지 알 수 있어요',
                  desc: '단순히 "공부했어요"가 아니라,\n어떤 단어를 몇 번 틀렸는지,\n몇 단계를 통과했는지 데이터로 확인하세요.',
                  points: ['학습 완료 후 리포트 링크 바로 공유', '틀린 단어 & 오답 횟수 상세 확인', '단계별 통과 현황 한눈에 파악', '별도 앱 설치 없이 링크 하나로 확인'],
                },
                {
                  tag: '🎓 학생', tagBg: C.mintLight, tagColor: C.mintDark,
                  title: '게임처럼 하다 보면\n단어가 머릿속에 남아요',
                  desc: '7단계를 하나씩 통과하는 과정에서\n성취감이 생깁니다.\n지루한 암기가 아니라 클리어하는 재미로 공부하세요.',
                  points: ['단계별 통과 기준으로 성취감 UP', '틀린 단어만 반복 복습 시스템', '수능 기출 단어 DB 완벽 커버', '2회독 AI 서술형 채점으로 완전 정복'],
                },
              ].map((card) => (
                <div key={card.tag} style={{ background: 'white', borderRadius: 24, padding: '44px 40px', border: '1px solid rgba(167,139,250,0.12)' }}>
                  <span className="allkill-persona-tag" style={{ background: card.tagBg, color: card.tagColor }}>{card.tag}</span>
                  <h3 className="allkill-persona-title" style={{ color: C.gray800 }}>{card.title}</h3>
                  <p className="allkill-persona-desc" style={{ color: C.gray400 }}>{card.desc}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {card.points.map((point) => (
                      <div key={point} className="allkill-persona-point" style={{ display: 'flex', alignItems: 'flex-start', gap: 12, color: C.gray600 }}>
                        <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#4DD9C0', color: 'white', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>✓</span>
                        {point}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ⑥ Stats 배너 */}
        <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)', padding: '80px 60px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -120, right: -120, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(77,217,192,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -100, left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div className="allkill-stats-inner" style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div className="allkill-stats-text">
              <h2 style={{ fontSize: 'clamp(24px, 3vw, 44px)', fontWeight: 900, color: 'white', marginBottom: 12, lineHeight: 1.3 }}>지금 이 순간도<br />단어를 올킬 중</h2>
              <p style={{ fontSize: 'clamp(14px, 1.3vw, 17px)', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>올라영 학생들이 올킬보카로<br />수능 단어를 마스터하고 있어요</p>
            </div>
            <div className="allkill-stats-nums" style={{ display: 'flex', gap: 16 }}>
              {[
                { num: '7단계', label: '2회독 완전 정복 시스템' },
                { num: 'AI', label: '서술형 영작 자동 채점' },
                { num: '90점', label: '매칭 통과 기준' },
              ].map((stat) => (
                <div key={stat.label} className="allkill-stat-item" style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '28px 40px', backdropFilter: 'blur(8px)', minWidth: 160, transition: 'transform 0.2s, background 0.2s' }}>
                  <div className="allkill-montserrat allkill-stat-num" style={{ fontSize: 48, fontWeight: 900, color: '#4DD9C0', lineHeight: 1, marginBottom: 10, textShadow: '0 0 30px rgba(77,217,192,0.4)', whiteSpace: 'nowrap' }}>{stat.num}</div>
                  <div className="allkill-stat-label" style={{ color: 'rgba(255,255,255,0.65)' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ⑦ 가격 */}
        <section id="price" className="allkill-section" style={{ padding: '96px 60px', background: 'white' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'inline-block', background: C.lavenderLight, color: C.lavenderDark, fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 100, marginBottom: 16 }}>가격 안내</div>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 48px)', fontWeight: 900, color: C.gray800, lineHeight: 1.3, marginBottom: 14 }}>
              부담 없이 <span style={{ color: C.lavenderDark }}>시작하세요.</span>
            </h2>
            <p style={{ fontSize: 'clamp(15px, 1.4vw, 18px)', color: C.gray400, lineHeight: 1.8, marginBottom: 56 }}>1주 무료 체험 후 결정하세요.</p>

            <div className="allkill-price-grid">
              {/* 개인 구독 */}
              <div className="allkill-price-card" style={{ borderRadius: 20, padding: '40px 36px', border: `2px solid ${C.lavender}`, boxShadow: '0 16px 48px rgba(167,139,250,0.18)', position: 'relative', transition: 'transform 0.2s' }}>
                <div style={{ position: 'absolute', top: -15, left: '50%', transform: 'translateX(-50%)', background: C.lavender, color: 'white', fontSize: 13, fontWeight: 700, padding: '5px 18px', borderRadius: 100, whiteSpace: 'nowrap' }}>🐣 얼리버드 특가</div>
                <div className="allkill-price-plan-label" style={{ color: C.gray400 }}>개인 구독</div>
                <div className="allkill-montserrat allkill-price-amount" style={{ color: C.gray800 }}>월 9,900<span className="allkill-price-amount-unit" style={{ color: C.gray400 }}>원</span></div>
                <div className="allkill-price-discount" style={{ color: C.gray400 }}>
                  <s style={{ color: 'rgba(0,0,0,0.3)' }}>정가 17,000원</s> → <b style={{ color: C.lavenderDark }}>얼리버드 특가</b>
                </div>
                <div className="allkill-price-notice" style={{ background: '#FEF9C3', border: '1px solid #FDE047', color: '#713F12' }}>
                  📚 현재 수록 단어: 고1·2·3 3월 모의고사<br />각 학년 1–2과 단어 제공 중 (업데이트 예정)
                </div>
                <div style={{ height: 1, background: '#F2F0FF', marginBottom: 28 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 36 }}>
                  {['수록 단어 전체 무제한 이용', '1회독 + 2회독 전체', 'AI 서술형 채점', '학부모 리포트 공유', '틀린 단어 복습 시스템'].map((f) => (
                    <div key={f} className="allkill-price-feature" style={{ display: 'flex', alignItems: 'center', gap: 12, color: C.gray600 }}>
                      <span style={{ color: '#4DD9C0', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>✓</span> {f}
                    </div>
                  ))}
                </div>
                <AllkillPayButton />
              </div>

              {/* 학원 단체 */}
              <div className="allkill-price-card" style={{ borderRadius: 20, padding: '40px 36px', border: '2px solid #F2F0FF', transition: 'transform 0.2s' }}>
                <div className="allkill-price-plan-label" style={{ color: C.gray400 }}>학원 단체</div>
                <div className="allkill-montserrat allkill-price-amount" style={{ color: C.gray800 }}>문의<span className="allkill-price-amount-unit" style={{ color: C.gray400 }}>하기</span></div>
                <div className="allkill-price-subtitle" style={{ color: C.gray400 }}>학원/그룹 맞춤 견적</div>
                <div style={{ height: 1, background: '#F2F0FF', marginBottom: 28 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 36 }}>
                  {['학생 수 맞춤 가격', '선생님용 관리 대시보드', '일괄 리포트 관리', '전담 고객 지원'].map((f) => (
                    <div key={f} className="allkill-price-feature" style={{ display: 'flex', alignItems: 'center', gap: 12, color: C.gray600 }}>
                      <span style={{ color: '#4DD9C0', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>✓</span> {f}
                    </div>
                  ))}
                </div>
                <button className="allkill-price-btn" style={{ border: `1.5px solid ${C.lavender}`, background: 'transparent', color: C.lavenderDark }}>
                  학원 문의하기
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ⑧ 이용 가이드 */}
        <section style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)', padding: 'clamp(60px, 8vw, 100px) 24px', position: 'relative', overflow: 'hidden' }}>
          {/* 배경 글로우 */}
          <div style={{ position: 'absolute', top: -150, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -100, left: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(77,217,192,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ maxWidth: 860, margin: '0 auto', position: 'relative', zIndex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 36, padding: 'clamp(36px, 5vw, 56px) clamp(24px, 5vw, 64px)', backdropFilter: 'blur(12px)' }}>

            {/* 헤더 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 36 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ background: '#A78BFA', color: 'white', fontSize: 13, fontWeight: 900, padding: '6px 14px', borderRadius: 100, letterSpacing: '0.3px' }}>올라영 ×</span>
                <span className="allkill-montserrat" style={{ fontSize: 22, fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>올킬보카</span>
              </div>
              <span style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 700, padding: '6px 16px', borderRadius: 100 }}>이용 가이드</span>
            </div>

            {/* 타이틀 */}
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 900, color: 'white', lineHeight: 1.25, marginBottom: 8 }}>
              처음 시작하는 분들을 위한<br /><span style={{ color: '#4DD9C0' }}>올킬보카 이용 방법</span>
            </h2>
            <p style={{ fontSize: 'clamp(14px, 1.5vw, 16px)', color: 'rgba(255,255,255,0.5)', marginBottom: 36, lineHeight: 1.6 }}>결제 후 아래 순서대로 따라오세요. 어렵지 않아요 🙂</p>

            {/* 스텝 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* STEP 1 */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 20, padding: 'clamp(18px, 2vw, 24px) clamp(20px, 2vw, 28px)' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, background: 'rgba(167,139,250,0.25)', color: '#C4B5FD', border: '1px solid rgba(167,139,250,0.4)', fontSize: 13, fontWeight: 900, fontFamily: 'Montserrat, sans-serif' }}>01</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#C4B5FD', marginBottom: 6, letterSpacing: '0.5px' }}>STEP 1 · 결제</div>
                  <div style={{ fontSize: 'clamp(15px, 1.5vw, 18px)', fontWeight: 900, color: 'white', marginBottom: 8, lineHeight: 1.35 }}>올라영 홈페이지에서 결제하기</div>
                  <div style={{ fontSize: 'clamp(13px, 1.2vw, 14px)', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>결제 시 <b style={{ color: 'white' }}>이메일 주소</b>와 <b style={{ color: 'white' }}>전화번호</b>를 입력해 주세요.<br />이 정보가 올킬보카 로그인 아이디와 비밀번호가 됩니다.</div>
                </div>
              </div>

              {/* STEP 2 */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 20, padding: 'clamp(18px, 2vw, 24px) clamp(20px, 2vw, 28px)' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, background: 'rgba(77,217,192,0.2)', color: '#4DD9C0', border: '1px solid rgba(77,217,192,0.35)', fontSize: 13, fontWeight: 900, fontFamily: 'Montserrat, sans-serif' }}>02</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#4DD9C0', marginBottom: 6, letterSpacing: '0.5px' }}>STEP 2 · 로그인 정보 확인</div>
                  <div style={{ fontSize: 'clamp(15px, 1.5vw, 18px)', fontWeight: 900, color: 'white', marginBottom: 12, lineHeight: 1.35 }}>아이디 · 비밀번호 확인</div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '12px 16px', flex: '1 1 160px' }}>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 700, marginBottom: 4, letterSpacing: '0.5px' }}>아이디 (ID)</div>
                      <div style={{ fontSize: 14, color: 'white', fontWeight: 700 }}>결제 시 입력한 <span style={{ color: '#4DD9C0' }}>이메일 주소</span></div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '12px 16px', flex: '1 1 160px' }}>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 700, marginBottom: 4, letterSpacing: '0.5px' }}>비밀번호 (PW)</div>
                      <div style={{ fontSize: 14, color: 'white', fontWeight: 700 }}>전화번호 <span style={{ color: '#4DD9C0' }}>숫자만</span> (하이픈 없이)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 3 */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 20, padding: 'clamp(18px, 2vw, 24px) clamp(20px, 2vw, 28px)' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, background: 'rgba(254,240,138,0.2)', color: '#FEF08A', border: '1px solid rgba(254,240,138,0.35)', fontSize: 13, fontWeight: 900, fontFamily: 'Montserrat, sans-serif' }}>03</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#FEF08A', marginBottom: 6, letterSpacing: '0.5px' }}>STEP 3 · 접속</div>
                  <div style={{ fontSize: 'clamp(15px, 1.5vw, 18px)', fontWeight: 900, color: 'white', marginBottom: 8, lineHeight: 1.35 }}>올킬보카 학습 플랫폼 접속하기</div>
                  <div style={{ fontSize: 'clamp(13px, 1.2vw, 14px)', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: 10 }}>아래 주소로 접속하거나, 올라영 홈페이지에서 &quot;올킬보카 학습하러 가기&quot; 버튼을 클릭하세요.</div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(77,217,192,0.1)', border: '1px solid rgba(77,217,192,0.3)', borderRadius: 10, padding: '8px 14px' }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4DD9C0', flexShrink: 0 }} />
                    <span className="allkill-montserrat" style={{ fontSize: 13, fontWeight: 700, color: '#4DD9C0', letterSpacing: '0.3px' }}>app.allrounderenglish.co.kr</span>
                  </div>
                </div>
              </div>

              {/* STEP 4 */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 20, padding: 'clamp(18px, 2vw, 24px) clamp(20px, 2vw, 28px)' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, background: 'rgba(167,139,250,0.25)', color: '#C4B5FD', border: '1px solid rgba(167,139,250,0.4)', fontSize: 13, fontWeight: 900, fontFamily: 'Montserrat, sans-serif' }}>04</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#C4B5FD', marginBottom: 6, letterSpacing: '0.5px' }}>STEP 4 · 북마크</div>
                  <div style={{ fontSize: 'clamp(15px, 1.5vw, 18px)', fontWeight: 900, color: 'white', marginBottom: 8, lineHeight: 1.35 }}>다음부터 편하게 — 북마크 저장 추천!</div>
                  <div style={{ fontSize: 'clamp(13px, 1.2vw, 14px)', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>접속 후 브라우저 북마크(즐겨찾기)에 저장해두면<br />다음부터 버튼 한 번으로 바로 들어올 수 있어요.</div>
                </div>
              </div>

            </div>

            {/* 푸터 */}
            <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>문의: michaela@allrounderenglish.com</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}><span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>allrounderenglish.co.kr</span></span>
            </div>

          </div>
        </section>

        {/* ⑨ Final CTA */}
        <section className="allkill-final-cta" style={{ background: C.lavender, padding: '100px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(91,33,182,0.2)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 2, maxWidth: 600, margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 56px)', fontWeight: 900, color: 'white', marginBottom: 16, lineHeight: 1.3 }}>
              지금 바로<br /><span style={{ color: '#FEF08A' }}>올킬 시작</span>하세요
            </h2>
            <p style={{ fontSize: 'clamp(16px, 1.5vw, 20px)', color: 'rgba(255,255,255,0.75)', marginBottom: 40, lineHeight: 1.7 }}>
              1주 무료 체험, 언제든 취소 가능.<br />수능 영어 단어, 이번엔 진짜로 끝냅니다.
            </p>
            <div style={{ maxWidth: 320, margin: '0 auto' }}>
              <AllkillPayButton />
            </div>
            <p style={{ marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>이미 구독 중이신가요? <a href="https://app.allrounderenglish.co.kr" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'underline' }}>바로 접속하기</a></p>
          </div>
        </section>
      </main>

      {/* 푸터 */}
      <footer className="bg-[#f5f5f7] pt-6 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="border-t border-gray-300 mb-8"></div>
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
            <div className="flex-shrink-0">
              <h3 className="text-lg font-bold text-[#1d1d1f] mb-4">CONTACT US</h3>
              <p className="text-2xl font-bold text-[#1d1d1f] mb-2">카카오톡 [올라영]</p>
              <p className="text-[#424245] text-sm mb-1">수업관련 문의 평일 AM 10:00 - PM 5:00</p>
              <p className="text-[#424245] text-sm mb-4">주말/공휴일 휴무</p>
              <div className="flex gap-2">
                <a href="#" className="px-4 py-2 bg-[#1d1d1f] text-white text-sm font-medium rounded hover:bg-[#424245] transition-colors">FAQ</a>
                <a href="#" className="px-4 py-2 bg-[#1d1d1f] text-white text-sm font-medium rounded hover:bg-[#424245] transition-colors">문의게시판</a>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-[#1d1d1f] mb-4">BUSINESS INFORMATION</h3>
              <div className="flex flex-col md:flex-row gap-8 text-[#424245] text-sm leading-relaxed">
                <div className="space-y-1">
                  <p>상호 : 올라운더영어</p>
                  <p>주소 : 인천광역시 연수구 해돋이로 107, 디동 209호</p>
                  <p>전화번호 : 010-4904-1247</p>
                  <p>개인정보관리책임자 : 안홍미</p>
                  <p>e-mail : michaela@allrounderenglish.com</p>
                </div>
                <div className="space-y-1">
                  <p>사업자등록번호 : 188-88-03474</p>
                  <p>통신판매업신고번호 : 제 2024-인천연수구-3892호</p>
                  <p>올라운더영어 대표 : 안홍미</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-6 border-t border-gray-200 text-center text-[#86868b] text-sm">
            <p>Copyright © allrounderenglish Inc. All Rights Reserved.</p>
            <div className="mt-2 flex justify-center gap-4 text-xs">
              <a href="/terms" className="hover:underline hover:text-[#424245]">이용약관</a>
              <span>|</span>
              <a href="/privacy" className="font-bold hover:underline hover:text-[#424245]">개인정보처리방침</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
