import type { Metadata } from 'next';
import { Noto_Serif_KR, Nanum_Pen_Script } from 'next/font/google';
import Header from '@/components/Header';
import FooterSection from '@/app/allkill/_sections/FooterSection';

const notoSerif = Noto_Serif_KR({ weight: ['700'], subsets: ['latin'], preload: false });
const nanumPen = Nanum_Pen_Script({ weight: ['400'], preload: false });

export const metadata: Metadata = {
  title: '올인내신 | 상위권을 위한 영어 내신 대비',
  description: '95점에서 100점으로 가는 그 구간을 집중적으로 파고듭니다. 킬러 문제, 대치동 자료, AI 변형 문제 완벽 대비.',
};

export default function SchoolExamPage() {
  return (
    <>
      <style suppressHydrationWarning>{`
        :root {
          --navy: #1e1b4b;
          --navy2: #312e81;
          --indigo: #4338ca;
          --indigo-light: #6366f1;
          --indigo-soft: #eef2ff;
          --mint: #10b981;
          --mint-soft: #d1fae5;
          --text: #1e1b4b;
          --text-muted: #64748b;
          --text-light: #94a3b8;
          --border: #e2e8f0;
          --radius: 16px;
          --radius-lg: 24px;
        }
        .sinaesin-serif { font-family: ${notoSerif.style.fontFamily}, serif; }
        .sinaesin-pen { font-family: ${nanumPen.style.fontFamily}, cursive; }

        .sinaesin-hero {
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center;
          padding: 130px 24px 80px;
          background: #ffffff;
        }

        .sinaesin-proof {
          display: inline-block;
          font-size: 0.85rem;
          font-weight: 700;
          color: #8a6a2a;
          padding: 16px 48px;
          position: relative;
          margin-bottom: 14px;
        }
        .sinaesin-proof::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, #c9a84c, #f0d080, #c9a84c, transparent);
        }
        .sinaesin-proof::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, #c9a84c, #f0d080, #c9a84c, transparent);
        }

        .sinaesin-why-card {
          background: #ffffff;
          border: 1.5px solid #c9a84c;
          border-radius: var(--radius);
          padding: 32px 28px;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(180,140,60,0.12), 0 1px 4px rgba(180,140,60,0.08);
        }
        .sinaesin-why-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, #c9a84c, #f0d080, #c9a84c, transparent);
        }
        .sinaesin-why-card:hover { box-shadow: 0 16px 48px rgba(180,140,60,0.2); transform: translateY(-5px); }

        .sinaesin-timeline::before {
          content: '';
          position: absolute;
          left: 28px; top: 0; bottom: 0; width: 1px;
          background: linear-gradient(180deg, #c9a84c, rgba(201,168,76,0.1));
        }

        .sinaesin-feature-card {
          display: grid;
          grid-template-columns: 56px 1fr;
          gap: 28px;
          align-items: start;
          padding: 32px 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          position: relative;
          transition: all 0.3s;
        }
        .sinaesin-feature-card:last-child { border-bottom: none; }
        .sinaesin-feature-card:hover .sinaesin-feature-content { transform: translateX(4px); }

        .sinaesin-step {
          width: 56px; height: 56px;
          border-radius: 50%;
          background: var(--navy2);
          border: 1.5px solid #c9a84c;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8rem; font-weight: 700; color: #c9a84c;
          flex-shrink: 0; position: relative; z-index: 1;
          transition: all 0.3s;
        }
        .sinaesin-feature-card:hover .sinaesin-step { background: #c9a84c; color: var(--navy); }
        .sinaesin-feature-content { transition: transform 0.3s; }

        .sinaesin-compare-header {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr 1fr;
          background: var(--navy);
        }
        .sinaesin-compare-row {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr 1fr;
          border-top: 1px solid var(--border);
        }
        .sinaesin-compare-row:nth-child(even) { background: #fafafa; }

        .sinaesin-pricing-cta {
          display: block; width: 100%;
          background: #3182F6; color: white; border: none;
          padding: 18px; border-radius: 12px;
          font-size: 1rem; font-weight: 700;
          cursor: pointer; font-family: inherit;
          margin-top: 28px; transition: all 0.25s;
          text-align: center; text-decoration: none;
          box-shadow: 0 4px 16px rgba(49,130,246,0.25);
        }
        .sinaesin-pricing-cta:hover { background: #1b6ef3; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(49,130,246,0.35); }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .sinaesin-anim { animation: fadeInUp 0.5s ease both; }

        @media (max-width: 768px) {
          .sinaesin-hero { padding: 100px 20px 60px; }
          .sinaesin-proof { padding: 16px 24px; }
          .sinaesin-proof-inner { flex-direction: column !important; gap: 12px !important; }
          .sinaesin-proof-divider { width: 24px !important; height: 1px !important; background: linear-gradient(90deg, transparent, #c9a84c, transparent) !important; border-radius: 0 !important; }
          .sinaesin-compare-header, .sinaesin-compare-row { grid-template-columns: 1.4fr 1fr 1fr 1fr; }
          .sinaesin-compare-header div, .sinaesin-compare-row div { padding: 12px 8px !important; font-size: 0.72rem !important; }
          .sinaesin-pricing-body { padding: 28px 24px !important; }
          .sinaesin-pricing-top { padding: 28px 24px !important; }
          .sinaesin-feature-card { grid-template-columns: 44px 1fr; gap: 20px; }
          .sinaesin-step { width: 44px; height: 44px; font-size: 0.7rem; }
          .sinaesin-timeline::before { left: 22px; }
        }
      `}</style>

      <Header />

      <main style={{ fontFamily: "'Pretendard', sans-serif", background: '#ffffff', color: 'var(--text)', lineHeight: '1.7', overflowX: 'hidden' }}>

        {/* HERO */}
        <section className="sinaesin-hero">
          <div style={{ maxWidth: 800 }}>
            <div className="sinaesin-anim" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--indigo-soft)', border: '1px solid rgba(99,102,241,0.2)', color: 'var(--indigo)', padding: '6px 18px', borderRadius: 100, fontSize: '0.78rem', fontWeight: 700, marginBottom: 40 }}>
              ✦ 올라영 × 올인내신
            </div>
            <p className="sinaesin-pen sinaesin-anim" style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.4, animationDelay: '0.08s' }}>
              온라인으로 내신이 된다고요?
            </p>
            <h1 className="sinaesin-anim" style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-3px', color: 'var(--navy)', marginBottom: 4, animationDelay: '0.12s' }}>
              됩니다.
            </h1>
            <p className="sinaesin-anim" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.8rem)', fontWeight: 900, color: '#a78bfa', letterSpacing: '-1.5px', marginBottom: 40, animationDelay: '0.16s' }}>
              그것도 아주 잘.
            </p>

            <div className="sinaesin-proof sinaesin-serif sinaesin-anim" style={{ animationDelay: '0.2s' }}>
              <div className="sinaesin-proof-inner" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#7a5a1a', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>수강생 95% · 95점 달성</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 400, color: '#b8966a', letterSpacing: '0.1em', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>STUDENT ACHIEVEMENT</span>
                </div>
                <div className="sinaesin-proof-divider" style={{ width: 4, height: 4, borderRadius: '50%', background: '#c9a84c', flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#7a5a1a', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>2026 동탄국제고 합격</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 400, color: '#b8966a', letterSpacing: '0.1em', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>DONGTAN INTERNATIONAL HIGH</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WHY */}
        <section style={{ padding: '96px 24px', background: '#f5f3ff' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ display: 'inline-block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', color: '#92784a', textTransform: 'uppercase' as const, background: '#fdf6e3', padding: '4px 12px', borderRadius: 100, marginBottom: 20, border: '1px solid #e8dcc8' }}>
              WHY 올인내신
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 900, lineHeight: 1.25, letterSpacing: '-0.5px', color: 'var(--navy)', marginBottom: 16 }}>
              상위권이 막히는 곳,<br /><span style={{ color: '#a78bfa' }}>거기를 집중적으로 파고듭니다.</span>
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.85, maxWidth: 520, wordBreak: 'keep-all' as const }}>
              기초를 잘 가르치는 곳은 많아요.<br />
              <span style={{ whiteSpace: 'nowrap' }}>올인내신은 95점에서 100점으로 가는 그 구간을 다룹니다.</span>
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginTop: 56 }}>
              {[
                { num: 'Point 01', title: '킬러 문제에 강하다', desc: '상위권이 실제로 틀리는 문제만 집중합니다.\n기초 반복은 이제 그만.' },
                { num: 'Point 02', title: '자료의 퀄리티가 다릅니다', desc: '대치동 아이들이 쓰는 그 자료입니다.\n자료 받으러 학원가지 마세요.' },
                { num: 'Point 03', title: '오프라인보다 더 촘촘한 관리', desc: '오답, 학습 현황, 성취도까지 선생님이 파악합니다.\n학원보다 더 꼼꼼하게.' },
                { num: 'Point 04', title: '대형학원 수준의 학습량,\n그리고 더 나은 효율', desc: '양은 그대로, 쉬운 반복은 삭제.\n틀리는 문제 유형만 집중 반복합니다.' },
              ].map((card) => (
                <div key={card.num} className="sinaesin-why-card">
                  <div className="sinaesin-serif" style={{ fontSize: '0.68rem', fontWeight: 700, color: '#92784a', letterSpacing: '0.15em', textTransform: 'uppercase' as const, marginBottom: 14, display: 'inline-block', paddingBottom: 10, borderBottom: '1px solid #e8dcc8', width: '100%' }}>
                    {card.num}
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy)', marginBottom: 10, lineHeight: 1.4, whiteSpace: 'pre-line' }}>{card.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.75, whiteSpace: 'pre-line' }}>{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CURRICULUM */}
        <section id="features" style={{ padding: '96px 24px', background: 'var(--navy)' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ display: 'inline-block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', color: '#c9a84c', textTransform: 'uppercase' as const, background: 'rgba(201,168,76,0.15)', padding: '4px 12px', borderRadius: 100, marginBottom: 20, border: '1px solid rgba(201,168,76,0.3)' }}>
              커리큘럼
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 900, lineHeight: 1.25, color: 'white', marginBottom: 16 }}>
              내신 1등급의<br /><span style={{ color: '#a78bfa' }}>순서가 있습니다.</span>
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.85, maxWidth: 520 }}>
              순서가 틀리면 시간 낭비입니다.<br />올인내신은 검증된 순서대로 가르칩니다.
            </p>

            <div className="sinaesin-timeline" style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 56, position: 'relative' }}>
              {[
                { step: '01', title: '단어 → 문법 → 본문 순서 지키기', desc: '중학 수준을 넘어서는 심화 문법까지 다루기 위해\n문법을 먼저 시작해야 합니다.\n여기서 최소 10점이 올라요.' },
                { step: '02', title: 'AI로 강화된 본문 변형 — 철저 대비', desc: '무작정 암기는 변형 문제에 취약합니다.\n어디가 중요한지를 알아야 어떤 변형이 나와도 대응할 수 있어요.' },
                { step: '03', title: '문법은 고등까지 — 시험이 실력 쌓는 기회', desc: '중학 문법에서 끝내지 마세요.\n고등 문법까지 깊이 있는 문제를 풀어야 고등 시험 범위를 감당할 수 있어요.' },
                { step: '04', title: '기출문제로 유형 익히기', desc: '문제집 문제 ≠ 기출문제.\n본인 학교보다 어려운 학군지 기출까지 풀어야 출제 유형에 익숙해집니다.' },
                { step: '05', title: '틀린 문제 집요하게 분석', desc: '답만 확인하고 넘어가면 안 됩니다.\n왜 틀렸는지 이유를 파악하고 외워야 진짜 실력이 됩니다.' },
              ].map((item) => (
                <div key={item.step} className="sinaesin-feature-card">
                  <div className="sinaesin-step sinaesin-serif">{item.step}</div>
                  <div className="sinaesin-feature-content">
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white', marginBottom: 8, lineHeight: 1.4 }}>{item.title}</h3>
                    <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, whiteSpace: 'pre-line', wordBreak: 'keep-all' as const }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COMPARE */}
        <section style={{ padding: '96px 24px', background: 'white' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ display: 'inline-block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--indigo)', textTransform: 'uppercase' as const, background: 'var(--indigo-soft)', padding: '4px 12px', borderRadius: 100, marginBottom: 20 }}>
              비교
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 900, lineHeight: 1.25, color: 'var(--navy)', marginBottom: 16 }}>
              목표는 하나.<br /><span style={{ color: '#a78bfa' }}>고등 내신 1등급, 수능 1등급.</span>
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.85, maxWidth: 520, marginBottom: 56 }}>
              중3이 끝날 때 그 기반이 완성되어야 합니다.<br />올인내신은 거기까지 봅니다.
            </p>

            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 4px 32px rgba(0,0,0,0.05)' }}>
              <div className="sinaesin-compare-header">
                {['항목', '일반 학원', '혼자 공부', '올인내신'].map((h, i) => (
                  <div key={h} style={{ padding: '18px 16px', fontSize: '0.82rem', fontWeight: 700, textAlign: 'center', color: i === 3 ? 'white' : 'rgba(255,255,255,0.5)', background: i === 3 ? 'var(--indigo)' : undefined, borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : undefined }}>
                    {h}
                  </div>
                ))}
              </div>
              {[
                { label: '킬러 문제 집중 대비', vals: ['△', '✗', '✓'] },
                { label: '학습 현황 관리', vals: ['✓', '✗', '✓'] },
                { label: 'AI 변형 문제 제공', vals: ['✗', '✗', '✓'] },
                { label: '고등 문법 선행', vals: ['△', '✗', '✓'] },
                { label: '학군지 기출 제공', vals: ['△', '✗', '✓'] },
                { label: '오답 누적 & 재출제', vals: ['✗', '✗', '✓'] },
              ].map((row) => (
                <div key={row.label} className="sinaesin-compare-row">
                  <div style={{ padding: '16px', fontSize: '0.82rem', textAlign: 'left', color: 'var(--navy)', fontWeight: 600, display: 'flex', alignItems: 'center' }}>{row.label}</div>
                  {row.vals.map((v, i) => (
                    <div key={i} style={{ padding: '16px', fontSize: '0.9rem', textAlign: 'center', borderLeft: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: i === 2 ? 'var(--indigo-soft)' : undefined, fontWeight: i === 2 ? 700 : 400, color: v === '✓' ? (i === 2 ? 'var(--navy)' : '#10b981') : v === '✗' ? '#cbd5e1' : '#f59e0b' }}>
                      {v}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" style={{ padding: '96px 24px', background: '#f8f7ff', textAlign: 'center' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ display: 'inline-block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--indigo)', textTransform: 'uppercase' as const, background: 'var(--indigo-soft)', padding: '4px 12px', borderRadius: 100, marginBottom: 20 }}>
              가격 안내
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 900, lineHeight: 1.25, color: 'var(--navy)', marginBottom: 16 }}>
              명확하게, 딱 이만큼입니다.
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.85, margin: '0 auto', maxWidth: 520 }}>
              숨겨진 비용 없이, 4주 단위로 운영됩니다.
            </p>

            <div style={{ maxWidth: 520, margin: '56px auto 0', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: '0 8px 48px rgba(30,27,75,0.12)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <div className="sinaesin-pricing-top" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', padding: '44px 44px 36px', textAlign: 'center', color: 'white', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)', top: -80, right: -80 }} />
                <h3 className="sinaesin-serif" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 20, position: 'relative' }}>
                  올인내신 · 4주 수강료
                </h3>
                <div style={{ fontSize: '3.4rem', fontWeight: 900, lineHeight: 1, letterSpacing: '-2px', position: 'relative' }}>₩180,000</div>
                <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', marginTop: 8, position: 'relative' }}>교재비 별도</div>
                <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc', fontSize: '0.78rem', fontWeight: 700, padding: '4px 14px', borderRadius: 100, marginTop: 14, position: 'relative' }}>
                  ✦ 4주 완성 프로그램
                </div>
              </div>
              <div className="sinaesin-pricing-body" style={{ background: 'white', padding: '40px 44px', textAlign: 'left' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-light)', textTransform: 'uppercase' as const, marginBottom: 20 }}>포함 항목</div>
                {[
                  ['녹화 강의', '교과서별·문법별, 언제든 다시 볼 수 있어요'],
                  ['주 4회 그룹 온라인 클리닉', '함께 공부하고, 스케줄 점검하고, 오답을 선생님이 직접 설명합니다'],
                  ['교과서 본문 암기', '자체 플랫폼으로 학습 현황 실시간 관리'],
                  ['기출 문제 뱅크', '오답 자동 누적 및 재출제'],
                  ['성취도 리포트', '학부모 공유 가능'],
                ].map(([title, desc]) => (
                  <div key={title} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--mint-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: 'var(--mint)', flexShrink: 0, marginTop: 2, fontWeight: 900 }}>✓</div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, wordBreak: 'keep-all' as const, textAlign: 'left' }}>
                      <strong style={{ color: 'var(--navy)' }}>{title}</strong> — {desc}
                    </span>
                  </div>
                ))}
                <a href="#kakao" className="sinaesin-pricing-cta">
                  상담 후 결제하기
                  <span style={{ fontSize: '0.78rem', fontWeight: 400, opacity: 0.8, display: 'block', marginTop: 2 }}>카카오톡으로 먼저 문의해주세요</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* KAKAO */}
        <section id="kakao" style={{ padding: '96px 24px', background: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ display: 'inline-block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--indigo)', textTransform: 'uppercase' as const, background: 'var(--indigo-soft)', padding: '4px 12px', borderRadius: 100, marginBottom: 20 }}>
              문의
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 900, lineHeight: 1.25, color: 'var(--navy)', marginBottom: 16 }}>
              우리 아이한테 맞을지<br />먼저 물어보세요.
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.85, margin: '0 auto', maxWidth: 520 }}>
              커리큘럼, 학습 방식, 현재 수준에서 시작 가능한지 — 무엇이든 편하게 물어보세요.
            </p>
            <a
              href="http://pf.kakao.com/_xjVAxmG"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#FEE500', color: '#1a1a1a', padding: '16px 36px', borderRadius: 12, fontSize: '1rem', fontWeight: 700, cursor: 'pointer', marginTop: 36, textDecoration: 'none', transition: 'all 0.25s' }}
            >
              💬 카카오톡으로 문의하기
            </a>
            <p style={{ marginTop: 16, fontSize: '0.8rem', color: 'var(--text-light)' }}>평일 AM 10:00 – PM 5:00 · 주말·공휴일 휴무</p>
          </div>
        </section>

      </main>

      <FooterSection />
    </>
  );
}
