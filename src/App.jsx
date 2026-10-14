import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sun,
  CloudSun,
  Moon,
  Tv,
  Pause,
  Play,
  Volume2,
  VolumeX,
  RotateCcw,
  Palette,
  Gamepad2
} from 'lucide-react';

// ==========================================
// 1. 2D PIXEL SPRITE MATRICES (17x12 Grid)
// ==========================================
const BIRD_SPRITE_FRAMES = [
  // Frame 0: Wing Middle (Gliding)
  [
    "......KKKKKK.....",
    "....KKLLLLBBKK...",
    "...KLLBBBBWWBBK..",
    "..KLBBBBBBWWWWBK.",
    ".KBBBBBBBBWWWKWBK",
    ".KPKKKKBBBBWWWWBK",
    "KPKWWWWKBBBBKKKK.",
    "KPKWWWWKBBBBOOOOK",
    ".KPKKKKBBBBOOOOOK",
    "..KSSSSSSBBBRRRK.",
    "...KKSSSSSSKKKK..",
    ".....KKKKKK......"
  ],
  // Frame 1: Wing Up (High Stroke)
  [
    "....KKKKKKK......",
    "...KWWWWWWWKK....",
    "..KWWWWWWWWBBK...",
    "..KWWWWWWWKLBBK..",
    ".KBBBBKWWKWWWKWBK",
    ".KBBBBKKKKWWWWWBK",
    "KBBBBBBBBBBBKKKK.",
    "KBBBBBBBBBBBOOOOK",
    ".KSSSSSSSSBBOOOOK",
    "..KSSSSSSBBBRRRK.",
    "...KKSSSSSSKKKK..",
    ".....KKKKKK......"
  ],
  // Frame 2: Wing Down (Power Flap)
  [
    "......KKKKKK.....",
    "....KKLLLLBBKK...",
    "...KLLBBBBWWBBK..",
    "..KLBBBBBBWWWWBK.",
    ".KBBBBBBBBWWWKWBK",
    "KBBBBBBBBBBBWWWWK",
    "KBBBKKKKKKBBBBKK.",
    "KBBKWWWWWWKBOOOOK",
    ".KBKWWWWWWKOOOOOK",
    "..KKWWWWWWKBRRRK.",
    "...KKKKKKKKKKKK..",
    ".....KKKKKK......"
  ]
];

// 16x16 Pixel Art Medal Matrix for Scoreboard
const MEDAL_MATRIX = [
  "....KKKKKKKK....",
  "..KKRRRRRRRRKK..",
  "..KRRRRWWWRRRK..",
  "...KKRRRRRRKK...",
  "....KKKKKKKK....",
  "..KKLLLLLLLLKK..",
  ".KLLBBBBBBBBLLK.",
  ".KLBBWWWWWWBBLK.",
  "KLBBWWBBBBWWBBLK",
  "KLBBWBBBBBBWBBLK",
  "KLBBWWBBBBWWBBLK",
  ".KLBBWWWWWWBBLK.",
  ".KLLBBBBBBBBLLK.",
  "..KKSSSSSSSSKK..",
  "....KKKKKKKK....",
  "................"
];

// Retro Bird Color Palettes
const BIRD_PALETTES = {
  yellow: {
    name: 'GOLD',
    labelColor: 'text-amber-200',
    K: '#181425',
    B: '#facc15',
    L: '#fef08a',
    S: '#d97706',
    P: '#fde047',
    W: '#ffffff',
    O: '#f97316',
    R: '#dc2626'
  },
  red: {
    name: 'CRIMSON',
    labelColor: 'text-rose-300',
    K: '#181425',
    B: '#ef4444',
    L: '#fca5a5',
    S: '#991b1b',
    P: '#fecaca',
    W: '#ffffff',
    O: '#fbbf24',
    R: '#d97706'
  },
  blue: {
    name: 'CYBER',
    labelColor: 'text-cyan-300',
    K: '#181425',
    B: '#38bdf8',
    L: '#bae6fd',
    S: '#0284c7',
    P: '#e0f2fe',
    W: '#ffffff',
    O: '#fb923c',
    R: '#ea580c'
  },
  green: {
    name: 'GAMEBOY',
    labelColor: 'text-lime-300',
    K: '#0f380f',
    B: '#8bac0f',
    L: '#9bbc0f',
    S: '#306230',
    P: '#9bbc0f',
    W: '#e0f8cf',
    O: '#306230',
    R: '#0f380f'
  }
};

const MEDAL_PALETTES = {
  bronze:   { K: '#181425', R: '#ef4444', W: '#fde68a', L: '#fdba74', B: '#d97706', S: '#92400e' },
  silver:   { K: '#181425', R: '#3b82f6', W: '#ffffff', L: '#f1f5f9', B: '#94a3b8', S: '#475569' },
  gold:     { K: '#181425', R: '#ef4444', W: '#ffffff', L: '#fef08a', B: '#eab308', S: '#a16207' },
  platinum: { K: '#181425', R: '#a855f7', W: '#ffffff', L: '#cffafe', B: '#38bdf8', S: '#0369a1' }
};

// 3 Time-of-Day Retro Palettes
const SCENERY_THEMES = [
  {
    name: 'DAY',
    skyTop: '#38bdf8',
    skyMid: '#7dd3fc',
    skyBot: '#bae6fd',
    cloudMain: '#ffffff',
    cloudShade: '#e0f2fe',
    cityFar: '#60a5fa',
    cityNear: '#3b82f6',
    windowLit: '#bae6fd',
    bushLight: '#4ade80',
    bushDark: '#16a34a',
    groundDirt: '#ded895',
    groundDots: '#c4be76',
    grassLight: '#73bf2e',
    grassStripe: '#55961f'
  },
  {
    name: 'SUNSET',
    skyTop: '#4c1d95',
    skyMid: '#be185d',
    skyBot: '#f97316',
    cloudMain: '#fed7aa',
    cloudShade: '#f472b6',
    cityFar: '#311042',
    cityNear: '#1f092b',
    windowLit: '#fde047',
    bushLight: '#15803d',
    bushDark: '#14532d',
    groundDirt: '#b48a64',
    groundDots: '#8c6645',
    grassLight: '#4d7c0f',
    grassStripe: '#365314'
  },
  {
    name: 'NIGHT',
    skyTop: '#090714',
    skyMid: '#18142c',
    skyBot: '#261f47',
    cloudMain: '#475569',
    cloudShade: '#334155',
    cityFar: '#1e1b4b',
    cityNear: '#0f172a',
    windowLit: '#facc15',
    bushLight: '#065f46',
    bushDark: '#064e3b',
    groundDirt: '#78553a',
    groundDots: '#5c3e26',
    grassLight: '#15803d',
    grassStripe: '#14532d'
  }
];

