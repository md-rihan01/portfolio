import nodemailer from 'nodemailer';

const allowedOrigins = [
  'https://md-rihan01.github.io',
  'http://localhost',
  'http://127.0.0.1',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

const getJsonResponse = (status, body, origin = 'https://md-rihan01.github.io') => ({
  status,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  },
  body: JSON.stringify(body),
});

const isValidEmail = (value) => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
const isValidPhone = (value) => typeof value === 'string' && (value.trim() === '' || /^\+?[0-9\s().-]{7,20}$/.test(value.trim()));

const sanitize = (value) => typeof value === 'string' ? value.trim().replace(/[<>]/g, '') : '';

export default async function handler(request) {
  const origin = request.headers.get('origin');
  const method = request.method;

  if (origin && !allowedOrigins.includes(origin)) {
    return getJsonResponse(403, { error: 'Origin not allowed.' }, origin);
  }

  if (method === 'OPTIONS') {
    return {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin || 'https://md-rihan01.github.io',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    };
  }

  if (method !== 'POST') {
    return getJsonResponse(405, { error: 'Only POST requests are allowed.' });
  }

  const data = await request.json().catch(() => null);
  if (!data) {
    return getJsonResponse(400, { error: 'Invalid JSON payload.' });
  }

  const honeypot = sanitize(data.website || '');
  const name = sanitize(data.name || '');
  const email = sanitize(data.email || '');
  const phone = sanitize(data.phone || '');
  const subject = sanitize(data.subject || 'New message from portfolio contact form');
  const message = sanitize(data.message || '');

  if (honeypot) {
    return getJsonResponse(400, { error: 'Spam detected.' });
  }

  if (!name || name.length < 2) {
    return getJsonResponse(400, { error: 'Please provide your name.' });
  }

  if (!isValidEmail(email)) {
    return getJsonResponse(400, { error: 'Please provide a valid email address.' });
  }

  if (!isValidPhone(phone)) {
    return getJsonResponse(400, { error: 'Please provide a valid phone number or leave it blank.' });
  }

  if (!message || message.length < 10) {
    return getJsonResponse(400, { error: 'Please enter a message with at least 10 characters.' });
  }

  const startedAt = Number(data.formTimestamp || 0);
  if (startedAt && Date.now() - startedAt < 3000) {
    return getJsonResponse(429, { error: 'Please take a moment to complete the form before submitting.' });
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || '587');
  const smtpUser = process.env.SMTP_USERNAME;
  const smtpPass = process.env.SMTP_PASSWORD;
  const senderEmail = process.env.SENDER_EMAIL;
  const receiverEmail = process.env.RECEIVER_EMAIL;

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !senderEmail || !receiverEmail) {
    return getJsonResponse(500, { error: 'Email service is not configured.' });
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const mailOptions = {
    from: senderEmail,
    to: receiverEmail,
    subject,
    replyTo: email,
    text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\n\nMessage:\n${message}`,
    html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Phone:</strong> ${phone || 'Not provided'}</p><p><strong>Message:</strong><br>${message.replace(/\n/g, '<br>')}</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return getJsonResponse(200, { success: true, message: 'Message sent successfully.' });
  } catch (error) {
    console.error('Mail send error:', error);
    return getJsonResponse(502, { error: 'Unable to send email at this time. Please try again later.' });
  }
}
