import React from 'react';

export default function Privacy() {
  return (
    <div className="privacy-page" role="main" aria-label="Privacy Notice for Timeliner" style={{maxWidth:600,margin:'2em auto',padding:'2em',background:'#fff',borderRadius:'12px',boxShadow:'0 2px 12px #0001'}}>
      <h1 tabIndex={0}>Privacy Notice</h1>
      <p>Timeliner does not collect or store any personal data on our servers.</p>
      <ul>
        <li>Your game progress and stats are stored locally in your browser (localStorage).</li>
        <li>No account or login is required.</li>
        <li>No cookies or tracking scripts are used.</li>
        <li>If a global leaderboard is added in the future, you will be able to opt in and choose a display name.</li>
      </ul>
      <p>If you have privacy concerns or questions, please contact the developer.</p>
    </div>
  );
}
