import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AuthPanel({ onUser }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const signIn = async (e) => {
    e.preventDefault();
    setMessage('Sending magic link...');
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) setMessage('Error sending magic link');
    else setMessage('Check your email for the magic link');
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    onUser(null);
  };

  return (
    <div style={{ maxWidth: 420, margin: '1rem auto' }}>
      <form onSubmit={signIn}>
        <label htmlFor="email">Sign in with Email</label>
        <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
        <button type="submit">Send Sign-in Link</button>
      </form>
      <div>{message}</div>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
