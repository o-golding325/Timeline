import React, { useState } from 'react'
import { getDailyIndex, getNextUnusedIndex, getEvents } from './QuestionBank'
import '../App.css'


// Modal component must be outside main function
import exampleEvent from '../assets/example-event.jpg'

function HowToPlayModal({ open, onClose }) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>How to Play</h2>
        <img src={exampleEvent} alt="Example event" style={{maxWidth:'100%',borderRadius:'8px',marginBottom:'1rem'}} />
        <p>Guess the year that the event took place.</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

// User stats for daily events
function getDailyStats() {
  const raw = localStorage.getItem('timeliner_daily_stats')
  return raw ? JSON.parse(raw) : { streak: 0, lastDate: '', total: 0, correct: 0 }
}

function setDailyStats(stats) {
  localStorage.setItem('timeliner_daily_stats', JSON.stringify(stats))
}

function DailyStats() {
  const [stats, setStatsState] = React.useState(getDailyStats())
  React.useEffect(() => {
    const handler = () => setStatsState(getDailyStats())
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])
  return (
    <div style={{background:'#f5f7fa',border:'1px solid #eee',borderRadius:'8px',padding:'0.5em 1em',marginBottom:'0.5em',fontSize:'0.98em'}}>
      <b>Daily Stats:</b> Streak: {stats.streak} | Played: {stats.total} | Correct: {stats.correct}
    </div>
  )
}

