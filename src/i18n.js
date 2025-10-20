import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      title: 'Timeliner',
      subtitle: 'Guess the year — earlier or later',
      dailyStats: 'Daily Stats',
      streak: 'Streak',
      played: 'Played',
      correct: 'Correct',
      loading: 'Loading event...',
      loadingDesc: 'Please wait while we load the next event.',
      noEvents: 'No events found',
      noEventsDesc: 'Sorry, there are no events available. Please check your data source or try again later.',
      eventNotFound: 'Event not found',
      eventNotFoundDesc: "Sorry, we couldn't find the requested event. Please try the next event or reload the page.",
      guessLabel: 'Your guess (year)',
      guessBtn: 'Guess',
      newBtn: 'New',
      nextEvent: 'Next Event',
      feedbackPlaceholder: 'Let us know what you think or suggest an event!',
      sendFeedback: 'Send Feedback',
      thankYou: 'Thank you for your feedback!',
      signIn: 'Sign in with Email',
      sendSignIn: 'Send Sign-in Link',
      signOut: 'Sign Out',
      howToPlay: 'How to Play',
      primaryEvent: 'Primary Event of the Day',
      makeGuess: 'Make a guess — you have {{count}} tries.'
    }
  },
  // Add more languages here
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
