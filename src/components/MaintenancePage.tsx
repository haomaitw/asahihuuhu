import { BrandMark } from './BrandMark'

type Props = {
  message?: string | null
}

// Fixed particle positions — deterministic to avoid SSR/client mismatch
const PARTICLES: { x: number; bottom: number; dur: number; delay: number; s: number; op: number }[] = [
  { x: 7,  bottom: 15, dur: 7.2, delay: 0,   s: 14, op: 0.13 },
  { x: 16, bottom: 5,  dur: 9.1, delay: 1.4, s: 20, op: 0.09 },
  { x: 27, bottom: 20, dur: 6.5, delay: 0.7, s: 10, op: 0.16 },
  { x: 36, bottom: 8,  dur: 8.3, delay: 2.1, s: 16, op: 0.11 },
  { x: 45, bottom: 12, dur: 7.6, delay: 0.3, s: 12, op: 0.14 },
  { x: 54, bottom: 4,  dur: 6.9, delay: 1.8, s: 8,  op: 0.18 },
  { x: 63, bottom: 18, dur: 8.8, delay: 0.9, s: 18, op: 0.10 },
  { x: 72, bottom: 6,  dur: 7.1, delay: 2.5, s: 12, op: 0.13 },
  { x: 81, bottom: 10, dur: 9.4, delay: 1.1, s: 22, op: 0.08 },
  { x: 90, bottom: 14, dur: 6.7, delay: 0.5, s: 10, op: 0.15 },
  { x: 20, bottom: 3,  dur: 8.0, delay: 3.0, s: 8,  op: 0.12 },
  { x: 58, bottom: 22, dur: 7.5, delay: 2.8, s: 14, op: 0.10 },
]