// Physics & Game Constants (Normalized to 60fps)
const STORAGE_KEY = 'flappy_arcade_high_score_v1';
const GROUND_HEIGHT = 92;
const GRAVITY = 0.44;
const JUMP_VELOCITY = -8.2;
const TERMINAL_VELOCITY = 11.5;
const BASE_SCROLL_SPEED = 3.1;
const PIPE_WIDTH = 64;
const PIPE_GAP = 142;
const PIPE_SPAWN_DISTANCE = 225;

// ==========================================
// 2. 8-BIT CHIPTUNE SOUND ENGINE (Web Audio)
// ==========================================
class ChiptuneAudio {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) this.ctx = new AudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.muted = muted;
  }

  playFlap() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.setValueAtTime(340, now + 0.025);
      osc.frequency.setValueAtTime(520, now + 0.055);

      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {}
  }

  playScore() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(987.77, now);        // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.075); // E6

      gain.gain.setValueAtTime(0.13, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.28);
    } catch (e) {}
  }

  playCrash() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(210, now);
      osc.frequency.setValueAtTime(140, now + 0.06);
      osc.frequency.setValueAtTime(95, now + 0.12);
      osc.frequency.setValueAtTime(55, now + 0.18);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.28);
    } catch (e) {}
  }

  playSelect() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(660, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {}
  }
}

// ==========================================
// 3. REUSABLE PIXEL ART CANVAS COMPONENTS
// ==========================================
function BirdSpritePreview({ skinKey, frameIdx = 0, className = "w-8 h-6" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, 17, 12);

    const pal = BIRD_PALETTES[skinKey];
    const matrix = BIRD_SPRITE_FRAMES[frameIdx];
    if (!pal || !matrix) return;

    for (let r = 0; r < matrix.length; r++) {
      const row = matrix[r];
      for (let c = 0; c < row.length; c++) {
        const ch = row[c];
        if (ch !== '.' && pal[ch]) {
          ctx.fillStyle = pal[ch];
          ctx.fillRect(c, r, 1, 1);
        }
      }
    }
  }, [skinKey, frameIdx]);

  return (
    <canvas
      ref={canvasRef}
      width={17}
      height={12}
      className={className}
      style={{ imageRendering: 'pixelated' }}
    />
  );
}

function PixelMedalCanvas({ type }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !type) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, 16, 16);

    const pal = MEDAL_PALETTES[type];
    if (!pal) return;

    for (let r = 0; r < 16; r++) {
      for (let c = 0; c < 16; c++) {
        const ch = MEDAL_MATRIX[r][c];
        if (ch !== '.' && pal[ch]) {
          ctx.fillStyle = pal[ch];
          ctx.fillRect(c, r, 1, 1);
        }
      }
    }
  }, [type]);

  if (!type) return null;

  return (
    <canvas
      ref={canvasRef}
      width={16}
      height={16}
      className="w-12 h-12"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}

