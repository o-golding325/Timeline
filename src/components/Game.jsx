import React, { useState } from 'react'
import { getDailyIndex, getNextUnusedIndex, getEvents } from './QuestionBank'
import '../App.css'
import FeedbackForm from './FeedbackForm'
import AuthPanel from './AuthPanel'
import { supabase } from '../lib/supabaseClient'
import { getUserStats, saveUserStats } from '../lib/statsSync'


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
    <div className="daily-stats-bar">
      <b>Daily Stats:</b> Streak: {stats.streak} | Played: {stats.total} | Correct: {stats.correct}
    </div>
  )
}

export default function Game() {
  const [user, setUser] = useState(null)
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
  const [loading, setLoading] = useState(true);
  const [guess, setGuess] = useState('')
  const [era, setEra] = useState('AD') // 'AD' or 'BCE'
  const [showHowTo, setShowHowTo] = useState(false)
  const [tries, setTries] = useState([])
  const [done, setDone] = useState(false)

  // Load events and index on mount and when used changes
  React.useEffect(() => {
    let isMounted = true;
    setLoading(true);
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
      setLoading(false);
    }
    loadAll();
    return () => { isMounted = false; };
  }, [used]);

  // Supabase auth listener and load user stats
  React.useEffect(() => {
    const session = supabase.auth.getSession().then(r => {
      if (r?.data?.session?.user) setUser(r.data.session.user)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user)
        // load user stats
        (async () => {
          const s = await getUserStats(session.user.id)
          if (s) {
            setDailyStats(s)
          }
        })()
      } else setUser(null)
    })
    return () => listener?.subscription?.unsubscribe()
  }, [])

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

  // Guard: If loading or missing event, show loading or error
  if (loading) {
    return (
      <div className="game">
        <DailyStats />
        <section className="prompt">
          <h2>Loading event...</h2>
          <p>Please wait while we load the next event.</p>
        </section>
      </div>
    );
  }
  if (!events || events.length === 0) {
    return (
      <div className="game">
        <DailyStats />
        <section className="prompt">
          <h2>No events found</h2>
          <p>Sorry, there are no events available. Please check your data source or try again later.</p>
        </section>
      </div>
    );
  }
  if (index === null || !events[index]) {
    return (
      <div className="game">
        <DailyStats />
        <section className="prompt">
          <h2>Event not found</h2>
          <p>Sorry, we couldn't find the requested event. Please try the next event or reload the page.</p>
        </section>
      </div>
    );
  }

  const event = events[index];

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
    if (absDiff === 0 || next.length >= 6) setDone(true)
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
        // save to user account if signed in
        if (user) saveUserStats(user.id, stats)
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
          <img src={event.image} alt={event.title || 'Event image'} className="event-image" />
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
              style={{ minWidth: '3.5em', fontWeight: 'bold', border: '1px solid #274B4A', borderRadius: '6px', background: '#fff', color: '#222', cursor: 'pointer' }}
              tabIndex={0}
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
          {tries.length === 0 && <p>Make a guess — you have 6 tries.</p>}

          {tries.length > 0 && (
            <ul className="tries">
              {tries.map((t, i) => {
                let hintEmoji = '';
                if (t.hint === 'freezing') hintEmoji = '🧊';
                else if (t.hint === 'cold') hintEmoji = '💨';
                else if (t.hint === 'hot') hintEmoji = '☀️';
                else if (t.hint === 'boiling') hintEmoji = '🔥';
                return (
                  <li key={i} className={`try ${t.hint}`}>
                    <span className="val">{Math.abs(t.value)} {t.value < 0 ? 'BCE' : 'AD'}</span>
                    <span className="arrow" style={{ margin: '0 0.5em' }}>
                      {t.hint !== 'correct' && (
                        t.diff < 0 ? '↑' : t.diff > 0 ? '↓' : ''
                      )}
                    </span>
                    <span className="hint" style={{ marginLeft: '0.5em' }}>
                      {t.hint !== 'correct' ? `${t.hint} ${hintEmoji}` : ''}
                      {t.hint === 'correct' && (
                        <span style={{ color: '#27ae60', marginLeft: '0.5em', fontWeight: 'bold' }}>
                          &#10003; Correct
                        </span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          {done && (
            <div className="reveal">
              <h3>Answer: {Math.abs(Number(event.year))} {Number(event.year) < 0 ? 'BCE' : 'AD'}</h3>
              <p>{event.explanation}</p>
              <button onClick={onNext} className="next-btn">Next Event</button>
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
        tabIndex={0}
      >
        ?
      </button>
      <FeedbackForm />
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
