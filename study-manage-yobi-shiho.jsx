import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Constants & Theme
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const SUBJECTS = [
  '憲法',
  '行政法',
  '民法',
  '商法',
  '民訴法',
  '刑法',
  '刑訴法',
  '実務基礎',
];
const MATERIALS = ['過去問', '重要問題集', '講義', '答練', '基本書', '判例集'];
const STUDY_TYPES = ['インプット', '演習', '復習'];
const MISTAKE_CAUSES = [
  '要件落ち',
  'あてはめ薄い',
  '規範曖昧',
  '時間不足',
  '論点落ち',
  '形式ミス',
];

const T = {
  bg: '#F6F5F1',
  card: '#FFFFFF',
  border: '#E4E2DB',
  borderLight: '#EFEEE9',
  text: '#1C1B18',
  sub: '#7A7870',
  muted: '#B0ADA4',
  accent: '#C8553D',
  accentLight: '#FDF0ED',
  accentDark: '#A8422E',
  success: '#3A845E',
  successLight: '#EEF7F1',
  warn: '#CC8B2D',
  warnLight: '#FFF8EC',
  danger: '#C04040',
  dangerLight: '#FFF2F2',
  dark: '#1C1B18',
  darkSoft: '#2A2924',
};

const TODAY = new Date();
const todayStr = TODAY.toISOString().split('T')[0];
const dayLabels = ['月', '火', '水', '木', '金', '土', '日'];

// ── Seed Data ──
const makeSeed = () => {
  const s = [];
  for (let d = 0; d < 14; d++) {
    const dt = new Date(TODAY);
    dt.setDate(dt.getDate() - d);
    const n = d === 0 ? 2 : Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < n; i++) {
      s.push({
        id: `sd-${d}-${i}`,
        date: dt.toISOString().split('T')[0],
        subject: SUBJECTS[Math.floor(Math.random() * 8)],
        material: MATERIALS[Math.floor(Math.random() * 6)],
        type: STUDY_TYPES[Math.floor(Math.random() * 3)],
        minutes: [30, 45, 60, 90, 120][Math.floor(Math.random() * 5)],
        confidence: Math.floor(Math.random() * 5) + 1,
        memo:
          d < 3
            ? [
                '処分性の定義が曖昧',
                '原告適格の判例整理不足',
                'あてはめの具体性が弱い',
                '時間配分ミス',
                '',
              ][Math.floor(Math.random() * 5)]
            : '',
        ankiCards: Math.floor(Math.random() * 15),
        ankiReviewed: Math.random() > 0.3,
      });
    }
  }
  return s;
};

const seedMistakes = [
  {
    id: 'm1',
    problem: 'R4予備 行政法 設問1',
    cause: '要件落ち',
    action: '訴訟要件チェックリスト作成',
    deadline: '2026-03-01',
    done: false,
    subject: '行政法',
  },
  {
    id: 'm2',
    problem: 'R3予備 民法 設問2',
    cause: 'あてはめ薄い',
    action: '事実の拾い方を答案構成で練習',
    deadline: '2026-03-05',
    done: false,
    subject: '民法',
  },
  {
    id: 'm3',
    problem: '重問 刑法 No.42',
    cause: '規範曖昧',
    action: '共同正犯の規範を自分の言葉で書き直す',
    deadline: '2026-02-28',
    done: true,
    subject: '刑法',
  },
];

const seedTemplates = [
  {
    id: 't1',
    subject: '行政法',
    topic: '取消訴訟の訴訟要件',
    norm: '処分性→原告適格→狭義の訴えの利益→被告適格→出訴期間→不服申立前置',
    ownWords:
      '①公権力の主体たる国又は公共団体が行う行為のうち②直接国民の権利義務を形成し又はその範囲を確定することが法律上認められているもの',
    pitfall: '行政指導や通達は原則処分性なし。ただし病院開設中止勧告判例に注意',
  },
  {
    id: 't2',
    subject: '刑法',
    topic: '共同正犯の成立要件',
    norm: '①共謀（意思連絡＋正犯意思）②共謀に基づく実行',
    ownWords:
      '共謀共同正犯：実行行為を分担しなくても、意思連絡と正犯意思があれば成立',
    pitfall:
      '承継的共同正犯の射程を忘れがち。因果性の観点から限定説の根拠を押さえる',
  },
];

const seedPlan = {
  weekdayHours: 3,
  weekendHours: 7,
  subjectRatios: {
    憲法: 10,
    行政法: 20,
    民法: 20,
    商法: 10,
    民訴法: 10,
    刑法: 15,
    刑訴法: 10,
    実務基礎: 5,
  },
  exerciseRatio: 60,
};

// ── Utility ──
const getWeekDates = (offset = 0) => {
  const now = new Date(TODAY);
  now.setDate(now.getDate() + offset * 7);
  const day = now.getDay();
  const mon = new Date(now);
  mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    return d.toISOString().split('T')[0];
  });
};

