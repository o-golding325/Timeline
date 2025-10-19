import './App.css'
import Game from './components/Game'
import Help from './components/Help'
import Privacy from './components/Privacy'
import { useState } from 'react'


function App() {
  const [page, setPage] = useState('game')
  let content
  if (page === 'help') content = <Help />
  else if (page === 'privacy') content = <Privacy />
  else content = <Game />
  return (
    <div id="app-root">
      <header className="app-header">
        <h1>Timeliner</h1>
        <p className="tag">Guess the year — earlier or later</p>
      </header>

      <main>
        {content}
      </main>

      <footer className="app-footer" style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'0.5em'}}>
        <nav style={{marginBottom:'0.2em'}}>
          <button onClick={()=>setPage('game')} aria-label="Play" style={{marginRight:'1em'}}>Play</button>
          <button onClick={()=>setPage('help')} aria-label="Help and About" style={{marginRight:'1em'}}>Help/About</button>
          <button onClick={()=>setPage('privacy')} aria-label="Privacy Notice">Privacy</button>
        </nav>
        <small>Built with Vite + React — deploy to Vercel or Netlify</small>
      </footer>
    </div>
  )
}

export default App
