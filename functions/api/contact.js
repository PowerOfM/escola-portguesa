const VALID_GRADE_SLUGS = new Set([
  '01-pre-escola',
  '02-a1-basico-inicial',
  '03-a1-basico-emergente',
  '04-a1-basico-aplicado',
  '05-a1-intermediario',
  '06-a1-a2',
]);

export async function onRequestPost({ request, env }) {
  let formData;
  try {
    formData = await request.formData();
  } catch {
    return jsonResponse({ error: 'Invalid request.' }, 400);
  }

  // Honeypot: bots fill this hidden field, humans don't
  if (formData.get('_gotcha')) {
    return jsonResponse({ success: true });
  }

  // Turnstile verification
  const turnstileToken = formData.get('cf-turnstile-response');
  if (!turnstileToken) {
    return jsonResponse({ error: 'Please complete the security check.' }, 400);
  }
  const ip = request.headers.get('CF-Connecting-IP') ?? '';
  const turnstileOk = await verifyTurnstile(turnstileToken, ip, env.TURNSTILE_SECRET_KEY);
  if (!turnstileOk) {
    return jsonResponse({ error: 'Security check failed. Please try again.' }, 400);
  }

  // Extract fields
  const enrollmentType = (formData.get('enrollment-type') ?? '').toString();
  const parentName = (formData.get('parent-name') ?? '').toString().trim();
  const email = (formData.get('email') ?? '').toString().trim();
  const childName = (formData.get('child-name') ?? '').toString().trim();
  const childAgeRaw = (formData.get('child-age') ?? '').toString();
  const gradeLevel = (formData.get('grade-level') ?? '').toString().trim();
  const gradeTitle = (formData.get('grade-title') || gradeLevel).toString().trim();
  const message = (formData.get('message') ?? '').toString().trim();

  // Validate
  if (!['new', 'returning'].includes(enrollmentType)) {
    return jsonResponse({ error: 'Invalid enrollment type.' }, 400);
  }
  if (!parentName) {
    return jsonResponse({ error: 'Parent/Guardian name is required.' }, 400);
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse({ error: 'A valid email address is required.' }, 400);
  }
  if (!childName) {
    return jsonResponse({ error: "Child's name is required." }, 400);
  }
  const childAge = parseInt(childAgeRaw, 10);
  if (isNaN(childAge) || childAge < 3 || childAge > 18) {
    return jsonResponse({ error: "Child's age must be between 3 and 18." }, 400);
  }
  if (!VALID_GRADE_SLUGS.has(gradeLevel)) {
    return jsonResponse({ error: 'Please select a valid grade level.' }, 400);
  }

  // Send email
  const enrollmentLabel = enrollmentType === 'returning' ? 'Returning Student' : 'New Student';
  const html = buildEmailHtml({ enrollmentType, enrollmentLabel, parentName, email, childName, childAge, gradeTitle, message });

  const sent = await sendEmail({
    apiKey: env.RESEND_API_KEY,
    from: 'Escola Portuguesa Website <website@escolaportuguesayvr.ca>',
    to: 'admissions@escolaportuguesayvr.ca',
    replyTo: email,
    subject: `[${enrollmentLabel}] Enrollment Inquiry – ${childName}`,
    html,
  });

  if (!sent) {
    return jsonResponse(
      { error: 'Failed to send your message. Please try again or contact us directly at admissions@escolaportuguesayvr.ca.' },
      500
    );
  }

  return jsonResponse({ success: true });
}

async function verifyTurnstile(token, ip, secretKey) {
  const body = new URLSearchParams({ secret: secretKey, response: token, remoteip: ip });
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
  });
  const data = await res.json();
  return data.success === true;
}

async function sendEmail({ apiKey, from, to, replyTo, subject, html }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, reply_to: replyTo, subject, html }),
  });
  return res.ok;
}

function buildEmailHtml({ enrollmentType, enrollmentLabel, parentName, email, childName, childAge, gradeTitle, message }) {
  const typeBg = enrollmentType === 'returning' ? '#eff6ff' : '#f0fdf4';
  const typeColor = enrollmentType === 'returning' ? '#1d4ed8' : '#166534';

  const messageRow = message
    ? `<tr>
        <td style="padding:10px 12px;font-weight:600;color:#6b7280;vertical-align:top;width:140px">Message</td>
        <td style="padding:10px 12px;color:#111827;white-space:pre-wrap">${esc(message)}</td>
      </tr>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111827;background:#f9fafb;margin:0;padding:32px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
    <div style="background:#006600;padding:24px 32px">
      <p style="margin:0;font-size:12px;font-weight:600;letter-spacing:.05em;color:rgba(255,255,255,.7);text-transform:uppercase">Escola Portuguesa Nossa Senhora de Fátima</p>
      <h1 style="margin:8px 0 0;font-size:22px;color:#fff">New Enrollment Inquiry</h1>
    </div>
    <div style="padding:32px">
      <table style="width:100%;border-collapse:collapse;font-size:15px">
        <tr style="border-bottom:1px solid #e5e7eb">
          <td style="padding:10px 12px;font-weight:600;color:#6b7280;width:140px">Type</td>
          <td style="padding:10px 12px">
            <span style="background:${typeBg};color:${typeColor};padding:3px 10px;border-radius:20px;font-size:13px;font-weight:500">${esc(enrollmentLabel)}</span>
          </td>
        </tr>
        <tr style="border-bottom:1px solid #e5e7eb;background:#f9fafb">
          <td style="padding:10px 12px;font-weight:600;color:#6b7280">Parent/Guardian</td>
          <td style="padding:10px 12px;color:#111827">${esc(parentName)}</td>
        </tr>
        <tr style="border-bottom:1px solid #e5e7eb">
          <td style="padding:10px 12px;font-weight:600;color:#6b7280">Email</td>
          <td style="padding:10px 12px">
            <a href="mailto:${esc(email)}" style="color:#006600;text-decoration:none">${esc(email)}</a>
          </td>
        </tr>
        <tr style="border-bottom:1px solid #e5e7eb;background:#f9fafb">
          <td style="padding:10px 12px;font-weight:600;color:#6b7280">Child's Name</td>
          <td style="padding:10px 12px;color:#111827">${esc(childName)}</td>
        </tr>
        <tr style="border-bottom:1px solid #e5e7eb">
          <td style="padding:10px 12px;font-weight:600;color:#6b7280">Child's Age</td>
          <td style="padding:10px 12px;color:#111827">${childAge}</td>
        </tr>
        <tr style="border-bottom:${message ? '1px solid #e5e7eb' : 'none'};background:#f9fafb">
          <td style="padding:10px 12px;font-weight:600;color:#6b7280">Grade Level</td>
          <td style="padding:10px 12px;color:#111827">${esc(gradeTitle)}</td>
        </tr>
        ${messageRow}
      </table>
      <p style="margin:24px 0 0;font-size:13px;color:#9ca3af">Reply to this email to reach ${esc(parentName)} directly.</p>
    </div>
  </div>
</body>
</html>`;
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