export function MaintenancePage({ message }: Props) {
  return (
    <div
      className="relative min-h-dvh overflow-hidden flex flex-col items-center justify-center px-6 text-center"
      style={{ background: 'linear-gradient(168deg, #f5f0e8 0%, #eee8da 55%, #f0ece2 100%)' }}
    >
      <style>{`
        @keyframes maint-float {
          0%   { transform: translateY(0)      scale(1);   opacity: 0; }
          8%   { opacity: 1; }
          88%  { opacity: 0.9; }
          100% { transform: translateY(-105vh) scale(1.6); opacity: 0; }
        }
        @keyframes maint-breathe {
          0%, 100% { transform: scale(1)    translateY(0px); }
          50%       { transform: scale(1.05) translateY(-7px); }
        }
        @keyframes maint-glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.08); }
        }
        @keyframes maint-fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Ambient sea-glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 55% 45% at 50% 55%, rgba(145,190,220,0.20) 0%, transparent 70%)',
          animation: 'maint-glow 6s ease-in-out infinite',
        }}
      />

      {/* Floating ice particles */}
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.x}%`,
            bottom: `${p.bottom}%`,
            width: p.s,
            height: p.s,
            backgroundColor: 'rgba(120, 175, 215, 0.40)',
            opacity: p.op,
            animation: `maint-float ${p.dur}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">

        {/* Kakigori SVG — animated breathing */}
        <div style={{ animation: 'maint-breathe 5s ease-in-out infinite' }} className="mb-10">
          <svg width="110" height="105" viewBox="0 0 110 105" fill="none" aria-hidden="true">
            {/* Bowl shadow */}
            <ellipse cx="55" cy="98" rx="35" ry="5.5" fill="#c4b8a2" opacity="0.14"/>
            {/* Bowl body arc */}
            <path d="M18 64 Q18 88 55 88 Q92 88 92 64"
              fill="none" stroke="#8b7d6b" strokeWidth="1.3" opacity="0.22"/>
            {/* Bowl rim */}
            <ellipse cx="55" cy="64" rx="37" ry="9"
              fill="none" stroke="#8b7d6b" strokeWidth="1.1" opacity="0.18"/>
            {/* Bowl interior fill */}
            <ellipse cx="55" cy="64" rx="33" ry="6" fill="rgba(245,240,230,0.38)"/>

            {/* Ice mound — layered ellipses from wide to narrow */}
            <ellipse cx="55" cy="61" rx="33" ry="13" fill="rgba(210,233,248,0.38)"/>
            <ellipse cx="55" cy="50" rx="27" ry="12" fill="rgba(222,241,253,0.44)"/>
            <ellipse cx="55" cy="40" rx="20" ry="11" fill="rgba(232,247,255,0.50)"/>
            <ellipse cx="55" cy="31" rx="14" ry="9"  fill="rgba(240,251,255,0.55)"/>
            <ellipse cx="55" cy="24" rx="9"  ry="7"  fill="rgba(247,253,255,0.65)"/>
            <ellipse cx="55" cy="18" rx="5"  ry="4"  fill="rgba(252,255,255,0.75)"/>

            {/* Syrup drizzle */}
            <path d="M37 51 Q44 57 52 53 Q61 49 67 55"
              stroke="#f0c878" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.42"/>
            <circle cx="35" cy="47" r="4"   fill="#f5d08a" opacity="0.36"/>
            <circle cx="74" cy="44" r="2.8" fill="#f5d08a" opacity="0.30"/>

            {/* Blue sparkle glints */}
            <circle cx="31" cy="41" r="1.5" fill="#6ab4d8" opacity="0.45"/>
            <circle cx="78" cy="38" r="1.2" fill="#6ab4d8" opacity="0.38"/>
            <circle cx="55" cy="16" r="1.5" fill="#8cc8e0" opacity="0.52"/>
            <circle cx="45" cy="30" r="1"   fill="#a8ccd8" opacity="0.35"/>
            <circle cx="66" cy="33" r="1"   fill="#a8ccd8" opacity="0.30"/>

            {/* ✦ Cross sparkles */}
            <line x1="27" y1="35" x2="27" y2="40" stroke="#8cc8e0" strokeWidth="1.1" opacity="0.48"/>
            <line x1="24.5" y1="37.5" x2="29.5" y2="37.5" stroke="#8cc8e0" strokeWidth="1.1" opacity="0.48"/>
            <line x1="82" y1="51" x2="82" y2="56" stroke="#8cc8e0" strokeWidth="1"   opacity="0.42"/>
            <line x1="79.5" y1="53.5" x2="84.5" y2="53.5" stroke="#8cc8e0" strokeWidth="1" opacity="0.42"/>
          </svg>
        </div>

        {/* Brand mark */}
        <div style={{ animation: 'maint-fade-up 0.9s ease-out 0.2s both' }} className="mb-10">
          <BrandMark variant="black" className="h-12 opacity-80" />
        </div>

        {/* Eyebrow */}
        <p
          className="font-averia text-[10px] tracking-[0.38em] text-sea-500/50 uppercase mb-5"
          style={{ animation: 'maint-fade-up 0.9s ease-out 0.45s both' }}
        >
          UNDER MAINTENANCE
        </p>

        {/* Heading */}
        <h1
          className="font-serif text-[3.2rem] font-light tracking-[0.18em] text-ink/78 mb-2 leading-none"
          style={{ animation: 'maint-fade-up 0.9s ease-out 0.65s both' }}
        >
          一時休業
        </h1>
        <p
          className="font-sans font-light text-sm tracking-[0.28em] text-ink/38 mb-9"
          style={{ animation: 'maint-fade-up 0.9s ease-out 0.80s both' }}
        >
          維護作業中
        </p>

        {/* CMS message */}
        {message ? (
          <p
            className="text-sm text-ink/55 max-w-[280px] leading-relaxed mb-8 whitespace-pre-line font-sans font-light"
            style={{ animation: 'maint-fade-up 0.9s ease-out 0.95s both' }}
          >
            {message}
          </p>
        ) : null}

        {/* Closing line */}
        <p
          className="font-sans font-light text-[11px] tracking-[0.22em] text-ink/28"
          style={{ animation: 'maint-fade-up 0.9s ease-out 1.1s both' }}
        >
          感謝您的耐心等候，我們即將恢復服務。
        </p>
      </div>
    </div>
  )
}
