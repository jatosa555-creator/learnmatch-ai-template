'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import contentItems from '../content/items.json';
import gameConfig from '../content/game-config.json';

type RoleModel = {
  id: string;
  name: string;
  image: string;
  label: string;
  color: string;
};

type Card = RoleModel & { cardId: string; pairKey: string };

const roleModels: RoleModel[] = [
  {
    id: 'ada',
    name: 'Ada Lovelace',
    image: '/assets/ada.jpg',
    label: 'first programmer',
    color: '#66e6ff',
  },
  {
    id: 'hedy',
    name: 'Hedy Lamarr',
    image: '/assets/hedy.jpg',
    label: 'frequency-hopping inventor',
    color: '#c989ff',
  },
  {
    id: 'katherine',
    name: 'Katherine Johnson',
    image: '/assets/katherine.jpg',
    label: 'NASA mathematician',
    color: '#ff9d6c',
  },
  {
    id: 'marie',
    name: 'Marie Curie',
    image: '/assets/marie-curie.jpg',
    label: 'radioactivity pioneer',
    color: '#83f3bf',
  },
];

const initialCardOrder = [
  'katherine-1-a', 'ada-1-a', 'marie-2-a', 'hedy-1-a',
  'ada-2-a', 'marie-1-a', 'hedy-2-a', 'katherine-2-a',
  'katherine-1-b', 'ada-1-b', 'marie-2-b', 'hedy-1-b',
  'ada-2-b', 'marie-1-b', 'hedy-2-b', 'katherine-2-b',
];

