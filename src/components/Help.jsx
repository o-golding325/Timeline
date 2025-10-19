import React from 'react';

export default function Help() {
  return (
  <div className="help-page" role="main" aria-label="Help and About Timeliner" style={{maxWidth:600,margin:'2em auto',padding:'2em',background:'#fff',color:'#222',borderRadius:'12px',boxShadow:'0 2px 12px #0001'}}>
      <h1 tabIndex={0}>How to Play Timeliner</h1>
      <ul>
        <li>Each day, everyone gets the same <b>Primary Event of the Day</b> to guess.</li>
        <li>After the daily event, you can play more random events from our global history bank.</li>
        <li>Type your guess for the year, select BCE/AD, and submit. You have 4 tries per event.</li>
        <li>Hints will tell you if you are close or far from the correct year.</li>
        <li>Your daily streak and stats are tracked locally on your device.</li>
      </ul>
      <h2 tabIndex={0}>Accessibility</h2>
      <ul>
        <li>Fully keyboard accessible: tab to all controls, use Enter/Space to activate.</li>
        <li>Screen reader friendly: all important elements have ARIA labels.</li>
        <li>High-contrast color scheme for readability.</li>
      </ul>
      <h2 tabIndex={0}>About</h2>
      <p>Timeliner is a free, educational game for learning world history. All events are curated for global significance and copyright safety.</p>
      <p>For feedback or suggestions, contact the developer.</p>
    </div>
  );
}
