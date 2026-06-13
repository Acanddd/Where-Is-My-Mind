import { useState, useRef, useEffect, useCallback } from "react";
import { useSettingsStore } from "../../store/settingsStore";
import styles from "./PetCat.module.css";

type PetState = "idle" | "running" | "sleeping";

const CAT_MESSAGES     = ["MEOW~", "PURR...", "NYA!", "FEED ME", "PET ME", "^_^", "*purring*", "MRRROW!"];
const PENGUIN_MESSAGES = ["NOOT!", "WADDLE~", "BRRR...", "FISH PLZ", "HONK!", ">_<", "*slides*", "SQUAWK!"];
const RABBIT_MESSAGES  = ["*thump*", "BINKY!", "CARROT?", "BOING~", "^w^", "*flop*", "SQUEE!"];

const PET_SIZE    = 80;
const MARGIN      = 10;
const STATUSBAR_H = 22;
const TABBAR_H    = 36;

const THEME_COLORS: Record<string, { color: string; colorDim: string; eyeBg: string }> = {
  green: { color: "#00ff41", colorDim: "#00cc33", eyeBg: "#0a0a0a" },
  amber: { color: "#ffb000", colorDim: "#cc8c00", eyeBg: "#0d0800" },
  white: { color: "#e0e0e0", colorDim: "#aaaaaa", eyeBg: "#000000" },
  light: { color: "#1a1a1a", colorDim: "#444444", eyeBg: "#f5f5f5" },
};

const PET_ANIMATIONS = `
  .pet-eyes { animation: petBlink 4s ease-in-out infinite; }
  @keyframes petBlink {
    0%, 88%, 100% { opacity: 1; }
    93% { opacity: 0; }
  }
  .pet-ear-left  { animation: petEarFlick 5s ease-in-out infinite; transform-origin: 7px 6px; }
  .pet-ear-right { animation: petEarFlick 5s ease-in-out infinite 0.5s; transform-origin: 26px 6px; }
  @keyframes petEarFlick {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-0.4px); }
  }
  .pet-whiskers { animation: petWhiskerTwitch 3s ease-in-out infinite; }
  @keyframes petWhiskerTwitch {
    0%, 88%, 100% { transform: scaleX(1); }
    93%           { transform: scaleX(0.94); }
  }
  .pet-tail { transform-origin: 25px 22px; animation: petTailWag 2s ease-in-out infinite; }
  @keyframes petTailWag {
    0%, 100% { transform: rotate(0deg); }
    25%      { transform: rotate(-5deg); }
    75%      { transform: rotate(5deg); }
  }
  .pet-body-run   { animation: petBodyRun 0.22s steps(1) infinite; }
  .pet-body-sleep { animation: petBodyBreathe 3s ease-in-out infinite; }
  @keyframes petBodyBreathe {
    0%, 100% { transform: scaleY(1); }
    50%      { transform: scaleY(1.04); }
  }
  .pet-penguin-waddle { animation: penguinWaddle 0.38s ease-in-out infinite alternate; }
  @keyframes penguinWaddle {
    0%   { transform: rotate(-4deg); }
    100% { transform: rotate(4deg); }
  }
  .pet-flipper-left  { transform-origin: 9px 17px;  animation: flipperWave 2.2s ease-in-out infinite; }
  .pet-flipper-right { transform-origin: 23px 17px; animation: flipperWave 2.2s ease-in-out infinite 1.1s; }
  @keyframes flipperWave {
    0%, 100% { transform: rotate(0deg); }
    30%      { transform: rotate(-10deg); }
    60%      { transform: rotate(8deg); }
  }
  .pet-rabbit-hop { animation: rabbitHop 0.3s ease-in-out infinite alternate; }
  @keyframes rabbitHop {
    0%   { transform: translateY(0); }
    100% { transform: translateY(-2px); }
  }
`;

function injectAnimations() {
  const id = "pet-anim-styles";
  if (!document.getElementById(id)) {
    const style = document.createElement("style");
    style.id = id;
    style.textContent = PET_ANIMATIONS;
    document.head.appendChild(style);
  }
}