// ==========================================
// 4. MAIN REACT APPLICATION
// ==========================================
export default function App() {
  // React UI States
  const [gameState, setGameState] = useState('START'); // 'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER'
  const [score, setScore] = useState(0);
  const [animatedFinalScore, setAnimatedFinalScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved !== null ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [currentSkin, setCurrentSkin] = useState('yellow');
  const [themeIdx, setThemeIdx] = useState(0);
  const [crtEnabled, setCrtEnabled] = useState(true);
  const [muted, setMuted] = useState(false);
  const [damageFlash, setDamageFlash] = useState(false);

  // Refs for High-Frequency 60/120/144Hz Game Loop
  const canvasRef = useRef(null);
  const sfxRef = useRef(null);
  const spriteCacheRef = useRef({});
  const stateRef = useRef({
    gameState: 'START',
    score: 0,
    highScore: highScore,
    currentSkin: 'yellow',
    themeIdx: 0,
    viewWidth: 400,
    viewHeight: 600,
    lastFrameTime: performance.now(),
    lastInputTimestamp: 0,
    groundScrollX: 0,
    cityScrollX: 0,
    bushScrollX: 0,
    shakeFrames: 0,
    pipes: [],
    particles: [],
    popups: [],
    clouds: [],
    stars: [],
    bird: {
      x: 105,
      y: 260,
      radius: 15,
      velocity: 0,
      rotation: 0,
      animTimer: 0,
      frameIndex: 0,
      scale: 2.75
    }
  });

  // Initialize Audio Engine & Pre-rendered Offscreen Sprite Cache
  useEffect(() => {
    sfxRef.current = new ChiptuneAudio();

    const cache = {};
    Object.keys(BIRD_PALETTES).forEach((skinKey) => {
      const pal = BIRD_PALETTES[skinKey];
      cache[skinKey] = BIRD_SPRITE_FRAMES.map((matrix) => {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = 17;
        offCanvas.height = 12;
        const oCtx = offCanvas.getContext('2d');

        for (let r = 0; r < matrix.length; r++) {
          const row = matrix[r];
          for (let c = 0; c < row.length; c++) {
            const ch = row[c];
            if (ch !== '.' && pal[ch]) {
              oCtx.fillStyle = pal[ch];
              oCtx.fillRect(c, r, 1, 1);
            }
          }
        }
        return offCanvas;
      });
    });
    spriteCacheRef.current = cache;
  }, []);

  // Sync React State selections to mutable engine ref
  useEffect(() => {
    stateRef.current.currentSkin = currentSkin;
  }, [currentSkin]);

  useEffect(() => {
    stateRef.current.themeIdx = themeIdx;
  }, [themeIdx]);

  // Scoreboard Animated Count-Up Effect on Game Over
  useEffect(() => {
    if (gameState !== 'GAMEOVER') return;
    const target = stateRef.current.score;
    if (target === 0) {
      setAnimatedFinalScore(0);
      return;
    }
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 20));
    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      setAnimatedFinalScore(current);
    }, 30);

    return () => clearInterval(interval);
  }, [gameState]);

  // Helper Functions for Bird, Particles & Scenery
  const resetBird = useCallback(() => {
    const s = stateRef.current;
    s.bird.x = Math.min(115, s.viewWidth * 0.28);
    s.bird.y = (s.viewHeight - GROUND_HEIGHT) * 0.44;
    s.bird.velocity = 0;
    s.bird.rotation = 0;
    s.bird.animTimer = 0;
    s.bird.frameIndex = 0;
  }, []);

  const spawnPixelFeathers = useCallback((x, y, isCrash = false) => {
    const s = stateRef.current;
    const count = isCrash ? 18 : 5;
    const pal = BIRD_PALETTES[s.currentSkin];
    const colors = [pal.B, pal.L, pal.W, pal.O];

    for (let i = 0; i < count; i++) {
      s.particles.push({
        x,
        y,
        vx: isCrash ? (Math.random() - 0.5) * 7 : -1.5 - Math.random() * 2.2,
        vy: isCrash ? -2 - Math.random() * 5 : (Math.random() - 0.5) * 2.8,
        size: isCrash ? 5 + Math.floor(Math.random() * 4) : 4,
        color: colors[i % colors.length],
        life: 1.0
      });
    }
  }, []);

  const flapBird = useCallback(() => {
    const s = stateRef.current;
    s.bird.velocity = JUMP_VELOCITY;
    s.bird.frameIndex = 2; // Wing down stroke
    s.bird.animTimer = 0;
    spawnPixelFeathers(s.bird.x - 10, s.bird.y + 4, false);
    sfxRef.current?.playFlap();
  }, [spawnPixelFeathers]);

  const triggerGameOver = useCallback(() => {
    const s = stateRef.current;
    if (s.gameState === 'GAMEOVER') return;

    s.gameState = 'GAMEOVER';
    setGameState('GAMEOVER');
    s.shakeFrames = 14;
    spawnPixelFeathers(s.bird.x, s.bird.y, true);
    sfxRef.current?.playCrash();

    // Damage Flash
    setDamageFlash(true);
    setTimeout(() => setDamageFlash(false), 110);

    let newRec = false;
    if (s.score > s.highScore) {
      s.highScore = s.score;
      setHighScore(s.score);
      newRec = true;
      try {
        localStorage.setItem(STORAGE_KEY, String(s.score));
      } catch {}
    }
    setIsNewRecord(newRec && s.score > 0);
  }, [spawnPixelFeathers]);

  const startGame = useCallback(() => {
    const s = stateRef.current;
    s.score = 0;
    s.pipes = [];
    s.particles = [];
    s.popups = [];
    setScore(0);
    setIsNewRecord(false);

    resetBird();
    flapBird();

    s.gameState = 'PLAYING';
    setGameState('PLAYING');
    s.lastFrameTime = performance.now();
  }, [resetBird, flapBird]);

  const togglePause = useCallback(() => {
    const s = stateRef.current;
    if (s.gameState === 'PLAYING') {
      s.gameState = 'PAUSED';
      setGameState('PAUSED');
    } else if (s.gameState === 'PAUSED') {
      s.gameState = 'PLAYING';
      setGameState('PLAYING');
      s.lastFrameTime = performance.now();
    }
  }, []);

  const handlePrimaryAction = useCallback(() => {
    const now = performance.now();
    const s = stateRef.current;
    if (now - s.lastInputTimestamp < 70) return;
    s.lastInputTimestamp = now;

    if (s.gameState === 'START') {
      startGame();
    } else if (s.gameState === 'PLAYING') {
      flapBird();
    }
  }, [startGame, flapBird]);

  const handleMuteToggle = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      sfxRef.current?.setMuted(next);
      return next;
    });
  }, []);

  const handleThemeCycle = useCallback(() => {
    setThemeIdx((prev) => (prev + 1) % SCENERY_THEMES.length);
    sfxRef.current?.playSelect();
  }, []);

  const handleCrtToggle = useCallback(() => {
    setCrtEnabled((prev) => !prev);
    sfxRef.current?.playSelect();
  }, []);

  // Main Canvas Resize, Scenery Init & RequestAnimationFrame Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const initScenery = (width, height) => {
      const s = stateRef.current;
      s.clouds = [];
      for (let i = 0; i < 5; i++) {
        s.clouds.push({
          x: Math.floor(Math.random() * width),
          y: 42 + Math.floor(Math.random() * 130),
          w: 48 + Math.floor(Math.random() * 28),
          speed: 0.25 + Math.random() * 0.22
        });
      }

      s.stars = [];
      for (let i = 0; i < 36; i++) {
        s.stars.push({
          x: Math.floor(Math.random() * width),
          y: 16 + Math.floor(Math.random() * (height - GROUND_HEIGHT - 140)),
          size: Math.random() > 0.7 ? 4 : 2,
          phase: Math.random() * Math.PI * 2
        });
      }
    };

    const handleResize = () => {
      const container = canvas.parentElement;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      const s = stateRef.current;
      s.viewWidth = rect.width;
      s.viewHeight = rect.height;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;

      if (s.clouds.length === 0) {
        initScenery(rect.width, rect.height);
      }

      if (s.gameState === 'START') {
        resetBird();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Circle-Rect Collision Helper
    const circleRectCollide = (cx, cy, cr, rx, ry, rw, rh) => {
      const closestX = Math.max(rx, Math.min(cx, rx + rw));
      const closestY = Math.max(ry, Math.min(cy, ry + rh));
      const dx = cx - closestX;
      const dy = cy - closestY;
      return dx * dx + dy * dy < cr * cr;
    };

    let animationFrameId;

    const renderLoop = (now) => {
      const s = stateRef.current;
      const deltaMs = now - s.lastFrameTime;
      s.lastFrameTime = now;

      const clampedDelta = Math.min(deltaMs, 50);
      const dtScale = clampedDelta / 16.667;

      // 1. UPDATE PHYSICS & ENTITIES
      if (s.gameState !== 'PAUSED') {
        if (s.shakeFrames > 0) s.shakeFrames -= dtScale;

        // Clouds
        s.clouds.forEach((c) => {
          if (s.gameState === 'PLAYING' || s.gameState === 'START') {
            c.x -= c.speed * dtScale;
            if (c.x + c.w < -20) c.x = s.viewWidth + 30;
          }
        });

        // Feather Particles
        for (let i = s.particles.length - 1; i >= 0; i--) {
          const p = s.particles[i];
          p.x += p.vx * dtScale;
          p.y += p.vy * dtScale;
          p.vy += 0.14 * dtScale;
          p.life -= 0.032 * dtScale;
          if (p.life <= 0) s.particles.splice(i, 1);
        }

        // "+1" Score Popups
        for (let i = s.popups.length - 1; i >= 0; i--) {
          const pop = s.popups[i];
          pop.y -= 1.1 * dtScale;
          pop.life -= 0.028 * dtScale;
          if (pop.life <= 0) s.popups.splice(i, 1);
        }

        // Parallax Scrolling
        const speedMultiplier = 1 + Math.min(s.score * 0.008, 0.35);
        const currentScrollSpeed = BASE_SCROLL_SPEED * speedMultiplier;

        if (s.gameState === 'PLAYING' || s.gameState === 'START') {
          s.groundScrollX = (s.groundScrollX + currentScrollSpeed * dtScale) % 24;
          s.bushScrollX = (s.bushScrollX + currentScrollSpeed * 0.45 * dtScale) % 48;
          s.cityScrollX = (s.cityScrollX + currentScrollSpeed * 0.18 * dtScale) % 240;
        }

        // Bird Physics
        const b = s.bird;
        if (s.gameState === 'START') {
          const baseY = (s.viewHeight - GROUND_HEIGHT) * 0.44;
          b.y = baseY + Math.round(Math.sin(now * 0.0055) * 8);
          b.rotation = 0;
          b.animTimer += dtScale;
          if (b.animTimer > 7) {
            b.animTimer = 0;
            b.frameIndex = (b.frameIndex + 1) % 3;
          }
        } else {
          b.velocity += GRAVITY * dtScale;
          if (b.velocity > TERMINAL_VELOCITY) {
            b.velocity = TERMINAL_VELOCITY;
          }
          b.y += b.velocity * dtScale;

          if (b.velocity < 1.5) {
            b.animTimer += dtScale;
            if (b.animTimer > 4.5) {
              b.animTimer = 0;
              b.frameIndex = (b.frameIndex + 1) % 3;
            }
          } else {
            b.frameIndex = 0;
          }

          if (b.velocity < 0) {
            b.rotation = -0.38;
          } else {
            const targetRot = Math.min(
              Math.PI / 2,
              (b.velocity / TERMINAL_VELOCITY) * (Math.PI / 2)
            );
            b.rotation += (targetRot - b.rotation) * 0.16 * dtScale;
          }

          if (b.y - b.radius < 0) {
            b.y = b.radius;
            b.velocity = 0;
          }

          const floorY = s.viewHeight - GROUND_HEIGHT;
          if (b.y + b.radius >= floorY) {
            b.y = floorY - b.radius;
            if (s.gameState === 'PLAYING') {
              triggerGameOver();
            }
          }
        }

        // Pipes Spawning & Collision
        if (s.gameState === 'PLAYING') {
          if (
            s.pipes.length === 0 ||
            s.viewWidth - s.pipes[s.pipes.length - 1].x >= PIPE_SPAWN_DISTANCE
          ) {
            const playableHeight = s.viewHeight - GROUND_HEIGHT;
            const minTopPipe = 64;
            const maxTopPipe = Math.max(
              minTopPipe + 40,
              playableHeight - PIPE_GAP - 80
            );
            const topHeight =
              Math.floor(
                (minTopPipe + Math.random() * (maxTopPipe - minTopPipe)) / 4
              ) * 4;

            s.pipes.push({
              x: s.viewWidth + 20,
              topHeight,
              bottomY: topHeight + PIPE_GAP,
              passed: false
            });
          }

          const floorY = s.viewHeight - GROUND_HEIGHT;
          const hitboxRadius = b.radius - 3;

          for (let i = s.pipes.length - 1; i >= 0; i--) {
            const p = s.pipes[i];
            p.x -= currentScrollSpeed * dtScale;

            if (!p.passed && p.x + PIPE_WIDTH < b.x) {
              p.passed = true;
              s.score += 1;
              setScore(s.score);
              s.popups.push({
                x: b.x,
                y: b.y - 24,
                text: '+1',
                life: 1.0
              });
              sfxRef.current?.playScore();
            }

            const hitTop = circleRectCollide(
              b.x,
              b.y,
              hitboxRadius,
              p.x,
              0,
              PIPE_WIDTH,
              p.topHeight
            );
            const hitBottom = circleRectCollide(
              b.x,
              b.y,
              hitboxRadius,
              p.x,
              p.bottomY,
              PIPE_WIDTH,
              floorY - p.bottomY
            );

            if (hitTop || hitBottom) {
              triggerGameOver();
              break;
            }

            if (p.x + PIPE_WIDTH < -40) {
              s.pipes.splice(i, 1);
            }
          }
        }
      }

      // 2. DRAW 16-BIT PIXEL ART SCENE
      const { viewWidth, viewHeight, themeIdx: curThemeIdx } = s;
      const theme = SCENERY_THEMES[curThemeIdx];
      const floorY = viewHeight - GROUND_HEIGHT;

      ctx.save();
      if (s.shakeFrames > 0) {
        const dx = Math.round((Math.random() - 0.5) * 8);
        const dy = Math.round((Math.random() - 0.5) * 8);
        ctx.translate(dx, dy);
      }

      ctx.clearRect(0, 0, viewWidth, viewHeight);

      // Sky Color Bands
      ctx.fillStyle = theme.skyTop;
      ctx.fillRect(0, 0, viewWidth, Math.floor(floorY * 0.45));

      ctx.fillStyle = theme.skyMid;
      ctx.fillRect(
        0,
        Math.floor(floorY * 0.45),
        viewWidth,
        Math.floor(floorY * 0.32)
      );

      ctx.fillStyle = theme.skyBot;
      ctx.fillRect(
        0,
        Math.floor(floorY * 0.77),
        viewWidth,
        floorY - Math.floor(floorY * 0.77)
      );

      // Dithered Horizon Transitions
      ctx.fillStyle = theme.skyTop;
      for (let x = 0; x < viewWidth; x += 8) {
        ctx.fillRect(x, Math.floor(floorY * 0.45), 4, 4);
      }
      ctx.fillStyle = theme.skyMid;
      for (let x = 0; x < viewWidth; x += 8) {
        ctx.fillRect(x + 4, Math.floor(floorY * 0.77), 4, 4);
      }

      // Stars & Pixel Moon in Sunset / Night
      if (curThemeIdx > 0) {
        s.stars.forEach((st) => {
          const blink = Math.sin(now * 0.004 + st.phase) > 0;
          ctx.fillStyle = blink ? '#ffffff' : '#94a3b8';
          ctx.fillRect(st.x, st.y, st.size, st.size);
        });

        const moonX = viewWidth - 84;
        const moonY = curThemeIdx === 1 ? floorY - 145 : 64;
        ctx.fillStyle = curThemeIdx === 1 ? '#fde047' : '#fef9c3';
        ctx.fillRect(moonX + 8, moonY, 24, 40);
        ctx.fillRect(moonX, moonY + 8, 40, 24);
        ctx.fillRect(moonX + 4, moonY + 4, 32, 32);
      }

      // Pixel Block Clouds
      s.clouds.forEach((c) => {
        const cx = Math.floor(c.x);
        const cy = Math.floor(c.y);
        const cw = c.w;

        ctx.fillStyle = theme.cloudShade;
        ctx.fillRect(cx, cy + 12, cw, 8);

        ctx.fillStyle = theme.cloudMain;
        ctx.fillRect(cx + 4, cy + 4, cw - 8, 12);
        ctx.fillRect(cx + 12, cy - 4, cw - 24, 10);
        ctx.fillRect(cx, cy + 8, cw, 6);
      });

      // Pixel City Skyline
      const buildingPattern = [
        { w: 40, h: 84 },
        { w: 52, h: 116 },
        { w: 36, h: 68 },
        { w: 56, h: 96 },
        { w: 44, h: 76 },
        { w: 48, h: 108 }
      ];
      let bx = -Math.floor(s.cityScrollX);
      let bIdx = 0;
      while (bx < viewWidth + 60) {
        const bldg = buildingPattern[bIdx % buildingPattern.length];
        const by = floorY - bldg.h;

        ctx.fillStyle = bIdx % 2 === 0 ? theme.cityNear : theme.cityFar;
        ctx.fillRect(bx, by, bldg.w - 2, bldg.h);

        ctx.fillStyle = theme.windowLit;
        for (let wy = by + 10; wy < floorY - 28; wy += 14) {
          for (let wx = bx + 8; wx < bx + bldg.w - 12; wx += 10) {
            if ((wx + wy + bIdx) % 3 !== 0) {
              ctx.fillRect(wx, wy, 4, 6);
            }
          }
        }
        bx += bldg.w;
        bIdx++;
      }

      // Stepped Pixel Hedges
      for (let x = -48 - Math.floor(s.bushScrollX); x < viewWidth + 48; x += 48) {
        ctx.fillStyle = theme.bushDark;
        ctx.fillRect(x, floorY - 20, 44, 20);
        ctx.fillRect(x + 6, floorY - 28, 32, 8);
        ctx.fillRect(x + 14, floorY - 34, 16, 6);

        ctx.fillStyle = theme.bushLight;
        ctx.fillRect(x + 4, floorY - 18, 36, 14);
        ctx.fillRect(x + 10, floorY - 24, 24, 8);
      }

      // 16-Bit Specular Pipes
      const capHeight = 26;
      const capOverhang = 4;
      const drawPipeBox = (x, y, w, h) => {
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(x, y, w, h);

        ctx.fillStyle = '#86efac';
        ctx.fillRect(x + 6, y, 8, h);
        ctx.fillStyle = '#dcfce7';
        ctx.fillRect(x + 10, y, 3, h);

        ctx.fillStyle = '#16a34a';
        ctx.fillRect(x + w - 18, y, 8, h);
        ctx.fillStyle = '#15803d';
        ctx.fillRect(x + w - 10, y, 10, h);

        ctx.lineWidth = 3;
        ctx.strokeStyle = '#181425';
        ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
      };

      s.pipes.forEach((p) => {
        const px = Math.floor(p.x);
        drawPipeBox(px, -4, PIPE_WIDTH, p.topHeight - capHeight + 6);
        drawPipeBox(
          px - capOverhang,
          p.topHeight - capHeight,
          PIPE_WIDTH + capOverhang * 2,
          capHeight
        );

        const bottomHeight = floorY - p.bottomY;
        drawPipeBox(
          px,
          p.bottomY + capHeight - 2,
          PIPE_WIDTH,
          bottomHeight - capHeight + 6
        );
        drawPipeBox(
          px - capOverhang,
          p.bottomY,
          PIPE_WIDTH + capOverhang * 2,
          capHeight
        );
      });

      // Scrolling Pixel Ground
      const grassH = 22;
      ctx.fillStyle = theme.groundDirt;
      ctx.fillRect(0, floorY, viewWidth, GROUND_HEIGHT);

      ctx.fillStyle = theme.groundDots;
      for (let x = -24 - Math.floor(s.groundScrollX); x < viewWidth + 24; x += 24) {
        ctx.fillRect(x + 4, floorY + 32, 6, 6);
        ctx.fillRect(x + 16, floorY + 46, 4, 4);
        ctx.fillRect(x + 8, floorY + 64, 8, 4);
      }

      ctx.fillStyle = theme.grassLight;
      ctx.fillRect(0, floorY, viewWidth, grassH);

      ctx.fillStyle = theme.grassStripe;
      for (let x = -24 - Math.floor(s.groundScrollX); x < viewWidth + 24; x += 24) {
        ctx.fillRect(x + 8, floorY + 3, 10, 5);
        ctx.fillRect(x + 4, floorY + 8, 10, 6);
        ctx.fillRect(x, floorY + 14, 10, 5);
      }

      ctx.fillStyle = '#181425';
      ctx.fillRect(0, floorY, viewWidth, 4);
      ctx.fillRect(0, floorY + grassH - 3, viewWidth, 3);

      // Feather Particles & Floating "+1" Popups
      s.particles.forEach((p) => {
        ctx.fillStyle = '#181425';
        ctx.fillRect(
          Math.floor(p.x) - 1,
          Math.floor(p.y) - 1,
          p.size + 2,
          p.size + 2
        );
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
      });

      s.popups.forEach((pop) => {
        ctx.save();
        ctx.font = '14px "Press Start 2P", monospace';
        ctx.fillStyle = '#181425';
        ctx.fillText(pop.text, Math.floor(pop.x) + 2, Math.floor(pop.y) + 2);
        ctx.fillStyle = '#fde047';
        ctx.fillText(pop.text, Math.floor(pop.x), Math.floor(pop.y));
        ctx.restore();
      });

      // Draw 2D Pixel Bird Sprite
      const frames = spriteCacheRef.current[s.currentSkin];
      if (frames && frames[s.bird.frameIndex]) {
        const sprite = frames[s.bird.frameIndex];
        ctx.save();
        ctx.translate(Math.round(s.bird.x), Math.round(s.bird.y));
        const steppedRot = Math.round(s.bird.rotation / 0.12) * 0.12;
        ctx.rotate(steppedRot);
        ctx.imageSmoothingEnabled = false;
        const drawW = Math.round(17 * s.bird.scale);
        const drawH = Math.round(12 * s.bird.scale);
        ctx.drawImage(
          sprite,
          -Math.round(drawW / 2),
          -Math.round(drawH / 2),
          drawW,
          drawH
        );
        ctx.restore();
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    stateRef.current.lastFrameTime = performance.now();
    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [resetBird, triggerGameOver]);

  // Global Keyboard Shortcuts (Space, Up, W, P, M, C)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        if (e.repeat) return;

        const gs = stateRef.current.gameState;
        if (gs === 'GAMEOVER') startGame();
        else if (gs === 'PAUSED') togglePause();
        else handlePrimaryAction();
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        togglePause();
      } else if (e.code === 'KeyM') {
        handleMuteToggle();
      } else if (e.code === 'KeyC') {
        handleCrtToggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [startGame, togglePause, handlePrimaryAction, handleMuteToggle, handleCrtToggle]);

  // Determine Medal Tier
  const getMedalInfo = (pts) => {
    if (pts >= 40) return { type: 'platinum', label: 'PLATINUM!' };
    if (pts >= 25) return { type: 'gold', label: 'GOLD MEDAL!' };
    if (pts >= 15) return { type: 'silver', label: 'SILVER MEDAL' };
    if (pts >= 5) return { type: 'bronze', label: 'BRONZE MEDAL' };
    return { type: null, label: 'REACH 5 PTS' };
  };

  const medalInfo = getMedalInfo(score);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-between p-2 sm:p-3 text-white select-none overflow-hidden arcade-root">
      {/* Inject Google Fonts & Custom Retro Arcade CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');

        .arcade-root {
          font-family: 'Press Start 2P', monospace;
          background: radial-gradient(circle at center, #1a162b 0%, #090710 100%);
          image-rendering: pixelated;
          touch-action: manipulation;
        }
        .font-pixel {
          font-family: 'Press Start 2P', monospace;
        }
        .font-retro {
          font-family: 'VT323', monospace;
        }
        .pixel-box {
          border: 4px solid #1e1b2e;
          box-shadow: 
            inset -4px -4px 0px rgba(0,0,0,0.25),
            inset 4px 4px 0px rgba(255,255,255,0.25),
            0 6px 0 #090710;
        }
        .arcade-btn {
          position: relative;
          border: 4px solid #181425;
          transition: transform 0.06s steps(2);
          box-shadow: 
            inset -4px -4px 0px rgba(0,0,0,0.3),
            inset 4px 4px 0px rgba(255,255,255,0.35),
            0 6px 0 #181425,
            0 10px 15px rgba(0,0,0,0.5);
        }
        .arcade-btn:hover {
          filter: brightness(1.06);
        }
        .arcade-btn:active {
          transform: translateY(5px);
          box-shadow: 
            inset -3px -3px 0px rgba(0,0,0,0.3),
            inset 3px 3px 0px rgba(255,255,255,0.35),
            0 1px 0 #181425;
        }
        .control-pill {
          border: 3px solid #0f172a;
          transition: transform 0.05s steps(2);
          box-shadow: inset -2px -2px 0 rgba(0,0,0,0.35), inset 2px 2px 0 rgba(255,255,255,0.2), 0 4px 0 #0f172a;
        }
        .control-pill:active {
          transform: translateY(3px);
          box-shadow: 0 1px 0 #0f172a;
        }
        .skin-btn {
          border: 3px solid #332c47;
          transition: all 0.1s steps(2);
          box-shadow: 0 4px 0 #181425;
        }
        .skin-btn.active {
          border-color: #fde047;
          background-color: #3b3354;
          transform: translateY(-2px);
          box-shadow: 0 6px 0 #181425, 0 0 12px rgba(253, 224, 71, 0.45);
        }
        .pixel-text-stroke {
          text-shadow: 
            3px 3px 0 #181425,
            -3px -3px 0 #181425,
            3px -3px 0 #181425,
            -3px 3px 0 #181425,
            0 5px 0 #181425;
        }
        .pixel-text-sm {
          text-shadow: 2px 2px 0 #181425;
        }
        .crt-overlay {
          background: 
            linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.32) 50%), 
            radial-gradient(circle at center, transparent 62%, rgba(0, 0, 0, 0.55) 100%);
          background-size: 100% 4px, 100% 100%;
          pointer-events: none;
        }
        @keyframes pixelFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .animate-pixel-float {
          animation: pixelFloat 1.2s steps(4, end) infinite;
        }
      `}</style>

      {/* Top Arcade Header Bar */}
      <header className="w-full max-w-[440px] flex items-center justify-between px-3 py-2 bg-[#262038] border-4 border-[#0f0c1b] rounded-xl shadow-[0_6px_0_#0f0c1b] z-20 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-[#181425] border-2 border-[#473d66] flex items-center justify-center p-1 shadow-inner">
            <BirdSpritePreview skinKey={currentSkin} frameIdx={0} className="w-7 h-5" />
          </div>
          <div>
            <h1 className="font-pixel text-[11px] sm:text-xs tracking-tight text-amber-300 pixel-text-sm">
              FLAPPY 16-BIT
            </h1>
            <p className="font-retro text-lg text-emerald-300 leading-none mt-0.5 tracking-wide">
              HI-SCORE: <span className="text-white">{String(highScore).padStart(3, '0')}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Palette Time-of-Day Cycle (Day / Sunset / Night) */}
          <button
            onClick={handleThemeCycle}
            title="Cycle Time Palette (Day / Sunset / Night)"
            className="control-pill w-9 h-9 rounded-lg bg-[#383052] hover:bg-[#463c66] flex items-center justify-center"
          >
            {themeIdx === 0 && <Sun className="w-4 h-4 text-amber-300" />}
            {themeIdx === 1 && <CloudSun className="w-4 h-4 text-orange-400" />}
            {themeIdx === 2 && <Moon className="w-4 h-4 text-indigo-300" />}
          </button>

          {/* CRT Scanlines Toggle */}
          <button
            onClick={handleCrtToggle}
            title="Toggle CRT Scanlines (C)"
            className={`control-pill w-9 h-9 rounded-lg bg-[#383052] hover:bg-[#463c66] flex items-center justify-center ${
              crtEnabled ? 'text-cyan-300' : 'text-slate-500'
            }`}
          >
            <Tv className="w-4 h-4" />
          </button>

          {/* Pause Toggle */}
          <button
            onClick={togglePause}
            title="Pause Game (P)"
            className={`control-pill w-9 h-9 rounded-lg bg-[#383052] hover:bg-[#463c66] text-slate-200 flex items-center justify-center ${
              gameState === 'PLAYING' || gameState === 'PAUSED'
                ? ''
                : 'opacity-40 pointer-events-none'
            }`}
          >
            {gameState === 'PAUSED' ? (
              <Play className="w-4 h-4" />
            ) : (
              <Pause className="w-4 h-4" />
            )}
          </button>

          {/* 8-Bit Chiptune Audio Toggle */}
          <button
            onClick={handleMuteToggle}
            title="Toggle 8-Bit Audio (M)"
            className="control-pill w-9 h-9 rounded-lg bg-[#383052] hover:bg-[#463c66] flex items-center justify-center"
          >
            {muted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>
        </div>
      </header>

      {/* Main Arcade Monitor Bezel */}
      <main className="relative w-full max-w-[440px] flex-1 my-2 rounded-2xl overflow-hidden shadow-[0_14px_0_#0f0c1b,0_22px_40px_rgba(0,0,0,0.85)] border-[6px] border-[#262038] bg-[#181425] flex items-center justify-center">
        {/* Primary Game Canvas */}
        <canvas
          ref={canvasRef}
          onMouseDown={(e) => {
            e.preventDefault();
            handlePrimaryAction();
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            handlePrimaryAction();
          }}
          className="block w-full h-full cursor-pointer"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Toggleable CRT Scanline & Bezel Shadow Overlay */}
        {crtEnabled && <div className="crt-overlay absolute inset-0 z-10" />}

        {/* Damage Flash Overlay */}
        <div
          className={`absolute inset-0 bg-white pointer-events-none transition-opacity duration-100 z-10 ${
            damageFlash ? 'opacity-90' : 'opacity-0'
          }`}
        />

        {/* Live Score HUD */}
        {gameState === 'PLAYING' && (
          <div className="absolute top-5 inset-x-0 flex justify-center pointer-events-none z-10">
            <span className="font-pixel text-3xl sm:text-4xl text-white pixel-text-stroke tracking-widest select-none">
              {score}
            </span>
          </div>
        )}

        {/* Start / Title Screen Overlay */}
        {gameState === 'START' && (
          <div className="absolute inset-0 flex flex-col items-center justify-between p-5 bg-black/25 z-20 pointer-events-none">
            <div className="mt-3 text-center animate-pixel-float">
              <div className="inline-block px-3 py-1 bg-[#181425] border-2 border-amber-400 text-amber-300 text-[9px] tracking-widest mb-2 shadow-[0_3px_0_#000]">
                INSERT COIN • 1UP
              </div>
              <h2 className="font-pixel text-2xl sm:text-3xl text-amber-300 pixel-text-stroke leading-snug tracking-tight">
                GET READY!
              </h2>
            </div>

            {/* Bird Sprite Color Selector Panel */}
            <div className="my-auto w-full max-w-[300px] bg-[#181425]/90 border-4 border-[#090710] rounded-xl p-3.5 shadow-[0_6px_0_#090710] text-center pointer-events-auto">
              <p className="text-[9px] text-amber-300 tracking-wider mb-2.5 uppercase">
                SELECT 2D SPRITE PALETTE
              </p>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {Object.entries(BIRD_PALETTES).map(([skinKey, pal]) => (
                  <button
                    key={skinKey}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentSkin(skinKey);
                      sfxRef.current?.playSelect();
                    }}
                    className={`skin-btn rounded-lg p-1.5 flex flex-col items-center gap-1 bg-[#262038] ${
                      currentSkin === skinKey ? 'active' : ''
                    }`}
                  >
                    <BirdSpritePreview skinKey={skinKey} frameIdx={0} className="w-8 h-6" />
                    <span className={`font-retro text-xs leading-none ${pal.labelColor}`}>
                      {pal.name}
                    </span>
                  </button>
                ))}
              </div>
              <div className="font-retro text-base sm:text-lg text-slate-200 bg-[#0f0c1b] py-1 px-3 rounded border border-[#383052]">
                PRESS <span className="text-amber-300">SPACE</span> /{' '}
                <span className="text-amber-300">CLICK</span> /{' '}
                <span className="text-amber-300">TAP</span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                startGame();
              }}
              className="arcade-btn w-full max-w-[240px] py-3.5 bg-[#22c55e] text-white font-pixel text-xs sm:text-sm rounded-xl flex items-center justify-center gap-3 mb-1 pointer-events-auto"
            >
              <Play className="w-4 h-4 fill-current" /> START 1P
            </button>
          </div>
        )}

        {/* Pause Modal */}
        {gameState === 'PAUSED' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/70 z-20">
            <div className="pixel-box bg-[#262038] rounded-xl p-6 w-full max-w-[290px] text-center">
              <h3 className="font-pixel text-lg text-amber-300 pixel-text-sm mb-2">PAUSED</h3>
              <p className="font-retro text-xl text-slate-300 mb-5">GAME ON HOLD...</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePause();
                }}
                className="arcade-btn w-full py-3 bg-[#22c55e] text-white font-pixel text-xs rounded-lg flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" /> RESUME
              </button>
            </div>
          </div>
        )}

        {/* Retro Arcade Game Over Modal */}
        {gameState === 'GAMEOVER' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-black/65 z-20">
            <div className="w-full max-w-[330px] flex flex-col items-center">
              <h2 className="font-pixel text-2xl sm:text-3xl text-[#f97316] pixel-text-stroke mb-4 tracking-wide">
                GAME OVER
              </h2>

              {/* 16-Bit Scoreboard Card */}
              <div className="w-full bg-[#ded895] border-4 border-[#543847] rounded-xl p-4 shadow-[inset_-4px_-4px_0_#c4be76,inset_4px_4px_0_#f7f3c6,0_8px_0_#181425] text-[#543847] mb-5">
                <div className="grid grid-cols-2 gap-3 items-center">
                  {/* Pixel Medal Column */}
                  <div className="flex flex-col items-center justify-center border-r-4 border-[#cbb968] pr-2">
                    <span className="font-pixel text-[9px] uppercase tracking-wider text-[#a87e3b] mb-2">
                      MEDAL
                    </span>
                    <div className="w-16 h-16 rounded-lg bg-[#c2b267] border-4 border-[#8c7a38] flex items-center justify-center relative shadow-inner">
                      {medalInfo.type ? (
                        <PixelMedalCanvas type={medalInfo.type} />
                      ) : (
                        <span className="font-retro text-base font-bold text-[#78682c]">
                          NONE
                        </span>
                      )}
                    </div>
                    <span className="font-retro text-base font-bold mt-1 text-[#6e5c28]">
                      {medalInfo.label}
                    </span>
                  </div>

                  {/* Animated Scores Column */}
                  <div className="flex flex-col items-end justify-center pl-2">
                    <span className="font-pixel text-[9px] text-[#a87e3b] mb-1">SCORE</span>
                    <span className="font-pixel text-xl sm:text-2xl text-[#543847] mb-3">
                      {animatedFinalScore}
                    </span>

                    <div className="flex items-center gap-1.5 mb-1">
                      {isNewRecord && (
                        <span className="px-1.5 py-0.5 bg-[#ef4444] text-white font-pixel text-[7px] border border-[#181425]">
                          NEW
                        </span>
                      )}
                      <span className="font-pixel text-[9px] text-[#a87e3b]">BEST</span>
                    </div>
                    <span className="font-pixel text-xl sm:text-2xl text-[#543847]">
                      {highScore}
                    </span>
                  </div>
                </div>
              </div>

              {/* Play Again & Palette Swap */}
              <div className="flex gap-2.5 w-full">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startGame();
                  }}
                  className="arcade-btn flex-1 py-3.5 bg-[#f59e0b] text-[#181425] font-pixel text-xs rounded-xl flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4 stroke-[2.5]" /> PLAY AGAIN
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    sfxRef.current?.playSelect();
                    stateRef.current.gameState = 'START';
                    stateRef.current.pipes = [];
                    resetBird();
                    setGameState('START');
                  }}
                  title="Change Bird Sprite"
                  className="arcade-btn px-4 py-3.5 bg-[#38bdf8] text-[#181425] font-pixel text-xs rounded-xl flex items-center justify-center"
                >
                  <Palette className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Arcade Deck Control Button */}
      <footer className="w-full max-w-[440px] flex items-center justify-between gap-2 px-3 py-2 bg-[#262038] border-4 border-[#0f0c1b] rounded-xl shadow-[0_6px_0_#0f0c1b] z-20 shrink-0">
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            if (stateRef.current.gameState === 'GAMEOVER') startGame();
            else handlePrimaryAction();
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            if (stateRef.current.gameState === 'GAMEOVER') startGame();
            else handlePrimaryAction();
          }}
          className="arcade-btn w-full py-2.5 bg-[#fbbf24] text-[#181425] font-pixel text-xs sm:text-sm rounded-lg flex items-center justify-center gap-2"
        >
          <Gamepad2 className="w-5 h-5 stroke-[2.5]" /> FLAP WINGS{' '}
          <span className="font-retro text-lg opacity-80 hidden sm:inline">
            [SPACE / CLICK]
          </span>
        </button>
      </footer>
    </div>
  );
}