const pad = (n) => String(n).padStart(2, '0');
const fmtTime = (totalSec) => {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${pad(m)}:${pad(s)}`;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Icons
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const I = ({ name, size = 20, color = T.text }) => {
  const p = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };
  const icons = {
    home: (
      <svg {...p}>
        <path d='M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' />
        <polyline points='9 22 9 12 15 12 15 22' />
      </svg>
    ),
    timer: (
      <svg {...p}>
        <circle cx='12' cy='13' r='8' />
        <path d='M12 9v4l2 2' />
        <path d='M5 3L2 6' />
        <path d='M22 6l-3-3' />
      </svg>
    ),
    chart: (
      <svg {...p}>
        <rect x='3' y='12' width='4' height='9' rx='1' />
        <rect x='10' y='7' width='4' height='14' rx='1' />
        <rect x='17' y='3' width='4' height='18' rx='1' />
      </svg>
    ),
    calendar: (
      <svg {...p}>
        <rect x='3' y='4' width='18' height='18' rx='2' />
        <line x1='16' y1='2' x2='16' y2='6' />
        <line x1='8' y1='2' x2='8' y2='6' />
        <line x1='3' y1='10' x2='21' y2='10' />
      </svg>
    ),
    alert: (
      <svg {...p}>
        <path d='M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z' />
        <line x1='12' y1='9' x2='12' y2='13' />
        <line x1='12' y1='17' x2='12.01' y2='17' />
      </svg>
    ),
    layers: (
      <svg {...p}>
        <polygon points='12 2 2 7 12 12 22 7 12 2' />
        <polyline points='2 17 12 22 22 17' />
        <polyline points='2 12 12 17 22 12' />
      </svg>
    ),
    refresh: (
      <svg {...p}>
        <polyline points='23 4 23 10 17 10' />
        <path d='M20.49 15a9 9 0 11-2.12-9.36L23 10' />
      </svg>
    ),
    plus: (
      <svg {...p} strokeWidth='2.5'>
        <line x1='12' y1='5' x2='12' y2='19' />
        <line x1='5' y1='12' x2='19' y2='12' />
      </svg>
    ),
    x: (
      <svg {...p}>
        <line x1='18' y1='6' x2='6' y2='18' />
        <line x1='6' y1='6' x2='18' y2='18' />
      </svg>
    ),
    check: (
      <svg {...p} strokeWidth='2.5'>
        <polyline points='20 6 9 17 4 12' />
      </svg>
    ),
    fire: (
      <svg {...p}>
        <path d='M12 12c2-2.96 0-7-1-8 0 3.038-1.773 4.741-3 6-1.226 1.26-2 3.24-2 5a6 6 0 1012 0c0-1.532-1.056-3.94-2-5-1.786 3-2.791 3-4 2z' />
      </svg>
    ),
    sparkle: (
      <svg {...p}>
        <path d='M12 2l2.09 6.26L20 10.27l-4.91 3.82L16.18 22 12 18.27 7.82 22l1.09-7.91L4 10.27l5.91-1.01z' />
      </svg>
    ),
    target: (
      <svg {...p}>
        <circle cx='12' cy='12' r='10' />
        <circle cx='12' cy='12' r='6' />
        <circle cx='12' cy='12' r='2' />
      </svg>
    ),
    play: (
      <svg {...p} fill={color} strokeWidth='0'>
        <polygon points='6 3 20 12 6 21 6 3' />
      </svg>
    ),
    pause: (
      <svg {...p} strokeWidth='2.5'>
        <rect x='6' y='4' width='4' height='16' rx='1' />
        <rect x='14' y='4' width='4' height='16' rx='1' />
      </svg>
    ),
    skip: (
      <svg {...p}>
        <polygon points='5 4 15 12 5 20 5 4' fill={color} strokeWidth='0' />
        <line x1='19' y1='5' x2='19' y2='19' strokeWidth='2.5' />
      </svg>
    ),
    reset: (
      <svg {...p}>
        <polyline points='1 4 1 10 7 10' />
        <path d='M3.51 15a9 9 0 102.13-9.36L1 10' />
      </svg>
    ),
    coffee: (
      <svg {...p}>
        <path d='M17 8h1a4 4 0 010 8h-1' />
        <path d='M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8z' />
        <line x1='6' y1='2' x2='6' y2='4' />
        <line x1='10' y1='2' x2='10' y2='4' />
        <line x1='14' y1='2' x2='14' y2='4' />
      </svg>
    ),
    scale: (
      <svg {...p}>
        <path d='M16 3h5v5' />
        <path d='M8 3H3v5' />
        <path d='M12 22V8' />
        <path d='M21 3l-9 9' />
        <path d='M3 3l9 9' />
      </svg>
    ),
    chevDown: (
      <svg {...p} strokeWidth='2.5'>
        <polyline points='6 9 12 15 18 9' />
      </svg>
    ),
    menu: (
      <svg {...p}>
        <line x1='3' y1='12' x2='21' y2='12' />
        <line x1='3' y1='6' x2='21' y2='6' />
        <line x1='3' y1='18' x2='21' y2='18' />
      </svg>
    ),
  };
  return icons[name] || null;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Shared Components
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const MiniBar = ({ value, max, color = T.accent, h = 6 }) => (
  <div
    style={{
      width: '100%',
      height: h,
      background: T.borderLight,
      borderRadius: h / 2,
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        width: `${Math.min((value / max) * 100, 100)}%`,
        height: '100%',
        background: color,
        borderRadius: h / 2,
        transition: 'width 0.5s ease',
      }}
    />
  </div>
);

const ConfDots = ({ value, size = 7 }) => (
  <div style={{ display: 'flex', gap: 3 }}>
    {[1, 2, 3, 4, 5].map((v) => (
      <div
        key={v}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background:
            v <= value
              ? value <= 2
                ? T.danger
                : value <= 3
                ? T.warn
                : T.success
              : T.border,
          transition: 'all 0.15s',
        }}
      />
    ))}
  </div>
);

const Chip = ({ label, active, onClick, small }) => (
  <span
    onClick={onClick}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: small ? '3px 10px' : '5px 14px',
      borderRadius: 20,
      fontSize: small ? 11 : 12,
      fontWeight: active ? 600 : 500,
      cursor: 'pointer',
      transition: 'all 0.15s',
      userSelect: 'none',
      background: active ? T.text : 'transparent',
      color: active ? '#fff' : T.text,
      border: `1.5px solid ${active ? T.text : T.border}`,
    }}
  >
    {label}
  </span>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CSS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@400;500;700;900&family=DM+Mono:wght@400;500&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
::-webkit-scrollbar{width:5px;}
::-webkit-scrollbar-thumb{background:${T.border};border-radius:4px;}
body{background:${T.bg};}

@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideUp{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
@keyframes timerPulse{0%,100%{box-shadow:0 0 0 0 rgba(200,85,61,0.3)}50%{box-shadow:0 0 0 16px rgba(200,85,61,0)}}
@keyframes ringBounce{0%{transform:scale(0.8);opacity:0}50%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
@keyframes countUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

.card{background:${T.card};border:1px solid ${T.border};border-radius:14px;padding:22px;transition:all 0.2s ease;}
.card:hover{box-shadow:0 2px 16px rgba(0,0,0,0.03);}
.btn-p{background:${T.text};color:#fff;border:none;border-radius:10px;padding:10px 20px;font-family:inherit;font-weight:700;font-size:13px;cursor:pointer;transition:all 0.15s;letter-spacing:0.01em;}
.btn-p:hover{background:#333;transform:translateY(-1px);}
.btn-s{background:transparent;color:${T.text};border:1.5px solid ${T.border};border-radius:10px;padding:10px 20px;font-family:inherit;font-weight:600;font-size:13px;cursor:pointer;transition:all 0.15s;}
.btn-s:hover{border-color:${T.text};}
.btn-a{background:${T.accent};color:#fff;border:none;border-radius:10px;padding:10px 20px;font-family:inherit;font-weight:700;font-size:13px;cursor:pointer;transition:all 0.15s;}
.btn-a:hover{background:${T.accentDark};transform:translateY(-1px);}
.input{border:1.5px solid ${T.border};border-radius:10px;padding:10px 14px;font-family:inherit;font-size:14px;width:100%;outline:none;transition:border-color 0.15s;background:#fff;}
.input:focus{border-color:${T.text};}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,0.35);backdrop-filter:blur(6px);z-index:200;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.15s ease;}
.modal{background:#fff;border-radius:20px;width:100%;max-width:500px;max-height:85vh;overflow-y:auto;padding:32px;animation:fadeIn 0.25s ease;margin:16px;}

/* Sidebar for desktop */
.sidebar{
  position:fixed;left:0;top:0;bottom:0;width:240px;background:${T.card};border-right:1px solid ${T.border};
  display:flex;flex-direction:column;z-index:60;transition:transform 0.25s ease;
}
.sidebar-item{
  display:flex;align-items:center;gap:12px;padding:11px 20px;margin:2px 12px;border-radius:10px;
  cursor:pointer;transition:all 0.12s;font-size:13px;font-weight:500;color:${T.sub};
}
.sidebar-item:hover{background:${T.bg};color:${T.text};}
.sidebar-item.active{background:${T.bg};color:${T.text};font-weight:700;}

.main-area{margin-left:240px;min-height:100vh;}
.bottom-nav{display:none;}

/* Timer circle */
.timer-ring{position:relative;width:220px;height:220px;}
.timer-ring svg{transform:rotate(-90deg);}

@media(max-width:860px){
  .sidebar{transform:translateX(-100%);}
  .sidebar.open{transform:translateX(0);box-shadow:4px 0 24px rgba(0,0,0,0.1);}
  .main-area{margin-left:0;padding-bottom:80px;}
  .bottom-nav{
    display:flex;position:fixed;bottom:0;left:0;right:0;background:rgba(255,255,255,0.92);
    backdrop-filter:blur(16px);border-top:1px solid ${T.border};justify-content:space-around;
    padding:6px 0 env(safe-area-inset-bottom,12px);z-index:60;
  }
  .bottom-nav-item{
    display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 0;
    cursor:pointer;opacity:0.4;transition:all 0.15s;position:relative;font-size:10px;font-weight:500;
  }
  .bottom-nav-item.active{opacity:1;}
  .bottom-nav-item.active::after{content:'';position:absolute;top:-2px;left:50%;transform:translateX(-50%);width:4px;height:4px;border-radius:50%;background:${T.accent};}
  .mobile-header{display:flex !important;}
}
@media(min-width:861px){
  .mobile-header{display:none !important;}
}
`;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Timer Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function TimerView({ onSessionComplete }) {
  const [mode, setMode] = useState('normal'); // normal | pomodoro
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // normal: counts up
  const [remaining, setRemaining] = useState(25 * 60); // pomodoro: counts down
  const [pomodoroPhase, setPomodoroPhase] = useState('work'); // work | shortBreak | longBreak
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [totalWorked, setTotalWorked] = useState(0);

  // Pomodoro settings
  const [workMin, setWorkMin] = useState(25);
  const [shortBreakMin, setShortBreakMin] = useState(5);
  const [longBreakMin, setLongBreakMin] = useState(15);
  const [longBreakEvery] = useState(4);

  const [subject, setSubject] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

  const intervalRef = useRef(null);
  const audioCtxRef = useRef(null);

  const playBeep = useCallback(() => {
    try {
      if (!audioCtxRef.current)
        audioCtxRef.current = new (window.AudioContext ||
          window.webkitAudioContext)();
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (!isRunning) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      if (mode === 'normal') {
        setElapsed((p) => p + 1);
        setTotalWorked((p) => p + 1);
      } else {
        setRemaining((p) => {
          if (p <= 1) {
            playBeep();
            // Phase complete
            if (pomodoroPhase === 'work') {
              const newCount = pomodoroCount + 1;
              setPomodoroCount(newCount);
              if (newCount % longBreakEvery === 0) {
                setPomodoroPhase('longBreak');
                return longBreakMin * 60;
              } else {
                setPomodoroPhase('shortBreak');
                return shortBreakMin * 60;
              }
            } else {
              setPomodoroPhase('work');
              return workMin * 60;
            }
          }
          if (pomodoroPhase === 'work') setTotalWorked((t) => t + 1);
          return p - 1;
        });
      }
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [
    isRunning,
    mode,
    pomodoroPhase,
    pomodoroCount,
    workMin,
    shortBreakMin,
    longBreakMin,
    longBreakEvery,
    playBeep,
  ]);

  const handleReset = () => {
    setIsRunning(false);
    if (totalWorked > 60) setShowComplete(true);
    else {
      setElapsed(0);
      setRemaining(workMin * 60);
      setPomodoroCount(0);
      setPomodoroPhase('work');
      setTotalWorked(0);
    }
  };

  const handleSkipPhase = () => {
    if (mode !== 'pomodoro') return;
    playBeep();
    if (pomodoroPhase === 'work') {
      const nc = pomodoroCount + 1;
      setPomodoroCount(nc);
      if (nc % longBreakEvery === 0) {
        setPomodoroPhase('longBreak');
        setRemaining(longBreakMin * 60);
      } else {
        setPomodoroPhase('shortBreak');
        setRemaining(shortBreakMin * 60);
      }
    } else {
      setPomodoroPhase('work');
      setRemaining(workMin * 60);
    }
  };

  const handleFinishSession = () => {
    const mins = Math.round(totalWorked / 60);
    if (mins > 0 && subject) onSessionComplete?.({ subject, minutes: mins });
    setShowComplete(false);
    setElapsed(0);
    setRemaining(workMin * 60);
    setPomodoroCount(0);
    setPomodoroPhase('work');
    setTotalWorked(0);
    setSubject('');
  };

  const displayTime = mode === 'normal' ? elapsed : remaining;
  const totalDuration =
    mode === 'pomodoro'
      ? (pomodoroPhase === 'work'
          ? workMin
          : pomodoroPhase === 'shortBreak'
          ? shortBreakMin
          : longBreakMin) * 60
      : 1;
  const progress = mode === 'pomodoro' ? 1 - remaining / totalDuration : 0;
  const circumference = 2 * Math.PI * 96;

  const phaseColors = {
    work: T.accent,
    shortBreak: T.success,
    longBreak: '#6B7FD7',
  };
  const phaseLabels = {
    work: '集中',
    shortBreak: '小休憩',
    longBreak: '長休憩',
  };
  const currentColor =
    mode === 'pomodoro' ? phaseColors[pomodoroPhase] : T.accent;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div
          style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.02em' }}
        >
          タイマー
        </div>
        <button
          className='btn-s'
          onClick={() => setShowSettings(true)}
          style={{ padding: '7px 14px', fontSize: 12 }}
        >
          設定
        </button>
      </div>

      {/* Mode Toggle */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          background: T.bg,
          borderRadius: 12,
          padding: 4,
          border: `1px solid ${T.border}`,
        }}
      >
        {[
          { id: 'normal', label: '通常タイマー' },
          { id: 'pomodoro', label: 'ポモドーロ' },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => {
              if (!isRunning) {
                setMode(m.id);
                if (m.id === 'pomodoro') {
                  setRemaining(workMin * 60);
                  setPomodoroPhase('work');
                }
              }
            }}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 10,
              border: 'none',
              fontSize: 13,
              fontWeight: mode === m.id ? 700 : 500,
              background: mode === m.id ? T.card : 'transparent',
              color: mode === m.id ? T.text : T.sub,
              cursor: 'pointer',
              transition: 'all 0.15s',
              boxShadow: mode === m.id ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
              fontFamily: 'inherit',
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Subject Quick Select */}
      <div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: T.sub,
            marginBottom: 8,
          }}
        >
          科目を選択
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {SUBJECTS.map((s) => (
            <Chip
              key={s}
              label={s}
              active={subject === s}
              onClick={() => setSubject(s)}
              small
            />
          ))}
        </div>
      </div>

      {/* Timer Display */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '20px 0',
        }}
      >
        {mode === 'pomodoro' && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 14px',
              borderRadius: 20,
              marginBottom: 16,
              background: phaseColors[pomodoroPhase] + '18',
              border: `1.5px solid ${phaseColors[pomodoroPhase]}40`,
            }}
          >
            {pomodoroPhase === 'work' ? (
              <I name='target' size={14} color={currentColor} />
            ) : (
              <I name='coffee' size={14} color={currentColor} />
            )}
            <span
              style={{ fontSize: 12, fontWeight: 700, color: currentColor }}
            >
              {phaseLabels[pomodoroPhase]}
            </span>
            <span style={{ fontSize: 11, color: T.sub }}>
              #{pomodoroCount + 1}
            </span>
          </div>
        )}

        <div
          className='timer-ring'
          style={{
            animation: isRunning
              ? 'timerPulse 2s ease-in-out infinite'
              : 'none',
          }}
        >
          <svg width='220' height='220'>
            <circle
              cx='110'
              cy='110'
              r='96'
              fill='none'
              stroke={T.borderLight}
              strokeWidth='6'
            />
            {mode === 'pomodoro' && (
              <circle
                cx='110'
                cy='110'
                r='96'
                fill='none'
                stroke={currentColor}
                strokeWidth='6'
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress)}
                strokeLinecap='round'
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            )}
          </svg>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                fontSize: 52,
                fontWeight: 900,
                fontFamily: "'DM Mono', monospace",
                letterSpacing: '-0.03em',
                color: T.text,
                lineHeight: 1,
              }}
            >
              {fmtTime(displayTime)}
            </div>
            {mode === 'normal' && totalWorked > 0 && (
              <div style={{ fontSize: 12, color: T.sub, marginTop: 8 }}>
                合計 {Math.floor(totalWorked / 60)}分
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginTop: 24,
          }}
        >
          <button
            onClick={handleReset}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              border: `1.5px solid ${T.border}`,
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <I name='reset' size={18} color={T.sub} />
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              border: 'none',
              background: isRunning ? T.text : currentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s',
              boxShadow: `0 4px 20px ${
                isRunning ? 'rgba(0,0,0,0.15)' : currentColor + '44'
              }`,
            }}
          >
            <I name={isRunning ? 'pause' : 'play'} size={24} color='#fff' />
          </button>

          {mode === 'pomodoro' && (
            <button
              onClick={handleSkipPhase}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                border: `1.5px solid ${T.border}`,
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <I name='skip' size={18} color={T.sub} />
            </button>
          )}
          {mode === 'normal' && <div style={{ width: 44 }} />}
        </div>

        {/* Pomodoro progress dots */}
        {mode === 'pomodoro' && (
          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            {Array.from({ length: longBreakEvery }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  background:
                    i < pomodoroCount % longBreakEvery
                      ? currentColor
                      : i === pomodoroCount % longBreakEvery &&
                        pomodoroPhase === 'work'
                      ? currentColor + '44'
                      : T.border,
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Session Stats Card */}
      {totalWorked > 0 && (
        <div className='card' style={{ animation: 'fadeIn 0.3s ease' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: T.sub, fontWeight: 600 }}>
                今回のセッション
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  fontFamily: "'DM Mono', monospace",
                  marginTop: 4,
                }}
              >
                {Math.floor(totalWorked / 60)}
                <span style={{ fontSize: 13, color: T.sub }}>分</span>
                {mode === 'pomodoro' && (
                  <span style={{ fontSize: 13, color: T.sub, marginLeft: 8 }}>
                    🍅×{pomodoroCount}
                  </span>
                )}
              </div>
            </div>
            <button
              className='btn-a'
              onClick={handleReset}
              style={{ padding: '8px 16px' }}
            >
              記録して終了
            </button>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {showComplete && (
        <div className='overlay' onClick={() => setShowComplete(false)}>
          <div
            className='modal'
            onClick={(e) => e.stopPropagation()}
            style={{ textAlign: 'center', padding: '40px 32px' }}
          >
            <div
              style={{ animation: 'ringBounce 0.5s ease', marginBottom: 20 }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  background: T.success,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                }}
              >
                <I name='check' size={32} color='#fff' />
              </div>
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>
              お疲れさまでした
            </div>
            <div
              style={{
                fontSize: 36,
                fontWeight: 900,
                fontFamily: "'DM Mono', monospace",
                color: T.accent,
              }}
            >
              {Math.round(totalWorked / 60)}
              <span style={{ fontSize: 16, color: T.sub }}>分</span>
              {mode === 'pomodoro' && (
                <span style={{ fontSize: 16, color: T.sub, marginLeft: 8 }}>
                  🍅×{pomodoroCount}
                </span>
              )}
            </div>

            {!subject && (
              <div style={{ marginTop: 20, textAlign: 'left' }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: T.sub,
                    marginBottom: 8,
                  }}
                >
                  科目を選択して記録
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 6,
                    justifyContent: 'center',
                  }}
                >
                  {SUBJECTS.map((s) => (
                    <Chip
                      key={s}
                      label={s}
                      active={subject === s}
                      onClick={() => setSubject(s)}
                    />
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button
                className='btn-s'
                onClick={() => {
                  setShowComplete(false);
                  setElapsed(0);
                  setRemaining(workMin * 60);
                  setPomodoroCount(0);
                  setPomodoroPhase('work');
                  setTotalWorked(0);
                }}
                style={{ flex: 1 }}
              >
                記録しない
              </button>
              <button
                className='btn-a'
                onClick={handleFinishSession}
                style={{
                  flex: 1,
                  opacity: subject ? 1 : 0.5,
                  pointerEvents: subject ? 'auto' : 'none',
                }}
              >
                記録する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className='overlay' onClick={() => setShowSettings(false)}>
          <div className='modal' onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 700 }}>
                ポモドーロ設定
              </div>
              <div
                onClick={() => setShowSettings(false)}
                style={{ cursor: 'pointer', padding: 4 }}
              >
                <I name='x' size={20} color={T.sub} />
              </div>
            </div>
            {[
              {
                label: '集中時間',
                value: workMin,
                set: (v) => {
                  setWorkMin(v);
                  if (!isRunning && pomodoroPhase === 'work')
                    setRemaining(v * 60);
                },
              },
              {
                label: '小休憩',
                value: shortBreakMin,
                set: (v) => {
                  setShortBreakMin(v);
                  if (!isRunning && pomodoroPhase === 'shortBreak')
                    setRemaining(v * 60);
                },
              },
              {
                label: '長休憩',
                value: longBreakMin,
                set: (v) => {
                  setLongBreakMin(v);
                  if (!isRunning && pomodoroPhase === 'longBreak')
                    setRemaining(v * 60);
                },
              },
            ].map(({ label, value, set }) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    onClick={() => set(Math.max(1, value - 5))}
                    className='btn-s'
                    style={{ padding: '6px 12px', fontSize: 16, lineHeight: 1 }}
                  >
                    −
                  </button>
                  <span
                    style={{
                      width: 40,
                      textAlign: 'center',
                      fontSize: 18,
                      fontWeight: 700,
                      fontFamily: "'DM Mono', monospace",
                    }}
                  >
                    {value}
                  </span>
                  <button
                    onClick={() => set(value + 5)}
                    className='btn-s'
                    style={{ padding: '6px 12px', fontSize: 16, lineHeight: 1 }}
                  >
                    +
                  </button>
                  <span style={{ fontSize: 12, color: T.sub }}>分</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Dashboard
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function DashboardView({
  weeklyHours,
  exerciseRatio,
  subjectBreakdown,
  weakPoints,
  dailyMinutes,
  plan,
  todaySessions,
  weekDates,
  mistakeCauseCounts,
  sessions,
  yesterdayMemos,
  showReview,
  setShowReview,
}) {
  const maxD = Math.max(...dailyMinutes.map((d) => d.minutes), 1);
  const tw = plan.weekdayHours * 5 + plan.weekendHours * 2;
  const pct = Math.min((parseFloat(weeklyHours) / tw) * 100, 100);

  const ankiMissed = useMemo(() => {
    let c = 0;
    weekDates.forEach((d) => {
      const ds = sessions.filter((s) => s.date === d);
      if (ds.length > 0 && !ds.some((s) => s.ankiReviewed)) c++;
    });
    return c;
  }, [sessions, weekDates]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Review Banner */}
      {yesterdayMemos.length > 0 && !showReview && (
        <div
          onClick={() => setShowReview(true)}
          style={{
            background: `linear-gradient(135deg,${T.accent},${T.accentDark})`,
            borderRadius: 14,
            padding: '16px 20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            animation: 'fadeIn 0.4s ease',
          }}
        >
          <div>
            <div
              style={{
                color: 'rgba(255,255,255,0.65)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                marginBottom: 4,
              }}
            >
              AI レビュー
            </div>
            <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>
              昨日の詰まりから今日の復習を提案
            </div>
          </div>
          <div
            style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: 10,
              padding: '8px 12px',
            }}
          >
            <I name='sparkle' size={18} color='#fff' />
          </div>
        </div>
      )}

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3,1fr)',
          gap: 10,
        }}
      >
        {[
          {
            v: weeklyHours,
            u: '時間/週',
            bar: { v: parseFloat(weeklyHours), m: tw, c: T.accent },
          },
          {
            v: `${exerciseRatio}%`,
            u: '演習比率',
            bar: {
              v: exerciseRatio,
              m: 100,
              c: exerciseRatio >= plan.exerciseRatio ? T.success : T.warn,
            },
          },
          {
            v: todaySessions.length,
            u: '今日のログ',
            bar: {
              v: todaySessions.reduce((a, s) => a + s.minutes, 0),
              m: 180,
              c: T.success,
            },
          },
        ].map((s, i) => (
          <div
            key={i}
            className='card'
            style={{
              padding: 16,
              textAlign: 'center',
              animation: `countUp ${0.3 + i * 0.1}s ease`,
            }}
          >
            <div
              style={{
                fontSize: 26,
                fontWeight: 900,
                fontFamily: "'DM Mono', monospace",
                letterSpacing: '-0.03em',
              }}
            >
              {s.v}
            </div>
            <div
              style={{
                fontSize: 11,
                color: T.sub,
                fontWeight: 500,
                marginTop: 2,
              }}
            >
              {s.u}
            </div>
            <div style={{ marginTop: 8 }}>
              <MiniBar value={s.bar.v} max={s.bar.m} color={s.bar.c} />
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Chart */}
      <div className='card'>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700 }}>今週の学習時間</div>
          <div style={{ fontSize: 11, color: T.sub }}>
            目標 {tw}h / 達成 {pct.toFixed(0)}%
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 8,
            height: 120,
          }}
        >
          {dailyMinutes.map((d, i) => {
            const h = maxD > 0 ? (d.minutes / maxD) * 100 : 0;
            const is2day = d.date === todayStr;
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontFamily: "'DM Mono', monospace",
                    color: T.sub,
                    fontWeight: 500,
                  }}
                >
                  {d.minutes > 0 ? `${(d.minutes / 60).toFixed(1)}h` : ''}
                </div>
                <div
                  style={{
                    width: '100%',
                    maxWidth: 42,
                    height: `${Math.max(h, 4)}%`,
                    minHeight: 4,
                    borderRadius: 6,
                    background: is2day
                      ? T.accent
                      : d.minutes > 0
                      ? T.text
                      : T.border,
                    opacity: is2day ? 1 : d.minutes > 0 ? 0.65 : 0.25,
                    transition: 'height 0.5s ease',
                  }}
                />
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: is2day ? 700 : 500,
                    color: is2day ? T.accent : T.sub,
                  }}
                >
                  {dayLabels[i]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subject Breakdown + Weak Points side by side on desktop */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
          gap: 16,
        }}
      >
        <div className='card'>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>
            科目配分
          </div>
          {SUBJECTS.map((s) => {
            const mins = subjectBreakdown[s] || 0;
            const total = Object.values(subjectBreakdown).reduce(
              (a, b) => a + b,
              0
            );
            const p = total > 0 ? Math.round((mins / total) * 100) : 0;
            const tgt = plan.subjectRatios[s] || 0;
            return (
              <div
                key={s}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 7,
                }}
              >
                <div
                  style={{
                    width: 48,
                    fontSize: 12,
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {s}
                </div>
                <div style={{ flex: 1 }}>
                  <MiniBar
                    value={p}
                    max={Math.max(...Object.values(plan.subjectRatios), 1)}
                    color={Math.abs(p - tgt) > 10 ? T.warn : T.text}
                    h={7}
                  />
                </div>
                <div
                  style={{
                    width: 32,
                    fontSize: 11,
                    fontFamily: "'DM Mono', monospace",
                    color: T.sub,
                    textAlign: 'right',
                  }}
                >
                  {p}%
                </div>
                <div
                  style={{
                    width: 32,
                    fontSize: 10,
                    color: T.muted,
                    textAlign: 'right',
                  }}
                >
                  /{tgt}%
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {weakPoints.length > 0 && (
            <div
              className='card'
              style={{ borderLeft: `3px solid ${T.danger}` }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <I name='target' size={15} color={T.danger} />
                <div style={{ fontSize: 14, fontWeight: 700 }}>弱点トップ3</div>
              </div>
              {weakPoints.map(([subj, cnt], i) => (
                <div
                  key={subj}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '7px 0',
                    borderBottom:
                      i < weakPoints.length - 1
                        ? `1px solid ${T.borderLight}`
                        : 'none',
                  }}
                >
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 6,
                        background:
                          i === 0 ? T.danger : i === 1 ? T.warn : T.border,
                        color: i < 2 ? '#fff' : T.sub,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    >
                      {i + 1}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>
                      {subj}
                    </span>
                  </div>
                  <span style={{ fontSize: 12, color: T.sub }}>低×{cnt}</span>
                </div>
              ))}
            </div>
          )}

          {mistakeCauseCounts.length > 0 && mistakeCauseCounts[0][1] >= 2 && (
            <div
              className='card'
              style={{ background: T.warnLight, borderColor: '#FFE0B2' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <I name='alert' size={15} color={T.warn} />
                <span
                  style={{ fontSize: 13, fontWeight: 700, color: '#E65100' }}
                >
                  繰り返しパターン
                </span>
              </div>
              <div style={{ fontSize: 13, color: T.text, lineHeight: 1.6 }}>
                「{mistakeCauseCounts[0][0]}」が{mistakeCauseCounts[0][1]}回発生
              </div>
            </div>
          )}

          {ankiMissed > 0 && (
            <div
              className='card'
              style={{
                background: T.dangerLight,
                borderColor: '#FFCDD2',
                padding: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <I name='refresh' size={15} color={T.danger} />
                <span
                  style={{ fontSize: 13, fontWeight: 600, color: T.danger }}
                >
                  今週 {ankiMissed}日 Anki復習未完了
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Today's Logs */}
      {todaySessions.length > 0 && (
        <div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              marginBottom: 10,
              paddingLeft: 2,
            }}
          >
            今日の記録
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))',
              gap: 8,
            }}
          >
            {todaySessions.map((s) => (
              <div key={s.id} className='card' style={{ padding: 14 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <Chip label={s.subject} active small />
                    <span style={{ fontSize: 12, color: T.sub }}>
                      {s.material}
                    </span>
                    <span style={{ fontSize: 11, color: T.muted }}>
                      · {s.type}
                    </span>
                  </div>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <ConfDots value={s.confidence} size={6} />
                    <span
                      style={{
                        fontSize: 12,
                        fontFamily: "'DM Mono', monospace",
                        color: T.sub,
                      }}
                    >
                      {s.minutes}分
                    </span>
                  </div>
                </div>
                {s.memo && (
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 12,
                      color: T.sub,
                      paddingLeft: 4,
                    }}
                  >
                    💭 {s.memo}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReview && (
        <div className='overlay' onClick={() => setShowReview(false)}>
          <div className='modal' onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: T.accent,
                    letterSpacing: '0.08em',
                    marginBottom: 4,
                  }}
                >
                  AI REVIEW
                </div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>
                  今日の復習提案
                </div>
              </div>
              <div
                onClick={() => setShowReview(false)}
                style={{ cursor: 'pointer', padding: 4 }}
              >
                <I name='x' size={20} color={T.sub} />
              </div>
            </div>
            {yesterdayMemos.map((s, i) => (
              <div
                key={i}
                className='card'
                style={{ marginBottom: 12, padding: 16 }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <Chip label={s.subject} active small />
                  <ConfDots value={s.confidence} size={6} />
                </div>
                <div style={{ fontSize: 13, color: T.sub, marginBottom: 8 }}>
                  詰まり：{s.memo}
                </div>
                <div
                  style={{
                    background: T.accentLight,
                    borderRadius: 10,
                    padding: '10px 14px',
                    borderLeft: `3px solid ${T.accent}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: T.accent,
                      marginBottom: 4,
                    }}
                  >
                    提案
                  </div>
                  <div style={{ fontSize: 13, color: T.text, lineHeight: 1.6 }}>
                    {s.memo.includes('処分性') &&
                      '処分性の定義を自分の言葉で書き直し、判例3つの要点を整理してみましょう。'}
                    {s.memo.includes('原告適格') &&
                      '原告適格の判断枠組みを答案構成形式で再整理してみましょう。'}
                    {s.memo.includes('あてはめ') &&
                      '過去問1問のあてはめ部分だけを書き直してみましょう。'}
                    {s.memo.includes('時間') &&
                      '答案構成の時間配分パターンを最適化しましょう。'}
                    {!['処分性', '原告適格', 'あてはめ', '時間'].some((k) =>
                      s.memo.includes(k)
                    ) &&
                      '関連する論点テンプレを見直し、規範の正確性を確認しましょう。'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Plan View
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function PlanView({ plan, dailyMinutes, weekDates }) {
  const tw = plan.weekdayHours * 5 + plan.weekendHours * 2;
  const actual = dailyMinutes.reduce((a, d) => a + d.minutes, 0) / 60;
  const sched = weekDates.map((d, i) => ({
    date: d,
    day: dayLabels[i],
    target: i >= 5 ? plan.weekendHours : plan.weekdayHours,
    actual: dailyMinutes[i]?.minutes || 0,
    isWE: i >= 5,
  }));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.02em' }}>
        週間計画
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
          gap: 16,
        }}
      >
        <div className='card'>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700 }}>週間目標</div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: actual >= tw ? T.success : T.warn,
              }}
            >
              {actual.toFixed(1)}h / {tw}h
            </div>
          </div>
          <MiniBar
            value={actual}
            max={tw}
            h={10}
            color={
              actual >= tw * 0.8
                ? T.success
                : actual >= tw * 0.5
                ? T.warn
                : T.danger
            }
          />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 12,
              marginTop: 16,
            }}
          >
            {[
              { l: '平日', v: `${plan.weekdayHours}h` },
              { l: '休日', v: `${plan.weekendHours}h` },
              {
                l: '演習:復習',
                v: `${plan.exerciseRatio}:${100 - plan.exerciseRatio}`,
              },
            ].map((x) => (
              <div key={x.l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: T.sub, marginBottom: 4 }}>
                  {x.l}
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  {x.v}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='card'>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>
            日別の配分
          </div>
          {sched.map((d, i) => {
            const tm = d.target * 60;
            const p = tm > 0 ? Math.min((d.actual / tm) * 100, 100) : 0;
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 9,
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: d.isWE ? T.accentLight : T.bg,
                    fontSize: 11,
                    fontWeight: 700,
                    color: d.isWE ? T.accent : T.text,
                  }}
                >
                  {d.day}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      position: 'relative',
                      height: 22,
                      background: T.borderLight,
                      borderRadius: 6,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        borderRadius: 6,
                        width: `${Math.max(p, 2)}%`,
                        background:
                          d.actual > tm
                            ? T.success
                            : p >= 80
                            ? T.text
                            : `${T.text}88`,
                        transition: 'width 0.5s ease',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: 8,
                        fontSize: 11,
                        fontFamily: "'DM Mono', monospace",
                        fontWeight: 500,
                        color: p > 40 ? '#fff' : T.sub,
                      }}
                    >
                      {d.actual > 0 ? `${(d.actual / 60).toFixed(1)}h` : '—'}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    width: 28,
                    fontSize: 11,
                    color: T.muted,
                    textAlign: 'right',
                  }}
                >
                  {d.target}h
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className='card'
        style={{
          background: `linear-gradient(135deg,${T.dark},${T.darkSoft})`,
          color: '#fff',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 10,
          }}
        >
          <I name='sparkle' size={16} color={T.accent} />
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.5)',
              letterSpacing: '0.08em',
            }}
          >
            AI 週次提案
          </span>
        </div>
        <div
          style={{
            fontSize: 14,
            lineHeight: 1.7,
            color: 'rgba(255,255,255,0.85)',
          }}
        >
          今週は行政法の手応えが低めです。来週は行政法の演習比率を+10%にし、特に処分性・原告適格の過去問を重点的に回すことをおすすめします。
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 700,
              background: `${T.accent}33`,
              color: T.accent,
            }}
          >
            行政法 +10%
          </span>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              background: 'rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            演習重視
          </span>
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Mistakes View
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function MistakesView({ mistakes, setMistakes, mistakeCauseCounts }) {
  const [showAdd, setShowAdd] = useState(false);
  const [nw, setNw] = useState({
    problem: '',
    cause: '',
    action: '',
    deadline: '',
    subject: '',
  });
  const handleAdd = () => {
    if (!nw.problem || !nw.cause) return;
    setMistakes((p) => [...p, { ...nw, id: `m-${Date.now()}`, done: false }]);
    setNw({ problem: '', cause: '', action: '', deadline: '', subject: '' });
    setShowAdd(false);
  };

  const causeColor = (c) =>
    ({
      要件落ち: T.danger,
      規範曖昧: '#E65100',
      あてはめ薄い: '#1565C0',
      時間不足: '#7B1FA2',
      論点落ち: T.warn,
      形式ミス: T.sub,
    }[c] || T.sub);
  const causeBg = (c) =>
    ({
      要件落ち: '#FFEBEE',
      規範曖昧: '#FFF3E0',
      あてはめ薄い: '#E3F2FD',
      時間不足: '#F3E5F5',
      論点落ち: T.warnLight,
      形式ミス: T.bg,
    }[c] || T.bg);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div
          style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.02em' }}
        >
          ミス管理
        </div>
        <button
          className='btn-p'
          onClick={() => setShowAdd(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
          }}
        >
          <I name='plus' size={14} color='#fff' />
          追加
        </button>
      </div>

      {mistakeCauseCounts.length > 0 && (
        <div className='card'>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
            原因パターン分析
          </div>
          {mistakeCauseCounts.map(([c, n]) => (
            <div
              key={c}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 7,
              }}
            >
              <div
                style={{
                  width: 90,
                  fontSize: 12,
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {c}
              </div>
              <div style={{ flex: 1 }}>
                <MiniBar
                  value={n}
                  max={Math.max(...mistakeCauseCounts.map(([, x]) => x))}
                  color={n >= 2 ? T.danger : T.warn}
                  h={7}
                />
              </div>
              <div
                style={{
                  width: 24,
                  fontSize: 12,
                  fontFamily: "'DM Mono', monospace",
                  color: T.sub,
                  textAlign: 'right',
                }}
              >
                {n}
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))',
          gap: 10,
        }}
      >
        {mistakes.map((m) => (
          <div
            key={m.id}
            className='card'
            style={{
              padding: 16,
              opacity: m.done ? 0.45 : 1,
              transition: 'opacity 0.3s',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginBottom: 6,
                  }}
                >
                  {m.subject && <Chip label={m.subject} active small />}
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 6,
                      background: causeBg(m.cause),
                      color: causeColor(m.cause),
                    }}
                  >
                    {m.cause}
                  </span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                  {m.problem}
                </div>
                {m.action && (
                  <div style={{ fontSize: 12, color: T.sub }}>→ {m.action}</div>
                )}
                {m.deadline && (
                  <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
                    期限: {m.deadline}
                  </div>
                )}
              </div>
              <div
                onClick={() =>
                  setMistakes((p) =>
                    p.map((x) => (x.id === m.id ? { ...x, done: !x.done } : x))
                  )
                }
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 8,
                  cursor: 'pointer',
                  border: `2px solid ${m.done ? T.success : T.border}`,
                  background: m.done ? T.success : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s',
                  flexShrink: 0,
                }}
              >
                {m.done && <I name='check' size={13} color='#fff' />}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className='overlay' onClick={() => setShowAdd(false)}>
          <div className='modal' onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 700 }}>ミスを記録</div>
              <div
                onClick={() => setShowAdd(false)}
                style={{ cursor: 'pointer', padding: 4 }}
              >
                <I name='x' size={20} color={T.sub} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: T.sub,
                  marginBottom: 8,
                  display: 'block',
                }}
              >
                科目
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {SUBJECTS.map((s) => (
                  <Chip
                    key={s}
                    label={s}
                    active={nw.subject === s}
                    onClick={() => setNw((f) => ({ ...f, subject: s }))}
                    small
                  />
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: T.sub,
                  marginBottom: 8,
                  display: 'block',
                }}
              >
                問題
              </label>
              <input
                className='input'
                placeholder='例: R4予備 行政法 設問1'
                value={nw.problem}
                onChange={(e) =>
                  setNw((f) => ({ ...f, problem: e.target.value }))
                }
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: T.sub,
                  marginBottom: 8,
                  display: 'block',
                }}
              >
                原因カテゴリ
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {MISTAKE_CAUSES.map((c) => (
                  <Chip
                    key={c}
                    label={c}
                    active={nw.cause === c}
                    onClick={() => setNw((f) => ({ ...f, cause: c }))}
                    small
                  />
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: T.sub,
                  marginBottom: 8,
                  display: 'block',
                }}
              >
                次回やること
              </label>
              <input
                className='input'
                placeholder='具体的なアクション'
                value={nw.action}
                onChange={(e) =>
                  setNw((f) => ({ ...f, action: e.target.value }))
                }
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: T.sub,
                  marginBottom: 8,
                  display: 'block',
                }}
              >
                期限
              </label>
              <input
                className='input'
                type='date'
                value={nw.deadline}
                onChange={(e) =>
                  setNw((f) => ({ ...f, deadline: e.target.value }))
                }
              />
            </div>
            <button
              className='btn-p'
              onClick={handleAdd}
              style={{
                width: '100%',
                padding: 14,
                fontSize: 15,
                borderRadius: 14,
              }}
            >
              記録する
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Templates View
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function TemplatesView({ templates }) {
  const [exp, setExp] = useState(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div
          style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.02em' }}
        >
          論文の型
        </div>
        <button
          className='btn-s'
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
          }}
        >
          <I name='plus' size={14} />
          追加
        </button>
      </div>
      <div style={{ fontSize: 13, color: T.sub, lineHeight: 1.6 }}>
        論点テンプレート → 自分の言葉の規範 → 落とし穴まで一元管理
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))',
          gap: 12,
        }}
      >
        {templates.map((t) => (
          <div
            key={t.id}
            className='card'
            style={{ padding: 0, overflow: 'hidden' }}
          >
            <div
              onClick={() => setExp(exp === t.id ? null : t.id)}
              style={{
                padding: '16px 20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: exp === t.id ? T.bg : 'transparent',
                transition: 'background 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Chip label={t.subject} active small />
                <span style={{ fontSize: 14, fontWeight: 600 }}>{t.topic}</span>
              </div>
              <I name='chevDown' size={16} color={T.muted} />
            </div>
            {exp === t.id && (
              <div
                style={{
                  padding: '0 20px 20px',
                  animation: 'fadeIn 0.2s ease',
                }}
              >
                {[
                  {
                    label: '論点テンプレ',
                    color: T.accent,
                    bg: T.bg,
                    text: t.norm,
                  },
                  {
                    label: '自分の言葉の規範',
                    color: T.success,
                    bg: T.successLight,
                    text: t.ownWords,
                  },
                  {
                    label: '⚠ 落とし穴',
                    color: T.danger,
                    bg: T.dangerLight,
                    text: t.pitfall,
                  },
                ].map((x) => (
                  <div key={x.label} style={{ marginBottom: 10 }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: x.color,
                        letterSpacing: '0.06em',
                        marginBottom: 6,
                      }}
                    >
                      {x.label}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        lineHeight: 1.7,
                        color: T.text,
                        background: x.bg,
                        borderRadius: 10,
                        padding: '10px 14px',
                      }}
                    >
                      {x.text}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Anki View
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function AnkiView({ sessions }) {
  const wd = useMemo(() => getWeekDates(0), []);
  const da = useMemo(
    () =>
      wd.map((d, i) => {
        const ds = sessions.filter((s) => s.date === d);
        return {
          date: d,
          day: dayLabels[i],
          cards: ds.reduce((a, s) => a + (s.ankiCards || 0), 0),
          reviewed: ds.some((s) => s.ankiReviewed),
        };
      }),
    [sessions, wd]
  );
  const tc = da.reduce((a, d) => a + d.cards, 0);
  const rd = da.filter((d) => d.reviewed).length;
  const mx = Math.max(...da.map((d) => d.cards), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.02em' }}>
        Anki トラッカー
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div className='card' style={{ padding: 16, textAlign: 'center' }}>
          <div
            style={{
              fontSize: 28,
              fontWeight: 900,
              fontFamily: "'DM Mono', monospace",
            }}
          >
            {tc}
          </div>
          <div style={{ fontSize: 11, color: T.sub, marginTop: 2 }}>
            追加カード（今週）
          </div>
        </div>
        <div className='card' style={{ padding: 16, textAlign: 'center' }}>
          <div
            style={{
              fontSize: 28,
              fontWeight: 900,
              fontFamily: "'DM Mono', monospace",
              color: rd >= 5 ? T.success : rd >= 3 ? T.warn : T.danger,
            }}
          >
            {rd}
            <span style={{ fontSize: 14, color: T.sub }}>/7</span>
          </div>
          <div style={{ fontSize: 11, color: T.sub, marginTop: 2 }}>
            復習日数
          </div>
        </div>
      </div>
      <div className='card'>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>
          日別カード追加数
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 8,
            height: 100,
          }}
        >
          {da.map((d, i) => {
            const h = mx > 0 ? (d.cards / mx) * 100 : 0;
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontFamily: "'DM Mono', monospace",
                    color: T.sub,
                  }}
                >
                  {d.cards || ''}
                </div>
                <div
                  style={{
                    width: '100%',
                    maxWidth: 36,
                    height: `${Math.max(h, 4)}%`,
                    minHeight: 4,
                    borderRadius: 6,
                    background: d.cards > 0 ? T.text : T.border,
                    opacity: d.cards > 0 ? 0.75 : 0.25,
                    transition: 'height 0.5s ease',
                  }}
                />
                <div style={{ fontSize: 11, color: T.sub }}>{d.day}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div className='card'>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>
          復習ステータス
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {da.map((d, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '10px 0',
                borderRadius: 10,
                background: d.reviewed
                  ? T.successLight
                  : d.date <= todayStr
                  ? T.dangerLight
                  : T.bg,
                border: `1px solid ${
                  d.reviewed
                    ? '#A5D6A7'
                    : d.date <= todayStr
                    ? '#FFCDD2'
                    : T.border
                }`,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
                {d.day}
              </div>
              {d.reviewed ? (
                <I name='check' size={15} color={T.success} />
              ) : d.date <= todayStr ? (
                <I name='x' size={15} color={T.danger} />
              ) : (
                <div
                  style={{
                    width: 15,
                    height: 15,
                    borderRadius: 8,
                    background: T.border,
                    margin: '0 auto',
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      {rd < 5 && (
        <div
          className='card'
          style={{ background: T.warnLight, borderColor: '#FFE0B2' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 6,
            }}
          >
            <I name='alert' size={15} color={T.warn} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#E65100' }}>
              復習不足アラート
            </span>
          </div>
          <div style={{ fontSize: 13, color: T.text, lineHeight: 1.6 }}>
            Anki復習の頻度が低下しています。朝の15分をAnki復習に充てましょう。
          </div>
        </div>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Main App
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function App() {
  const [sessions, setSessions] = useState(makeSeed);
  const [mistakes, setMistakes] = useState(seedMistakes);
  const [templates] = useState(seedTemplates);
  const [plan] = useState(seedPlan);
  const [tab, setTab] = useState('dashboard');
  const [showLog, setShowLog] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const weekDates = useMemo(() => getWeekDates(0), []);
  const thisWeek = useMemo(
    () => sessions.filter((s) => weekDates.includes(s.date)),
    [sessions, weekDates]
  );
  const todayS = useMemo(
    () => sessions.filter((s) => s.date === todayStr),
    [sessions]
  );
  const weeklyMin = useMemo(
    () => thisWeek.reduce((a, s) => a + s.minutes, 0),
    [thisWeek]
  );
  const weeklyH = (weeklyMin / 60).toFixed(1);
  const subjectBk = useMemo(() => {
    const m = {};
    SUBJECTS.forEach((s) => (m[s] = 0));
    thisWeek.forEach((s) => (m[s.subject] += s.minutes));
    return m;
  }, [thisWeek]);
  const exRatio = useMemo(() => {
    const e = thisWeek
      .filter((s) => s.type === '演習')
      .reduce((a, s) => a + s.minutes, 0);
    return weeklyMin > 0 ? Math.round((e / weeklyMin) * 100) : 0;
  }, [thisWeek, weeklyMin]);
  const streak = useMemo(() => {
    let c = 0;
    for (let i = 0; i < 60; i++) {
      const d = new Date(TODAY);
      d.setDate(d.getDate() - i);
      if (sessions.some((s) => s.date === d.toISOString().split('T')[0])) c++;
      else break;
    }
    return c;
  }, [sessions]);
  const weakPts = useMemo(() => {
    const m = {};
    thisWeek
      .filter((s) => s.confidence <= 2)
      .forEach((s) => {
        m[s.subject] = (m[s.subject] || 0) + 1;
      });
    return Object.entries(m)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [thisWeek]);
  const dailyMin = useMemo(
    () =>
      weekDates.map((d) => ({
        date: d,
        minutes: sessions
          .filter((s) => s.date === d)
          .reduce((a, s) => a + s.minutes, 0),
      })),
    [weekDates, sessions]
  );
  const mCauseCounts = useMemo(() => {
    const m = {};
    mistakes.forEach((x) => {
      m[x.cause] = (m[x.cause] || 0) + 1;
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [mistakes]);
  const yMemos = useMemo(() => {
    const y = new Date(TODAY);
    y.setDate(y.getDate() - 1);
    return sessions.filter(
      (s) => s.date === y.toISOString().split('T')[0] && s.memo
    );
  }, [sessions]);

  const [lf, setLf] = useState({
    subject: '',
    material: '',
    type: '',
    minutes: 60,
    confidence: 3,
    memo: '',
    ankiCards: 0,
    ankiReviewed: false,
  });
  const handleLogSubmit = () => {
    if (!lf.subject || !lf.material || !lf.type) return;
    setSessions((p) => [
      { id: `s-${Date.now()}`, date: todayStr, ...lf },
      ...p,
    ]);
    setShowLog(false);
    setLf({
      subject: '',
      material: '',
      type: '',
      minutes: 60,
      confidence: 3,
      memo: '',
      ankiCards: 0,
      ankiReviewed: false,
    });
  };

  const handleTimerComplete = ({ subject, minutes }) => {
    setSessions((p) => [
      {
        id: `t-${Date.now()}`,
        date: todayStr,
        subject,
        material: 'タイマー',
        type: '演習',
        minutes,
        confidence: 3,
        memo: '',
        ankiCards: 0,
        ankiReviewed: false,
      },
      ...p,
    ]);
  };

  const navItems = [
    { id: 'dashboard', icon: 'home', label: 'ダッシュボード' },
    { id: 'timer', icon: 'timer', label: 'タイマー' },
    { id: 'plan', icon: 'calendar', label: '週間計画' },
    { id: 'mistakes', icon: 'alert', label: 'ミス管理' },
    { id: 'templates', icon: 'layers', label: '論文の型' },
    { id: 'anki', icon: 'refresh', label: 'Anki' },
  ];

  return (
    <div
      style={{
        fontFamily: "'Zen Kaku Gothic New', sans-serif",
        color: T.text,
        minHeight: '100vh',
        background: T.bg,
      }}
    >
      <style>{CSS}</style>

      {/* ── Desktop Sidebar ── */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div
          style={{
            padding: '24px 20px 20px',
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: T.text,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <I name='scale' size={18} color='#fff' />
            </div>
            <div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                }}
              >
                司法の道
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  color: T.sub,
                  letterSpacing: '0.06em',
                }}
              >
                SHIHO NO MICHI
              </div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
          {navItems.map((n) => (
            <div
              key={n.id}
              className={`sidebar-item ${tab === n.id ? 'active' : ''}`}
              onClick={() => {
                setTab(n.id);
                setSidebarOpen(false);
              }}
            >
              <I
                name={n.icon}
                size={18}
                color={tab === n.id ? T.text : T.sub}
              />
              <span>{n.label}</span>
            </div>
          ))}
        </nav>

        <div
          style={{ padding: '16px 20px', borderTop: `1px solid ${T.border}` }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '5px 10px',
                borderRadius: 16,
                background: streak >= 7 ? '#FFF3E0' : T.bg,
                border: `1px solid ${streak >= 7 ? '#FFB74D' : T.border}`,
              }}
            >
              <I
                name='fire'
                size={13}
                color={streak >= 7 ? '#FF8F00' : T.sub}
              />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: streak >= 7 ? '#E65100' : T.text,
                }}
              >
                {streak}
              </span>
              <span style={{ fontSize: 10, color: T.sub }}>日連続</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Mobile Header ── */}
      <header
        className='mobile-header'
        style={{
          display: 'none',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(246,245,241,0.88)',
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${T.border}`,
          padding: '12px 16px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ cursor: 'pointer', padding: 4 }}
          >
            <I name='menu' size={22} color={T.text} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <I name='scale' size={18} color={T.text} />
            <span
              style={{
                fontSize: 15,
                fontWeight: 900,
                letterSpacing: '-0.02em',
              }}
            >
              予備・司法試験勉強管理アプリ
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              padding: '4px 10px',
              borderRadius: 16,
              background: streak >= 7 ? '#FFF3E0' : T.bg,
              border: `1px solid ${streak >= 7 ? '#FFB74D' : T.border}`,
            }}
          >
            <I name='fire' size={12} color={streak >= 7 ? '#FF8F00' : T.sub} />
            <span style={{ fontSize: 12, fontWeight: 700 }}>{streak}</span>
          </div>
          <button
            className='btn-a'
            onClick={() => setShowLog(true)}
            style={{ padding: '7px 14px', fontSize: 12, borderRadius: 10 }}
          >
            <I name='plus' size={14} color='#fff' />
          </button>
        </div>
      </header>

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.25)',
            zIndex: 55,
          }}
        />
      )}

      {/* ── Main Content ── */}
      <div className='main-area'>
        {/* Desktop top bar */}
        <div className='mobile-header' style={{ display: 'none' }} />
        <div
          style={{ padding: '24px 32px 40px', maxWidth: 960, margin: '0 auto' }}
        >
          {/* Desktop header row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
            <div />
            <button
              className='btn-a'
              onClick={() => setShowLog(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 20px',
                borderRadius: 12,
              }}
            >
              <I name='plus' size={16} color='#fff' />
              <span>学習を記録</span>
            </button>
          </div>

          {tab === 'dashboard' && (
            <DashboardView
              {...{
                weeklyHours: weeklyH,
                exerciseRatio: exRatio,
                subjectBreakdown: subjectBk,
                weakPoints: weakPts,
                dailyMinutes: dailyMin,
                plan,
                todaySessions: todayS,
                weekDates,
                mistakeCauseCounts: mCauseCounts,
                sessions,
                yesterdayMemos: yMemos,
                showReview,
                setShowReview,
              }}
            />
          )}
          {tab === 'timer' && (
            <TimerView onSessionComplete={handleTimerComplete} />
          )}
          {tab === 'plan' && (
            <PlanView {...{ plan, dailyMinutes: dailyMin, weekDates }} />
          )}
          {tab === 'mistakes' && (
            <MistakesView
              {...{ mistakes, setMistakes, mistakeCauseCounts: mCauseCounts }}
            />
          )}
          {tab === 'templates' && <TemplatesView templates={templates} />}
          {tab === 'anki' && <AnkiView sessions={sessions} />}
        </div>
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <nav className='bottom-nav'>
        {navItems.map((n) => (
          <div
            key={n.id}
            className={`bottom-nav-item ${tab === n.id ? 'active' : ''}`}
            onClick={() => {
              setTab(n.id);
              setSidebarOpen(false);
            }}
          >
            <I
              name={n.icon}
              size={20}
              color={tab === n.id ? T.text : T.muted}
            />
            <span
              style={{
                color: tab === n.id ? T.text : T.muted,
                fontWeight: tab === n.id ? 700 : 500,
              }}
            >
              {n.label}
            </span>
          </div>
        ))}
      </nav>

      {/* ── Log Modal ── */}
      {showLog && (
        <div className='overlay' onClick={() => setShowLog(false)}>
          <div className='modal' onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 700 }}>学習を記録</div>
              <div
                onClick={() => setShowLog(false)}
                style={{ cursor: 'pointer', padding: 4 }}
              >
                <I name='x' size={20} color={T.sub} />
              </div>
            </div>

            {[
              { label: '科目', items: SUBJECTS, key: 'subject' },
              { label: '教材', items: MATERIALS, key: 'material' },
              { label: '学習形態', items: STUDY_TYPES, key: 'type' },
            ].map((sec) => (
              <div key={sec.key} style={{ marginBottom: 16 }}>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: T.sub,
                    marginBottom: 8,
                    display: 'block',
                  }}
                >
                  {sec.label}
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {sec.items.map((it) => (
                    <Chip
                      key={it}
                      label={it}
                      active={lf[sec.key] === it}
                      onClick={() => setLf((f) => ({ ...f, [sec.key]: it }))}
                      small
                    />
                  ))}
                </div>
              </div>
            ))}

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: T.sub,
                  marginBottom: 8,
                  display: 'block',
                }}
              >
                時間（分）
              </label>
              <div style={{ display: 'flex', gap: 6 }}>
                {[30, 45, 60, 90, 120].map((m) => (
                  <Chip
                    key={m}
                    label={`${m}分`}
                    active={lf.minutes === m}
                    onClick={() => setLf((f) => ({ ...f, minutes: m }))}
                    small
                  />
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: T.sub,
                  marginBottom: 8,
                  display: 'block',
                }}
              >
                手応え
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[1, 2, 3, 4, 5].map((v) => (
                  <div
                    key={v}
                    onClick={() => setLf((f) => ({ ...f, confidence: v }))}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background:
                        lf.confidence === v
                          ? v <= 2
                            ? T.danger
                            : v <= 3
                            ? T.warn
                            : T.success
                          : T.bg,
                      color: lf.confidence === v ? '#fff' : T.text,
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: 'pointer',
                      border: `1.5px solid ${
                        lf.confidence === v ? 'transparent' : T.border
                      }`,
                      transition: 'all 0.15s',
                    }}
                  >
                    {v}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: T.sub,
                  marginBottom: 8,
                  display: 'block',
                }}
              >
                詰まりメモ
              </label>
              <input
                className='input'
                placeholder='何に詰まった？（1行でOK）'
                value={lf.memo}
                onChange={(e) => setLf((f) => ({ ...f, memo: e.target.value }))}
              />
            </div>

            <div style={{ marginBottom: 24, display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: T.sub,
                    marginBottom: 8,
                    display: 'block',
                  }}
                >
                  Ankiカード追加
                </label>
                <input
                  className='input'
                  type='number'
                  min={0}
                  value={lf.ankiCards}
                  onChange={(e) =>
                    setLf((f) => ({
                      ...f,
                      ankiCards: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: T.sub,
                    marginBottom: 8,
                    display: 'block',
                  }}
                >
                  Anki復習
                </label>
                <div
                  onClick={() =>
                    setLf((f) => ({ ...f, ankiReviewed: !f.ankiReviewed }))
                  }
                  style={{
                    height: 44,
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    cursor: 'pointer',
                    background: lf.ankiReviewed ? T.success : T.bg,
                    color: lf.ankiReviewed ? '#fff' : T.sub,
                    border: `1.5px solid ${
                      lf.ankiReviewed ? T.success : T.border
                    }`,
                    fontWeight: 600,
                    fontSize: 13,
                    transition: 'all 0.15s',
                  }}
                >
                  {lf.ankiReviewed && <I name='check' size={14} color='#fff' />}
                  {lf.ankiReviewed ? '済み' : 'タップで記録'}
                </div>
              </div>
            </div>

            <button
              className='btn-p'
              onClick={handleLogSubmit}
              style={{
                width: '100%',
                padding: 14,
                fontSize: 15,
                borderRadius: 14,
              }}
            >
              記録する
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