type BodyProps = { color: string; colorDim: string; eyeBg: string; petState: PetState; facingLeft: boolean };

function CatBody({ color, colorDim, eyeBg, petState, facingLeft }: BodyProps) {
  const bodyClass = petState === "running" ? "pet-body-run" : petState === "sleeping" ? "pet-body-sleep" : "";
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 32 32"
      style={{ display: "block", transform: facingLeft ? "scaleX(-1)" : "scaleX(1)" }}>
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
      {petState === "sleeping" ? (
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
  );
}

function PenguinBody({ color, colorDim, eyeBg, petState, facingLeft }: BodyProps) {
  const waddleClass = petState === "running" ? "pet-penguin-waddle" : "";
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 32 32"
      style={{ display: "block", transform: facingLeft ? "scaleX(-1)" : "scaleX(1)" }}>
      <rect x="11" y="6"  width="10" height="1" fill={color}/>
      <rect x="10" y="7"  width="1"  height="5" fill={color}/>
      <rect x="21" y="7"  width="1"  height="5" fill={color}/>
      <rect x="11" y="12" width="10" height="1" fill={color}/>
      {petState === "sleeping" ? (
        <>
          <rect x="13" y="9" width="2" height="1" fill={color}/>
          <rect x="17" y="9" width="2" height="1" fill={color}/>
        </>
      ) : (
        <>
          <rect x="12" y="8"  width="3" height="2" fill={color}/>
          <rect x="18" y="8"  width="3" height="2" fill={color}/>
          <g className="pet-eyes">
            <rect x="13" y="8" width="1" height="2" fill={eyeBg}/>
            <rect x="19" y="8" width="1" height="2" fill={eyeBg}/>
          </g>
        </>
      )}
      <rect x="15" y="10" width="2" height="1" fill={colorDim}/>
      <rect x="15" y="11" width="2" height="2" fill={colorDim}/>
      <g className={waddleClass} style={{ transformOrigin: "16px 20px" }}>
        <rect x="10" y="13" width="12" height="1" fill={color}/>
        <rect x="9"  y="14" width="1"  height="9" fill={color}/>
        <rect x="22" y="14" width="1"  height="9" fill={color}/>
        <rect x="10" y="23" width="12" height="1" fill={color}/>
        <rect x="12" y="15" width="8"  height="1" fill={colorDim}/>
        <rect x="11" y="16" width="10" height="5" fill={colorDim}/>
        <rect x="12" y="21" width="8"  height="1" fill={colorDim}/>
        <g className="pet-flipper-left">
          <rect x="7"  y="15" width="3" height="1" fill={color}/>
          <rect x="6"  y="16" width="2" height="4" fill={color}/>
          <rect x="7"  y="20" width="2" height="1" fill={color}/>
        </g>
        <g className="pet-flipper-right">
          <rect x="22" y="15" width="3" height="1" fill={color}/>
          <rect x="24" y="16" width="2" height="4" fill={color}/>
          <rect x="23" y="20" width="2" height="1" fill={color}/>
        </g>
      </g>
      <rect x="11" y="24" width="3" height="1" fill={colorDim}/>
      <rect x="10" y="25" width="2" height="1" fill={colorDim}/>
      <rect x="13" y="25" width="2" height="1" fill={colorDim}/>
      <rect x="18" y="24" width="3" height="1" fill={colorDim}/>
      <rect x="18" y="25" width="2" height="1" fill={colorDim}/>
      <rect x="21" y="25" width="2" height="1" fill={colorDim}/>
    </svg>
  );
}

