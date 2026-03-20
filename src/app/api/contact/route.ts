import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, phone, date, time, message, property, agentEmail, agentPhone } = body;

  const errors: string[] = [];

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

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: fromEmail, to: agentEmail, subject, html }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend error:', err);
      errors.push('email');
    }
  } else if (!resendKey) {
    console.warn('RESEND_API_KEY not set — email not sent');
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

    const params = new URLSearchParams({
      From: twilioFrom,
      To: agentPhone,
      Body: smsBody,
    });

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

    if (!res.ok) {
      const err = await res.text();
      console.error('Twilio error:', err);
      errors.push('sms');
    }
  } else if (!twilioSid || !twilioToken || !twilioFrom) {
    console.warn('Twilio env vars not set — SMS not sent');
  }

  if (errors.length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
