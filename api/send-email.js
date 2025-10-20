import sgMail from '@sendgrid/mail';

export async function sendSuggestionEmail(feedback) {
  if (!process.env.SENDGRID_API_KEY || !process.env.ADMIN_EMAIL) {
    console.warn('SendGrid API key or admin email not set. Skipping email.');
    return;
  }
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to: process.env.ADMIN_EMAIL,
    from: process.env.ADMIN_EMAIL, // or a verified sender
    subject: 'New Timeline Event Suggestion',
    text: `A new suggestion was submitted:\n\n${feedback}`,
    html: `<p>A new suggestion was submitted:</p><blockquote>${feedback}</blockquote>`
  };
  try {
    await sgMail.send(msg);
  } catch (err) {
    console.error('Failed to send email:', err);
  }
}