function RabbitBody({ color, colorDim, eyeBg, petState, facingLeft }: BodyProps) {
  const hopClass = petState === "running" ? "pet-rabbit-hop" : "";
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 32 32"
      style={{ display: "block", transform: facingLeft ? "scaleX(-1)" : "scaleX(1)" }}>
      <g className="pet-ear-left">
        <rect x="9"  y="3"  width="3" height="1" fill={color}/>
        <rect x="9"  y="4"  width="1" height="6" fill={color}/>
        <rect x="11" y="4"  width="1" height="6" fill={color}/>
        <rect x="9"  y="10" width="3" height="1" fill={color}/>
        <rect x="10" y="5"  width="1" height="4" fill={colorDim}/>
      </g>
      <g className="pet-ear-right">
        <rect x="20" y="3"  width="3" height="1" fill={color}/>
        <rect x="20" y="4"  width="1" height="6" fill={color}/>
        <rect x="22" y="4"  width="1" height="6" fill={color}/>
        <rect x="20" y="10" width="3" height="1" fill={color}/>
        <rect x="21" y="5"  width="1" height="4" fill={colorDim}/>
      </g>
      <rect x="10" y="11" width="12" height="1" fill={color}/>
      <rect x="9"  y="12" width="1"  height="7" fill={color}/>
      <rect x="22" y="12" width="1"  height="7" fill={color}/>
      <rect x="10" y="19" width="12" height="1" fill={color}/>
      {petState === "sleeping" ? (
        <>
          <rect x="12" y="15" width="2" height="1" fill={color}/>
          <rect x="18" y="15" width="2" height="1" fill={color}/>
        </>
      ) : (
        <>
          <rect x="12" y="13" width="2" height="2" fill={color}/>
          <rect x="18" y="13" width="2" height="2" fill={color}/>
          <g className="pet-eyes">
            <rect x="13" y="14" width="1" height="1" fill={eyeBg}/>
            <rect x="18" y="14" width="1" height="1" fill={eyeBg}/>
          </g>
        </>
      )}
      <g className="pet-whiskers">
        <rect x="15" y="16" width="2" height="1" fill={color}/>
        <rect x="15" y="17" width="2" height="1" fill={colorDim}/>
        <rect x="14" y="18" width="2" height="1" fill={colorDim}/>
        <rect x="16" y="18" width="2" height="1" fill={colorDim}/>
      </g>
      <g className={hopClass} style={{ transformOrigin: "16px 23px" }}>
        <rect x="10" y="20" width="12" height="1" fill={color}/>
        <rect x="9"  y="21" width="1"  height="5" fill={color}/>
        <rect x="22" y="21" width="1"  height="5" fill={color}/>
        <rect x="10" y="26" width="12" height="1" fill={color}/>
        <rect x="11" y="27" width="3"  height="1" fill={color}/>
        <rect x="18" y="27" width="3"  height="1" fill={color}/>
      </g>
    </svg>
  );
}

