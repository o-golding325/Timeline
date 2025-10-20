import './App.css';
import Game from './components/Game';
import Help from './components/Help';
import Privacy from './components/Privacy';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import AdminPage from './pages/admin.jsx';

function App() {
  return (
    <BrowserRouter>
      <div id="app-root">
        <header className="app-header">
          <h1>Timeliner</h1>
          <p className="tag">Guess the year — earlier or later</p>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Game />} />
            <Route path="/help" element={<Help />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>

        <footer className="app-footer" style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'0.5em'}}>
          <nav style={{marginBottom:'0.2em'}}>
            <Link to="/" aria-label="Play" style={{marginRight:'1em'}}>Play</Link>
            <Link to="/help" aria-label="Help and About" style={{marginRight:'1em'}}>Help/About</Link>
            <Link to="/privacy" aria-label="Privacy Notice">Privacy</Link>
          </nav>
          <small>Built with Vite + React — deploy to Vercel or Netlify</small>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
