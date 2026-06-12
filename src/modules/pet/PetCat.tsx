import { useState, useRef, useEffect, useCallback } from 'react';
import { useSettingsStore } from '../../store/settingsStore';
import styles from './PetCat.module.css';

type CatState = 'idle' | 'running' | 'sleeping';

const MESSAGES = [
  'MEOW~', 'PURR...', 'NYA!', 'FEED ME', 'PET ME', '^_^', '*purring*', 'MRRROW!',
];

const CAT_SIZE = 80;
const MARGIN = 10;
const STATUSBAR_H = 22;
const TABBAR_H = 36;

function PetCat() {
  const setPetMode = useSettingsStore((state) => state.setPetMode);
  const theme = useSettingsStore((state) => state.theme);
  const isTyping = useSettingsStore((state) => state.isTyping);
  const [pos, setPos] = useState({ x: window.innerWidth / 2 - 40, y: window.innerHeight / 2 - 40 });
  const [catState, setCatState] = useState<CatState>('idle');
  const [isHidden, setIsHidden] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [bubble, setBubble] = useState<{ text: string; id: number } | null>(null);
  const [facingLeft, setFacingLeft] = useState(false);

  const isDragging = useRef(false);
  const dragStart = useRef({ mx: 0, my: 0, cx: 0, cy: 0 });
  const msgTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const walkTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const jumpTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bubbleId = useRef(0);

  const showMsg = useCallback((text: string) => {
    setBubble({ text, id: ++bubbleId.current });
    if (msgTimeout.current) clearTimeout(msgTimeout.current);
    msgTimeout.current = setTimeout(() => setBubble(null), 2200);
  }, []);

  const walkTo = useCallback((targetX: number, targetY: number, fromX: number, fromY: number) => {
    const dist = Math.hypot(targetX - fromX, targetY - fromY);
    if (dist < 5) { setCatState('idle'); return; }

    setFacingLeft(targetX < fromX);
    setCatState('running');

    const duration = 400 + dist * 1.5;
    const startTime = Date.now();

    const step = () => {
      const t = Math.min((Date.now() - startTime) / duration, 1);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      setPos({
        x: fromX + (targetX - fromX) * ease,
        y: fromY + (targetY - fromY) * ease,
      });
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setPos({ x: targetX, y: targetY });
        setCatState('idle');
      }
    };
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);
  }, []);

  const scheduleWalk = useCallback(() => {
    if (walkTimeout.current) clearTimeout(walkTimeout.current);
    
    const delay = isTyping 
      ? 10000 + Math.random() * 8000  // 10-18s when typing
      : 6000 + Math.random() * 8000;   // 6-14s normally
    
    walkTimeout.current = setTimeout(() => {
      if (isDragging.current) { scheduleWalk(); return; }
      
      let tx: number, ty: number;
      
      if (isTyping) {
        // When typing: horizontal movement only, above statusbar + tabbar
        const bottomY = window.innerHeight - STATUSBAR_H - TABBAR_H - CAT_SIZE;
        tx = MARGIN + Math.random() * (window.innerWidth - CAT_SIZE - MARGIN * 2);
        ty = bottomY;
      } else {
        // Normal: anywhere on screen
        tx = MARGIN + Math.random() * (window.innerWidth - CAT_SIZE - MARGIN * 2);
        ty = MARGIN + Math.random() * (window.innerHeight - CAT_SIZE - MARGIN * 2);
      }
      
      setPos(cur => { walkTo(tx, ty, cur.x, cur.y); return cur; });
      scheduleWalk();
    }, delay);
  }, [walkTo, isTyping]);

  useEffect(() => {
    scheduleWalk();
    return () => {
      if (walkTimeout.current) clearTimeout(walkTimeout.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (msgTimeout.current) clearTimeout(msgTimeout.current);
      if (jumpTimeout.current) clearTimeout(jumpTimeout.current);
    };
  }, [scheduleWalk]);

  useEffect(() => {
    if (isTyping) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (walkTimeout.current) clearTimeout(walkTimeout.current);
      const bottomY = window.innerHeight - STATUSBAR_H - TABBAR_H - CAT_SIZE;
      setPos(cur => {
        walkTo(cur.x, bottomY, cur.x, cur.y);
        return cur;
      });
      scheduleWalk();
    }
  }, [isTyping, walkTo, scheduleWalk]);

  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(`.${styles.exitBtn}`)) return;
    e.preventDefault();
    isDragging.current = true;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (walkTimeout.current) clearTimeout(walkTimeout.current);
    setCatState('idle');
    dragStart.current = { mx: e.clientX, my: e.clientY, cx: pos.x, cy: pos.y };
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const nx = dragStart.current.cx + e.clientX - dragStart.current.mx;
      const ny = dragStart.current.cy + e.clientY - dragStart.current.my;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - CAT_SIZE, nx)),
        y: Math.max(0, Math.min(window.innerHeight - CAT_SIZE, ny)),
      });
    };
    const onUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      scheduleWalk();
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [scheduleWalk]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (e.detail !== 1) return; // Ignore second click of double-click
    if (isDragging.current) return;
    showMsg(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
    setIsJumping(false);
    if (jumpTimeout.current) clearTimeout(jumpTimeout.current);
    requestAnimationFrame(() => {
      setIsJumping(true);
      jumpTimeout.current = setTimeout(() => setIsJumping(false), 450);
    });
  }, [showMsg]);

  const handleDblClick = useCallback(() => {
    if (walkTimeout.current) clearTimeout(walkTimeout.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setCatState('sleeping');
    showMsg('ZZZ...');
    setIsHidden(true);
    setTimeout(() => setPetMode(false), 2000);
  }, [showMsg, setPetMode]);

  const THEME_COLORS: Record<string, { color: string; colorDim: string; eyeBg: string }> = {
    green: { color: '#00ff41', colorDim: '#00cc33', eyeBg: '#0a0a0a' },
    amber: { color: '#ffb000', colorDim: '#cc8c00', eyeBg: '#0d0800' },
    white: { color: '#e0e0e0', colorDim: '#aaaaaa', eyeBg: '#000000' },
    light: { color: '#1a1a1a', colorDim: '#444444', eyeBg: '#f5f5f5' },
  };
  const { color, colorDim, eyeBg } = THEME_COLORS[theme] ?? THEME_COLORS.green;

  const bodyClass = catState === 'running' ? 'pet-body-run' : catState === 'sleeping' ? 'pet-body-sleep' : '';

  const catClassName = [
    styles.cat,
    catState === 'running' ? styles.running : '',
    catState === 'sleeping' ? styles.sleeping : '',
    isJumping ? styles.jumping : '',
    isHidden ? styles.hidden : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.overlay}>
      <div
        className={catClassName}
        style={{ left: pos.x, top: pos.y }}
        onMouseDown={onMouseDown}
        onClick={handleClick}
        onDoubleClick={handleDblClick}

      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="80" height="80"
          viewBox="0 0 32 32"
          style={{ display: 'block', transform: facingLeft ? 'scaleX(-1)' : 'scaleX(1)' }}
        >
          <g className="pet-ear-left">
            <rect x="5" y="5" width="2" height="1" fill={color}/>
            <rect x="5" y="6" width="3" height="1" fill={color}/>
            <rect x="6" y="7" width="2" height="1" fill={color}/>
          </g>
          <g className="pet-ear-right">
            <rect x="25" y="5" width="2" height="1" fill={color}/>
            <rect x="24" y="6" width="3" height="1" fill={color}/>
            <rect x="24" y="7" width="2" height="1" fill={color}/>
          </g>

          <rect x="8"  y="7"  width="16" height="1" fill={color}/>
          <rect x="7"  y="8"  width="1"  height="8" fill={color}/>
          <rect x="25" y="8"  width="1"  height="8" fill={color}/>
          <rect x="8"  y="16" width="16" height="1" fill={color}/>

          {catState === 'sleeping' ? (
            <>
              <rect x="10" y="11" width="3" height="1" fill={color}/>
              <rect x="19" y="11" width="3" height="1" fill={color}/>
            </>
          ) : (
            <>
              <rect x="10" y="10" width="3" height="2" fill={color}/>
              <rect x="19" y="10" width="3" height="2" fill={color}/>
              <g className="pet-eyes">
                <rect x="11" y="10" width="1" height="2" fill={eyeBg}/>
                <rect x="20" y="10" width="1" height="2" fill={eyeBg}/>
              </g>
            </>
          )}

          <rect x="15" y="13" width="2" height="1" fill={color}/>
          <rect x="13" y="14" width="2" height="1" fill={color}/>
          <rect x="17" y="14" width="2" height="1" fill={color}/>

          <g className="pet-whiskers">
            <rect x="4"  y="12" width="5" height="1" fill={colorDim}/>
            <rect x="4"  y="14" width="5" height="1" fill={colorDim}/>
            <rect x="23" y="12" width="5" height="1" fill={colorDim}/>
            <rect x="23" y="14" width="5" height="1" fill={colorDim}/>
          </g>

          <g className={bodyClass}>
            <rect x="9"  y="17" width="14" height="1" fill={color}/>
            <rect x="8"  y="18" width="1"  height="7" fill={color}/>
            <rect x="24" y="18" width="1"  height="7" fill={color}/>
            <rect x="9"  y="25" width="14" height="1" fill={color}/>
            <rect x="8"  y="26" width="4"  height="2" fill={color}/>
            <rect x="20" y="26" width="4"  height="2" fill={color}/>
          </g>

          <g className="pet-tail">
            <rect x="25" y="22" width="3" height="1" fill={color}/>
            <rect x="27" y="21" width="1" height="1" fill={color}/>
            <rect x="27" y="23" width="1" height="2" fill={color}/>
          </g>
        </svg>

        <button
          className={styles.exitBtn}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); setPetMode(false); }}
          title="Exit pet mode"
        >
          X
        </button>

        {bubble && <div key={bubble.id} className={styles.bubble}>{bubble.text}</div>}
      </div>
    </div>
  );
}

export default PetCat;
