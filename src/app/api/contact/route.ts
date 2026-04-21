import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function saveSubmission(data: Record<string, string>) {
  try {
    const dir = path.join(process.cwd(), 'data');
    const file = path.join(dir, 'submissions.json');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const existing = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf-8')) : [];
    existing.push({ ...data, receivedAt: new Date().toISOString() });
    fs.writeFileSync(file, JSON.stringify(existing, null, 2));
  } catch (err) {
    console.error('Failed to save submission locally:', err);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, phone, date, time, message, property, agentEmail, agentPhone } = body;

  // Always save locally first — no lead is ever lost
  saveSubmission({ name, email, phone, date, time, message, property, agentEmail, agentPhone });

  // ── Email via Resend ────────────────────────────────────────────────────────
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'showings@yourdomain.com';

  if (resendKey && agentEmail) {
    const subject = `Showing Request — ${property}`;
    const html = `
      <h2 style="color:#1a2744">New Showing Request</h2>
      <p><strong>Property:</strong> ${property}</p>
      <hr/>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
      <p><strong>Email:</strong> ${email}</p>
      ${date ? `<p><strong>Preferred Date:</strong> ${date}</p>` : ''}
      ${time ? `<p><strong>Preferred Time:</strong> ${time}</p>` : ''}
      ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
    `;

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from: fromEmail, to: agentEmail, subject, html }),
      });
      if (!res.ok) console.error('Resend error:', await res.text());
    } catch (err) {
      console.error('Resend fetch failed:', err);
    }
  }

  // ── SMS via Twilio ──────────────────────────────────────────────────────────
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_FROM_PHONE;

  if (twilioSid && twilioToken && twilioFrom && agentPhone) {
    const smsBody =
      `Showing Request — ${property}\n` +
      `Name: ${name}\n` +
      `Phone: ${phone || 'N/A'}\n` +
      `Email: ${email}`;

    const params = new URLSearchParams({ From: twilioFrom, To: agentPhone, Body: smsBody });

    try {
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        },
      );
      if (!res.ok) console.error('Twilio error:', await res.text());
    } catch (err) {
      console.error('Twilio fetch failed:', err);
    }
  }

  // Always return success — submission is saved locally even if email/SMS fail
  return NextResponse.json({ ok: true });
}
