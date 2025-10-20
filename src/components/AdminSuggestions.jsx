import React, { useEffect, useState } from 'react';

export default function AdminSuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/suggestions')
      .then(res => res.json())
      .then(setSuggestions)
      .catch(() => setError('Failed to load suggestions.'))
      .finally(() => setLoading(false));
  }, []);

  const handleStatus = async (id, status) => {
    try {
      await fetch('/api/suggestions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      setSuggestions(suggestions => suggestions.map(s => s.id === id ? { ...s, status } : s));
    } catch {
      setError('Failed to update status.');
    }
  };

  if (loading) return <div>Loading suggestions...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <h2>Event Suggestions (Admin)</h2>
      {suggestions.length === 0 && <p>No suggestions yet.</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {suggestions.map(s => (
          <li key={s.id} style={{ background: '#1a2332', color: '#e6eef8', margin: '1em 0', padding: '1em', borderRadius: 8 }}>
            <div><b>Feedback:</b> {s.feedback}</div>
            <div><b>Status:</b> {s.status}</div>
            <div><b>Submitted:</b> {new Date(s.created).toLocaleString()}</div>
            <button onClick={() => handleStatus(s.id, 'approved')} disabled={s.status === 'approved'}>Approve</button>
            <button onClick={() => handleStatus(s.id, 'rejected')} disabled={s.status === 'rejected'} style={{ marginLeft: 8 }}>Reject</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
