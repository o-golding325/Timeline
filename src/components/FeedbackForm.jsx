import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function FeedbackForm({ t, onSubmit }) {
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (feedback.trim().length === 0) return;
    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback })
      });
      if (!res.ok) throw new Error('Failed to submit');
      setSubmitted(true);
      if (onSubmit) onSubmit(feedback);
    } catch (err) {
      setError('Could not send feedback. Please try again later.');
    }
  };

  if (submitted) {
    return <div className="feedback-success">Thank you for your feedback!</div>;
  }

  return (
    <form className="feedback-form" onSubmit={handleSubmit}>
      <label htmlFor="feedback">{t ? t('feedbackLabel', 'Feedback or Suggestions:') : 'Feedback or Suggestions:'}</label>
      <textarea
        id="feedback"
        value={feedback}
        onChange={e => setFeedback(e.target.value)}
        rows={3}
  placeholder={t ? t('feedbackPlaceholder') : 'Let us know what you think or suggest an event!'}
        required
      />
      <button type="submit">{t ? t('sendFeedback') : 'Send Feedback'}</button>
      {error && <div className="feedback-error">{error}</div>}
    </form>
  );
}