function Pet() {
  const setPetMode = useSettingsStore((s) => s.setPetMode);
  const theme      = useSettingsStore((s) => s.theme);
  const petType    = useSettingsStore((s) => s.petType);
  const isTyping   = useSettingsStore((s) => s.isTyping);

  const [pos, setPetPos]            = useState({ x: window.innerWidth / 2 - 40, y: window.innerHeight / 2 - 40 });
  const [petState, setPetState]     = useState<PetState>("idle");
  const [isHidden, setIsHidden]     = useState(false);
  const [isJumping, setIsJumping]   = useState(false);
  const [bubble, setBubble]         = useState<{ text: string; id: number } | null>(null);
  const [facingLeft, setFacingLeft] = useState(false);

  const isDragging  = useRef(false);
  const dragStart   = useRef({ mx: 0, my: 0, cx: 0, cy: 0 });
  const msgTimeout  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const walkTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef      = useRef<number | null>(null);
  const jumpTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bubbleId    = useRef(0);

  useEffect(() => { injectAnimations(); }, []);

  const messages = petType === "penguin" ? PENGUIN_MESSAGES
                 : petType === "rabbit"  ? RABBIT_MESSAGES
                 : CAT_MESSAGES;

  const showMsg = useCallback((text: string) => {
    setBubble({ text, id: ++bubbleId.current });
    if (msgTimeout.current) clearTimeout(msgTimeout.current);
    msgTimeout.current = setTimeout(() => setBubble(null), 2200);
  }, []);

  const walkTo = useCallback((targetX: number, targetY: number, fromX: number, fromY: number) => {
    const dist = Math.hypot(targetX - fromX, targetY - fromY);
    if (dist < 5) { setPetState("idle"); return; }
    setFacingLeft(targetX < fromX);
    setPetState("running");
    const duration = 400 + dist * 1.5;
    const startTime = Date.now();
    const step = () => {
      const t = Math.min((Date.now() - startTime) / duration, 1);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      setPetPos({ x: fromX + (targetX - fromX) * ease, y: fromY + (targetY - fromY) * ease });
      if (t < 1) { rafRef.current = requestAnimationFrame(step); }
      else { setPetPos({ x: targetX, y: targetY }); setPetState("idle"); }
    };
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);
  }, []);

  const scheduleWalk = useCallback(() => {
    if (walkTimeout.current) clearTimeout(walkTimeout.current);
    const delay = isTyping ? 10000 + Math.random() * 8000 : 6000 + Math.random() * 8000;
    walkTimeout.current = setTimeout(() => {
      if (isDragging.current) { scheduleWalk(); return; }
      let tx: number, ty: number;
      if (isTyping) {
        const bottomY = window.innerHeight - STATUSBAR_H - TABBAR_H - PET_SIZE;
        tx = MARGIN + Math.random() * (window.innerWidth - PET_SIZE - MARGIN * 2);
        ty = bottomY;
      } else {
        tx = MARGIN + Math.random() * (window.innerWidth - PET_SIZE - MARGIN * 2);
        ty = MARGIN + Math.random() * (window.innerHeight - PET_SIZE - MARGIN * 2);
      }
      setPetPos(cur => { walkTo(tx, ty, cur.x, cur.y); return cur; });
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
      const bottomY = window.innerHeight - STATUSBAR_H - TABBAR_H - PET_SIZE;
      setPetPos(cur => { walkTo(cur.x, bottomY, cur.x, cur.y); return cur; });
      scheduleWalk();
    }
  }, [isTyping, walkTo, scheduleWalk]);

  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(`.${styles.exitBtn}`)) return;
    e.preventDefault();
    isDragging.current = true;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (walkTimeout.current) clearTimeout(walkTimeout.current);
    setPetState("idle");
    dragStart.current = { mx: e.clientX, my: e.clientY, cx: pos.x, cy: pos.y };
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const nx = dragStart.current.cx + e.clientX - dragStart.current.mx;
      const ny = dragStart.current.cy + e.clientY - dragStart.current.my;
      setPetPos({
        x: Math.max(0, Math.min(window.innerWidth - PET_SIZE, nx)),
        y: Math.max(0, Math.min(window.innerHeight - PET_SIZE, ny)),
      });
    };
    const onUp = () => { if (!isDragging.current) return; isDragging.current = false; scheduleWalk(); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [scheduleWalk]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (e.detail !== 1 || isDragging.current) return;
    showMsg(messages[Math.floor(Math.random() * messages.length)]);
    setIsJumping(false);
    if (jumpTimeout.current) clearTimeout(jumpTimeout.current);
    requestAnimationFrame(() => {
      setIsJumping(true);
      jumpTimeout.current = setTimeout(() => setIsJumping(false), 450);
    });
  }, [showMsg, messages]);

  const handleDblClick = useCallback(() => {
    if (walkTimeout.current) clearTimeout(walkTimeout.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setPetState("sleeping");
    showMsg("ZZZ...");
    setIsHidden(true);
    setTimeout(() => setPetMode(false), 2000);
  }, [showMsg, setPetMode]);

  const { color, colorDim, eyeBg } = THEME_COLORS[theme] ?? THEME_COLORS.green;

  const containerClass = [
    styles.cat,
    petState === "running"  ? styles.running  : "",
    petState === "sleeping" ? styles.sleeping : "",
    isJumping ? styles.jumping : "",
    isHidden  ? styles.hidden  : "",
  ].filter(Boolean).join(" ");

  const bodyProps = { color, colorDim, eyeBg, petState, facingLeft };

  return (
    <div className={styles.overlay}>
      <div
        className={containerClass}
        style={{ left: pos.x, top: pos.y }}
        onMouseDown={onMouseDown}
        onClick={handleClick}
        onDoubleClick={handleDblClick}
      >
        {petType === "penguin" ? <PenguinBody {...bodyProps} />
         : petType === "rabbit" ? <RabbitBody {...bodyProps} />
         : <CatBody {...bodyProps} />}
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

export default Pet;