function shuffle<T>(items: T[]) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function makeDeck(shouldShuffle = true) {
  const cards = roleModels.flatMap((roleModel) =>
    [1, 2].flatMap((pairNumber) => [
      { ...roleModel, cardId: `${roleModel.id}-${pairNumber}-a`, pairKey: `${roleModel.id}-${pairNumber}` },
      { ...roleModel, cardId: `${roleModel.id}-${pairNumber}-b`, pairKey: `${roleModel.id}-${pairNumber}` },
    ]),
  );
  if (shouldShuffle) return shuffle(cards);
  const cardsById = Object.fromEntries(cards.map((card) => [card.cardId, card]));
  return initialCardOrder.map((cardId) => cardsById[cardId]);
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function LegacyHome() {
  const [deck, setDeck] = useState<Card[]>(() => makeDeck(false));
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const matchedCount = matchedIds.length / 2;
  const totalPairs = deck.length / 2;
  const completed = matchedIds.length === deck.length;
  const accuracy = attempts === 0 ? 100 : Math.round((matchedCount / attempts) * 100);
  const progress = Math.round((matchedCount / totalPairs) * 100);

  useEffect(() => {
    if (completed) return;
    const timer = window.setInterval(() => setSeconds((current) => current + 1), 1000);
    return () => window.clearInterval(timer);
  }, [completed]);

  const resetGame = () => {
    setDeck(makeDeck());
    setFlippedIds([]);
    setMatchedIds([]);
    setAttempts(0);
    setSeconds(0);
    setStreak(0);
    setIsLocked(false);
  };

  const handleCardClick = (card: Card) => {
    if (isLocked || flippedIds.includes(card.cardId) || matchedIds.includes(card.cardId)) return;

    const nextFlipped = [...flippedIds, card.cardId];
    setFlippedIds(nextFlipped);

    if (nextFlipped.length < 2) return;

    setAttempts((current) => current + 1);
    setIsLocked(true);
    const firstCard = deck.find((item) => item.cardId === nextFlipped[0]);
    const isMatch = firstCard?.pairKey === card.pairKey;

    window.setTimeout(() => {
      if (isMatch) {
        setMatchedIds((current) => [...current, ...nextFlipped]);
        setStreak((current) => current + 1);
      } else {
        setStreak(0);
      }
      setFlippedIds([]);
      setIsLocked(false);
    }, isMatch ? 360 : 850);
  };

  const spotlight = useMemo(() => {
    if (completed) return 'Every mind is visible.';
    if (streak >= 2) return 'You are in the flow.';
    if (matchedCount === 0) return 'Start with a hunch.';
    return 'Keep connecting the clues.';
  }, [completed, matchedCount, streak]);

  return (
    <main className="game-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div>
            <p className="eyebrow">The Invisible STEM Role Models</p>
            <p className="brand-title">Memory / Match</p>
          </div>
        </div>
        <div className="source-note">
          <span className="live-dot" />
          <span>pilot board · 04 minds</span>
        </div>
      </header>

      <section className="intro" aria-labelledby="game-title">
        <div className="intro-copy">
          <p className="section-kicker">A little recognition game</p>
          <h1 id="game-title">Make the<br /><em>connection.</em></h1>
          <p className="intro-description">
            Flip two cards at a time. Find the matching portraits and meet the brilliant minds who helped shape our world.
          </p>
          <div className="intro-quote">
            <span className="quote-line" />
            <p>&ldquo;The important thing is to never stop questioning.&rdquo;</p>
          </div>
        </div>

        <div className="play-column">
          <div className="stats-row" aria-label="Game stats">
            <div className="stat-card stat-card-featured">
              <span className="stat-label">Time</span>
              <strong>{formatTime(seconds)}</strong>
              <span className="stat-meta">stay curious</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Matches</span>
              <strong>{matchedCount}<small>/{totalPairs}</small></strong>
              <span className="stat-meta">{spotlight}</span>
            </div>
            <div className="stat-card stat-card-compact">
              <span className="stat-label">Moves</span>
              <strong>{attempts.toString().padStart(2, '0')}</strong>
              <span className="stat-meta">{accuracy}% focus</span>
            </div>
          </div>

          <div className="board-heading">
            <div>
              <p className="section-kicker">The connection board</p>
              <h2>Find your role models</h2>
            </div>
            <button className="reset-button" type="button" onClick={resetGame}>
              <span aria-hidden="true">↻</span> New round
            </button>
          </div>

          <div className="progress-track" aria-label={`${progress}% complete`}>
            <span style={{ width: `${progress}%` }} />
          </div>

          <div className="board" aria-label="4 by 4 memory card board">
            {deck.map((card, index) => {
              const isFlipped = flippedIds.includes(card.cardId) || matchedIds.includes(card.cardId);
              const isMatched = matchedIds.includes(card.cardId);
              return (
                <button
                  className={`memory-card ${isFlipped ? 'is-flipped' : ''} ${isMatched ? 'is-matched' : ''}`}
                  key={card.cardId}
                  type="button"
                  aria-label={isFlipped ? `${card.name}, ${card.label}` : `Hidden card ${index + 1}`}
                  aria-pressed={isFlipped}
                  onClick={() => handleCardClick(card)}
                >
                  <span className="card-inner">
                    <span className="card-face card-back" aria-hidden="true">
                      <span className="card-index">{(index + 1).toString().padStart(2, '0')}</span>
                      <span className="card-symbol">+</span>
                      <span className="card-hint">reveal</span>
                    </span>
                    <span className="card-face card-front" style={{ '--card-accent': card.color } as React.CSSProperties}>
                      <img src={card.image} alt="" />
                      <span className="card-front-shade" />
                      <span className="card-name">{card.name}</span>
                      <span className="card-label">{card.label}</span>
                      {isMatched && <span className="match-check" aria-hidden="true">✓</span>}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="board-footer">
            <p><span className="footer-dot" /> Tap any card to reveal a mind</p>
            <p className="source-credit">Images from the original role model archive</p>
          </div>

          {completed && (
            <div className="completion-card" role="status" aria-live="polite">
              <div>
                <span className="section-kicker">Round complete</span>
                <h3>You made every connection.</h3>
              </div>
              <div className="completion-score">
                <strong>{formatTime(seconds)}</strong>
                <span>{attempts} moves · {accuracy}% focus</span>
              </div>
              <button className="play-again" type="button" onClick={resetGame}>Play again <span aria-hidden="true">→</span></button>
            </div>
          )}
        </div>
      </section>

      <footer className="site-footer">
        <span>Observe · Remember · Celebrate</span>
        <span>Built for the curious</span>
      </footer>
    </main>
  );
}

type AdvancedView = 'game' | 'learn';

type AdvancedRoleModel = {
  id: string;
  thName: string;
  name: string;
  image: string;
  wikipediaUrl: string;
  wikipediaLanguage: 'ไทย' | 'English';
  fieldTh: string;
  fieldEn: string;
  color: string;
  bio: string;
  facts: string[];
};

type AdvancedCard = AdvancedRoleModel & { cardId: string; pairKey: string };

const contentDrivenRoleModels: AdvancedRoleModel[] = contentItems.map((item) => ({
  id: item.id,
  thName: item.title.th,
  name: item.title.en,
  image: item.image,
  wikipediaUrl: item.source.url,
  wikipediaLanguage: item.source.language === 'th' ? 'ไทย' : 'English',
  fieldTh: item.field.th,
  fieldEn: item.field.en,
  color: item.color,
  bio: item.description.th,
  facts: item.facts.th,
}));

const advancedRoleModels: AdvancedRoleModel[] = contentDrivenRoleModels;

const advancedInitialOrder = [
  'rosalind-a', 'ada-a', 'tu-a', 'hedy-a', 'mae-a',
  'marie-a', 'katherine-a', 'grace-a', 'valentina-a', 'chien-a',
  'chien-b', 'valentina-b', 'grace-b', 'katherine-b', 'marie-b',
  'mae-b', 'hedy-b', 'tu-b', 'ada-b', 'rosalind-b',
];

type Difficulty = 'basic' | 'advanced';

const basicRoleModelIds = gameConfig.difficulties.basic.itemIds;
const basicRoleModels = advancedRoleModels.filter((roleModel) => basicRoleModelIds.includes(roleModel.id));

function makeRoleModelDeck(roleModels: AdvancedRoleModel[], shouldShuffle = true) {
  const cards = roleModels.flatMap((roleModel) => [
    { ...roleModel, cardId: roleModel.id + '-a', pairKey: roleModel.id },
    { ...roleModel, cardId: roleModel.id + '-b', pairKey: roleModel.id },
  ]);
  if (shouldShuffle) return shuffle(cards);
  const cardsById = Object.fromEntries(cards.map((card) => [card.cardId, card]));
  const defaultOrder = roleModels.flatMap((roleModel) => [roleModel.id + '-a', roleModel.id + '-b']);
  const preferredOrder = advancedInitialOrder.map((cardId) => cardsById[cardId]).filter(Boolean);
  const preferredIds = new Set(preferredOrder.map((card) => card.cardId));
  const remainingCards = defaultOrder
    .filter((cardId) => !preferredIds.has(cardId))
    .map((cardId) => cardsById[cardId])
    .filter(Boolean);
  return roleModels.length === advancedRoleModels.length
    ? [...preferredOrder, ...remainingCards]
    : defaultOrder.map((cardId) => cardsById[cardId]).filter(Boolean);
}

function speedBonus(totalSeconds: number, difficulty: Difficulty) {
  const thresholds = difficulty === 'basic' ? [45, 75, 120, 180, 270] : [90, 150, 240, 360, 540];
  if (totalSeconds <= thresholds[0]) return 20;
  if (totalSeconds <= thresholds[1]) return 16;
  if (totalSeconds <= thresholds[2]) return 12;
  if (totalSeconds <= thresholds[3]) return 8;
  if (totalSeconds <= thresholds[4]) return 4;
  return 0;
}

function getScore(matchedCount: number, attempts: number, totalSeconds: number, completed: boolean, totalPairs: number, difficulty: Difficulty) {
  const accuracyPoints = attempts === 0 ? 0 : Math.round(Math.min(1, matchedCount / attempts) * 50);
  const completionPoints = completed ? 30 : Math.round((matchedCount / totalPairs) * 30);
  const speedPoints = completed ? speedBonus(totalSeconds, difficulty) : 0;
  return {
    completion: completionPoints,
    accuracy: accuracyPoints,
    speed: speedPoints,
    total: completionPoints + accuracyPoints + speedPoints,
  };
}

export default function Home() {
  const [activeView, setActiveView] = useState<AdvancedView>('game');
  const [difficulty, setDifficulty] = useState<Difficulty>('basic');
  const [hasStarted, setHasStarted] = useState(false);
  const [deck, setDeck] = useState<AdvancedCard[]>(() => makeRoleModelDeck(basicRoleModels, false));
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState(advancedRoleModels[0]?.id ?? '');
  const roundToken = useRef(0);

  const activeRoleModels = difficulty === 'basic' ? basicRoleModels : advancedRoleModels;
  const totalPairs = activeRoleModels.length;
  const matchedCount = matchedIds.length / 2;
  const completed = matchedIds.length === deck.length;
  const progress = Math.round((matchedCount / totalPairs) * 100);
  const accuracyPercent = attempts === 0 ? 100 : Math.round((matchedCount / attempts) * 100);
  const score = getScore(matchedCount, attempts, seconds, completed, totalPairs, difficulty);
  const selectedPerson = advancedRoleModels.find((person) => person.id === selectedPersonId) ?? advancedRoleModels[0];
  const gameMessage = completed ? 'เก่งมาก! คุณรู้จักครบทุกคนแล้ว (All minds matched).' : streak >= 2 ? 'กำลังไปได้สวย (You are in the flow).' : matchedCount === 0 ? 'เริ่มจากสัญชาตญาณ (Start with a hunch).' : 'ค่อย ๆ เชื่อมโยงกันไป (Keep connecting).';
  const difficultyLabel = difficulty === 'basic' ? 'พื้นฐาน (Basic)' : 'ขั้นสูง (Advanced)';

  useEffect(() => {
    if (!hasStarted || completed || activeView !== 'game') return;
    const timer = window.setInterval(() => setSeconds((current) => current + 1), 1000);
    return () => window.clearInterval(timer);
  }, [activeView, completed, hasStarted]);

  const resetRoundState = (nextDifficulty: Difficulty, startImmediately: boolean) => {
    roundToken.current += 1;
    const nextRoleModels = nextDifficulty === 'basic' ? basicRoleModels : advancedRoleModels;
    setDifficulty(nextDifficulty);
    setDeck(makeRoleModelDeck(nextRoleModels, startImmediately));
    setFlippedIds([]);
    setMatchedIds([]);
    setAttempts(0);
    setSeconds(0);
    setStreak(0);
    setIsLocked(false);
    setHasStarted(startImmediately);
    setActiveView('game');
  };

  const selectDifficulty = (nextDifficulty: Difficulty) => resetRoundState(nextDifficulty, false);
  const startGame = () => resetRoundState(difficulty, true);
  const resetGame = () => startGame();

  const handleCardClick = (card: AdvancedCard) => {
    if (!hasStarted || isLocked || flippedIds.includes(card.cardId) || matchedIds.includes(card.cardId)) return;
    const nextFlipped = [...flippedIds, card.cardId];
    setFlippedIds(nextFlipped);
    if (nextFlipped.length < 2) return;

    setAttempts((current) => current + 1);
    setIsLocked(true);
    const firstCard = deck.find((item) => item.cardId === nextFlipped[0]);
    const isMatch = firstCard?.pairKey === card.pairKey;
    const token = roundToken.current;
    window.setTimeout(() => {
      if (roundToken.current !== token) return;
      if (isMatch) {
        setMatchedIds((current) => [...current, ...nextFlipped]);
        setStreak((current) => current + 1);
      } else {
        setStreak(0);
      }
      setFlippedIds([]);
      setIsLocked(false);
    }, isMatch ? 360 : 850);
  };

  return (
    <main className="game-shell advanced-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true"><span /><span /><span /></div>
          <div>
            <p className="eyebrow">The Invisible STEM Role Models</p>
            <p className="brand-title">Memory / Match</p>
          </div>
        </div>
        <div className="topbar-actions">
          <div className="source-note"><span className="live-dot" /><span>{totalPairs} role models · {deck.length} cards</span></div>
          <nav className="main-tabs" aria-label="โหมดการใช้งาน (Experience modes)">
            <button type="button" className={`tab-button ${activeView === 'game' ? 'is-active' : ''}`} onClick={() => setActiveView('game')}>จำคู่ (Remember)</button>
            <button type="button" className={`tab-button ${activeView === 'learn' ? 'is-active' : ''}`} onClick={() => setActiveView('learn')}>เรียนรู้ (Learn)</button>
          </nav>
        </div>
      </header>

      {activeView === 'game' ? (
        <section className="intro game-view" aria-labelledby="game-title">
          <div className="intro-copy">
            <p className="section-kicker">เกมจำคู่ (Memory game)</p>
            <h1 id="game-title">รู้จักคน<br /><em>จำให้ได้.</em></h1>
            <p className="intro-description">เปิดไพ่ 2 ใบต่อครั้ง จับคู่บุคคลสำคัญ แล้วค้นพบเรื่องราวของผู้เปลี่ยนโลก (Meet the minds behind the milestones.)</p>
            <div className="intro-quote"><span className="quote-line" /><p>&ldquo;ความอยากรู้อยากเห็น คือจุดเริ่มต้นของการค้นพบ (Curiosity is the beginning of discovery.)&rdquo;</p></div>
          </div>

          <div className="play-column">
            <div className="difficulty-panel" aria-label="เลือกระดับเกม (Choose game level)">
              <div className="difficulty-copy">
                <span className="section-kicker">เลือกระดับ (Choose level)</span>
                <strong>{difficultyLabel}</strong>
                <span>เลือกโหมด แล้วกด Start เพื่อเริ่ม (Choose a mode, then press Start.)</span>
              </div>
              <div className="difficulty-options" role="group" aria-label="ระดับเกม (Game levels)">
                <button className={difficulty === 'basic' ? 'difficulty-button is-active' : 'difficulty-button'} type="button" onClick={() => selectDifficulty('basic')} aria-pressed={difficulty === 'basic'}>
                  <strong>พื้นฐาน (Basic)</strong><span>6 คน · 12 ใบ · 3×4</span>
                </button>
                <button className={difficulty === 'advanced' ? 'difficulty-button is-active' : 'difficulty-button'} type="button" onClick={() => selectDifficulty('advanced')} aria-pressed={difficulty === 'advanced'}>
                  <strong>ขั้นสูง (Advanced)</strong><span>10 คน · 20 ใบ · 4×5</span>
                </button>
              </div>
              <button className="start-button" type="button" onClick={startGame}><span aria-hidden="true">▶</span> เริ่มเกม (Start)</button>
            </div>
            <div className="stats-row advanced-stats" aria-label="สถิติการเล่น (Game stats)">
              <div className="stat-card stat-card-featured"><span className="stat-label">เวลา (Time)</span><strong>{formatTime(seconds)}</strong><span className="stat-meta">เรียนรู้ไปทีละก้าว (Stay curious)</span></div>
              <div className="stat-card"><span className="stat-label">คู่ที่พบ (Matches)</span><strong>{matchedCount}<small>/{totalPairs}</small></strong><span className="stat-meta">{gameMessage}</span></div>
              <div className="stat-card stat-card-compact"><span className="stat-label">ครั้งที่เปิด (Moves)</span><strong>{attempts.toString().padStart(2, '0')}</strong><span className="stat-meta">{accuracyPercent}% ความแม่นยำ (Focus)</span></div>
              <div className="stat-card score-stat"><span className="stat-label">คะแนน (Score)</span><strong>{score.total}<small>/100</small></strong><span className="stat-meta">เต็ม 100 คะแนน (Max)</span><div className="score-card-breakdown"><span>คะแนนเต็ม 100 (Scoring)</span><small>จบเกม <b>30</b> + ความแม่นยำ <b>50</b> + ความเร็ว <b>20</b></small></div></div>
            </div>

            <div className="board-heading"><div><p className="section-kicker">กระดานเชื่อมโยง (Connection board)</p><h2>จับคู่ให้ครบ {totalPairs} คน (Find every pair)</h2></div><button className="reset-button" type="button" onClick={() => resetGame()}><span aria-hidden="true">↻</span> เริ่มใหม่ (New round)</button></div>
            <div className="progress-meta"><span>ความคืบหน้า (Progress)</span><strong>{progress}%</strong></div>
            <div className="progress-track" aria-label={`ความคืบหน้า ${progress}% (Progress ${progress}%)`}><span style={{ width: `${progress}%` }} /></div>

            <div className={'board advanced-board ' + (difficulty === 'basic' ? 'basic-board' : '')} aria-label={difficulty === 'basic' ? 'กระดานจับคู่ 3 คอลัมน์ 4 แถว (3 columns × 4 rows)' : 'กระดานจับคู่ 4 คอลัมน์ 5 แถว (4 columns × 5 rows)'}>
              {deck.map((card, index) => {
                const isFlipped = flippedIds.includes(card.cardId) || matchedIds.includes(card.cardId);
                const isMatched = matchedIds.includes(card.cardId);
                return <button className={`memory-card ${isFlipped ? 'is-flipped' : ''} ${isMatched ? 'is-matched' : ''}`} key={card.cardId} type="button" disabled={!hasStarted} aria-label={isFlipped ? `${card.thName} (${card.name}), ${card.fieldTh} (${card.fieldEn})` : `ไพ่ใบที่ ${index + 1} (Hidden card ${index + 1})`} aria-pressed={isFlipped} onClick={() => handleCardClick(card)}>
                  <span className="card-inner"><span className="card-face card-back" aria-hidden="true"><span className="card-index">{(index + 1).toString().padStart(2, '0')}</span><span className="card-symbol">+</span><span className="card-hint">แตะเพื่อเปิด (Tap)</span></span><span className="card-face card-front" style={{ '--card-accent': card.color } as React.CSSProperties}><img src={card.image} alt="" /><span className="card-front-shade" /><span className="card-name">{card.thName}</span><span className="card-name-en">{card.name}</span><span className="card-label">{card.fieldTh}<small> ({card.fieldEn})</small></span>{isMatched && <span className="match-check" aria-hidden="true">✓</span>}</span></span>
                </button>;
              })}
            </div>

            <div className="board-footer"><p><span className="footer-dot" /> {hasStarted ? 'แตะไพ่เพื่อเปิด (Tap to reveal)' : 'เลือกโหมด แล้วกด Start เพื่อเริ่ม (Choose a mode, then press Start)'}</p><p className="source-credit">ภาพจริงจากคลังต้นฉบับ (Original source archive)</p></div>

            {completed && <div className="completion-card advanced-completion" role="status" aria-live="polite"><div><span className="section-kicker">จบเกมแล้ว (Round complete)</span><h3>คุณเชื่อมโยงครบทุกคน (Every mind is visible).</h3></div><div className="score-breakdown"><div><strong>{score.completion}</strong><span>จบเกม (Completion)</span></div><div><strong>{score.accuracy}</strong><span>แม่นยำ (Accuracy)</span></div><div><strong>{score.speed}</strong><span>ความเร็ว (Speed)</span></div></div><div className="completion-total"><strong>{score.total}<small>/100</small></strong><span>คะแนนรวม (Final score)</span></div><button className="play-again" type="button" onClick={resetGame}>เล่นอีกครั้ง (Play again) <span aria-hidden="true">→</span></button></div>}
          </div>
        </section>
      ) : (
        <section className="learn-view" aria-labelledby="learn-title">
          <div className="learn-hero"><div><p className="section-kicker">คลังความรู้ (Learning library)</p><h1 id="learn-title">ทำความรู้จัก<br /><em>คนสำคัญ.</em></h1></div><p>ก่อนจะจำชื่อ ลองรู้จักเรื่องราวของพวกเขาก่อน (Learn who they are before you match their names.)<br /><span>เลือกบุคคลใดก็ได้เพื่ออ่านข้อมูลเพิ่มเติม (Select a person to explore.)</span></p></div>
          <div className="learn-layout"><div className="profile-grid" aria-label="รายชื่อบุคคลสำคัญ (Role model list)">{advancedRoleModels.map((person, index) => <button className={`profile-tile ${selectedPerson.id === person.id ? 'is-selected' : ''}`} key={person.id} type="button" onClick={() => setSelectedPersonId(person.id)} aria-pressed={selectedPerson.id === person.id}><img src={person.image} alt="" /><span className="profile-shade" /><span className="profile-index">{(index + 1).toString().padStart(2, '0')}</span><span className="profile-copy"><strong>{person.thName}</strong><small>{person.name}</small><span>{person.fieldTh}</span></span></button>)}</div>
            <article className="profile-detail">
              <div className="detail-image"><img src={selectedPerson.image} alt={selectedPerson.name} /><span className="detail-image-label">{selectedPerson.name}</span></div>
              <div className="detail-copy">
                <p className="section-kicker">โปรไฟล์บุคคลสำคัญ (Role model profile)</p>
                <h2>{selectedPerson.thName}<span>{selectedPerson.name}</span></h2>
                <p className="detail-field">{selectedPerson.fieldTh}<small> ({selectedPerson.fieldEn})</small></p>
                <p className="detail-bio">{selectedPerson.bio}</p>
                <div className="detail-facts">{selectedPerson.facts.map((fact) => <span key={fact}>{fact}</span>)}</div>
                <div className="learn-actions">
                  <a className="wikipedia-link" href={selectedPerson.wikipediaUrl} target="_blank" rel="noopener noreferrer">อ่านเพิ่มเติม (Wikipedia {selectedPerson.wikipediaLanguage}) <span aria-hidden="true">↗</span></a>
                  <button className="detail-game-link" type="button" onClick={() => setActiveView('game')}>กลับไปเล่นเกม (Back to game) <span aria-hidden="true">→</span></button>
                </div>
              </div>
            </article>
          </div>
          <div className="learn-note"><span className="footer-dot" /> ข้อมูลเรียบเรียงจาก The Invisible STEM Role Models · เนื้อหาสำหรับการเรียนรู้ (For learning use)</div>
        </section>
      )}

      <footer className="site-footer"><span>สังเกต · จดจำ · ชื่นชม (Observe · Remember · Celebrate)</span><span>สร้างมาเพื่อคนช่างสงสัย (Built for the curious)</span></footer>
    </main>
  );
}