export default function Game() {
  // Track which questions have been played
  const [mode, setMode] = useState('daily') // 'daily' or 'extra'
  const [used, setUsed] = useState(() => {
    const raw = localStorage.getItem('timeliner_used')
    return raw ? JSON.parse(raw) : []
  })
  // Track last daily event played (by date string)
  const todayStr = new Date().toISOString().slice(0, 10)
  const [lastDaily, setLastDaily] = useState(() => localStorage.getItem('timeliner_last_daily') || '')
  const [events, setEvents] = useState(null);
  const [index, setIndex] = useState(null);
  // Load events and index on mount and when used changes
  React.useEffect(() => {
    let isMounted = true;
    async function loadAll() {
      const evts = await getEvents();
      if (!isMounted) return;
      setEvents(evts);
      let idx;
      if (used.length === 0) {
        idx = await getDailyIndex();
      } else {
        idx = await getNextUnusedIndex(used);
        if (idx === null) idx = 0;
      }
      if (!isMounted) return;
      setIndex(idx);
    }
    loadAll();
    return () => { isMounted = false; };
  }, [used]);

  // Guard: If events or index is undefined, show loading or error
  if (!events || index === null || !events[index]) {
    return (
      <div className="game">
        <DailyStats />
        <section className="prompt">
          <h2>Loading event...</h2>
          <p>If this persists, the event pool may be empty or misconfigured.</p>
        </section>
      </div>
    );
  }
  const event = events[index];
  console.log('index:', index, 'events.length:', events.length, 'event:', event);

  const [guess, setGuess] = useState('')
  const [era, setEra] = useState('AD') // 'AD' or 'BCE'
  const [showHowTo, setShowHowTo] = useState(false)
  const [tries, setTries] = useState([])
  const [done, setDone] = useState(false)

  // If user already played daily today, skip to extra mode
  React.useEffect(() => {
    if (mode === 'daily' && lastDaily === todayStr && events) {
      setMode('extra');
      async function setNextUnused() {
        const nextIndex = await getNextUnusedIndex(used);
        if (nextIndex !== null) setIndex(nextIndex);
      }
      setNextUnused();
    }
  }, [mode, lastDaily, todayStr, used, events]);

  const handleGuess = (e) => {
    e.preventDefault()
    if (done) return
    let val = parseInt(guess, 10)
    if (Number.isNaN(val)) return
    if (era === 'BCE') val = -Math.abs(val)
    else val = Math.abs(val)

    const diff = val - Number(event.year)
    let hint = ''
    const absDiff = Math.abs(diff)
    if (absDiff === 0) {
      hint = 'correct'
    } else if (absDiff <= 10) {
      hint = 'boiling'
    } else if (absDiff <= 40) {
      hint = 'hot'
    } else if (absDiff <= 100) {
      hint = 'cold'
    } else {
      hint = 'freezing'
    }
    const next = [...tries, { value: val, diff, hint, era }]
    setTries(next)
    setGuess('')
    if (absDiff === 0 || next.length >= 4) setDone(true)
  }

  const onNext = () => {
    // Mark this question as used
    const newUsed = [...used, index];
    setUsed(newUsed);
    localStorage.setItem('timeliner_used', JSON.stringify(newUsed));
    // If daily, mark as played today and update stats
    if (mode === 'daily') {
      localStorage.setItem('timeliner_last_daily', todayStr);
      setLastDaily(todayStr);
      // Update stats
      let stats = getDailyStats();
      if (stats.lastDate === todayStr) {
        // Already played today, do not increment
      } else {
        stats.total += 1;
        if (tries.length && tries[tries.length-1].hint === 'correct') {
          stats.streak = (stats.lastDate && ((new Date(todayStr) - new Date(stats.lastDate)) === 86400000)) ? stats.streak + 1 : 1;
          stats.correct += 1;
        } else {
          stats.streak = 0;
        }
        stats.lastDate = todayStr;
        setDailyStats(stats);
      }
    }
    // Switch to extra mode if daily was completed
    setMode('extra');
    // Pick next unused question
    async function setNextUnused() {
      const nextIndex = await getNextUnusedIndex(newUsed);
      if (nextIndex !== null) {
        setIndex(nextIndex);
        setTries([]);
        setDone(false);
        setGuess('');
      }
    }
    setNextUnused();
  };

  const onReset = () => {
    window.location.reload()
  }

  console.log('index:', index, 'events.length:', events.length, 'event:', event);

  return (
    <div className="game">
      <DailyStats />
      <section className="prompt">
        {mode === 'daily' && (
          <div style={{background:'#ffe066',color:'#7a5c00',padding:'0.5em 1em',borderRadius:'8px',marginBottom:'0.5em',fontWeight:'bold',fontSize:'1.1em',textAlign:'center',letterSpacing:'0.5px'}}>
            Primary Event of the Day
            <CountdownToNextDaily />
          </div>
        )}

        <h2 className="event-title">{event.title}</h2>
        {event.image && (
          <img src={event.image} alt="event" className="event-image" />
        )}
        <p className="event-desc">{event.description}</p>
      </section>

      <section className="controls">
        <form onSubmit={handleGuess} className="guess-form">
          <label htmlFor="guess">Your guess (year)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              id="guess"
              type="number"
              inputMode="numeric"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Year"
              disabled={done}
              style={{ width: '6em' }}
            />
            <button
              type="button"
              onClick={() => setEra(era === 'AD' ? 'BCE' : 'AD')}
              style={{ minWidth: '3.5em', fontWeight: 'bold', border: '1px solid #ccc', borderRadius: '6px', background: '#f5f7fa', cursor: 'pointer' }}
              tabIndex={-1}
              aria-label="Switch BCE/AD"
              disabled={done}
            >
              {era}
            </button>
          </div>
          <div className="buttons">
            <button type="submit" disabled={done || !guess}>
              Guess
            </button>
            <button type="button" onClick={onReset} className="muted">
              New
            </button>
          </div>
        </form>

        <div className="feedback">
          {tries.length === 0 && <p>Make a guess — you have 4 tries.</p>}

          {tries.length > 0 && (
            <ul className="tries">
              {tries.map((t, i) => (
                <li key={i} className={`try ${t.hint}`}>
                  <span className="val">{t.value}</span>
                  <span className="arrow">
                    {t.hint !== 'correct' && (
                      t.diff < 0 ? '↑' : '↓'
                    )}
                  </span>
                  <span className="hint">{t.hint}</span>
                </li>
              ))}
            </ul>
          )}

          {done && (
            <div className="reveal">
              <h3>Answer: {Math.abs(Number(event.year))} {Number(event.year) < 0 ? 'BCE' : 'AD'}</h3>
              <p>{event.explanation}</p>
              {mode === 'daily' ? (
                <button onClick={onNext} className="next-btn">Play more questions</button>
              ) : null}
            </div>
          )}
        </div>
      </section>
      <HowToPlayModal open={showHowTo} onClose={() => setShowHowTo(false)} />
      <button
        className="howto-btn-floating"
        type="button"
        onClick={() => setShowHowTo(true)}
        aria-label="How to Play"
      >
        ?
      </button>
    </div>
  )
}

// Countdown component for next daily event
function CountdownToNextDaily() {
  const [now, setNow] = React.useState(Date.now())
  React.useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])
  // Calculate ms until next UTC midnight
  const nextMidnight = new Date()
  nextMidnight.setUTCHours(24,0,0,0)
  const msLeft = nextMidnight - now
  const hours = Math.floor(msLeft / (1000*60*60))
  const mins = Math.floor((msLeft % (1000*60*60)) / (1000*60))
  const secs = Math.floor((msLeft % (1000*60)) / 1000)
  return <div style={{fontWeight:'normal',fontSize:'0.95em',marginTop:'0.25em'}}>Next daily event in {hours}h {mins}m {secs}s (UTC)</div>
}
