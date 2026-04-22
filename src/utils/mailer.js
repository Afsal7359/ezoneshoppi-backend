import nodemailer from 'nodemailer';

let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;
  _transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS, // Gmail App Password
    },
  });
  return _transporter;
}

export async function sendOtpEmail(to, otp, siteName = 'ezoneshoppi') {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `${siteName} <noreply@ezoneshoppi.com>`,
    to,
    subject: `${otp} is your ${siteName} verification code`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:16px;border:1px solid #e5e7eb">
        <h2 style="margin:0 0 8px;font-size:22px;color:#111827">${siteName}</h2>
        <p style="margin:0 0 24px;color:#6b7280;font-size:15px">Your verification code is:</p>
        <div style="letter-spacing:10px;font-size:40px;font-weight:800;color:#2563eb;text-align:center;padding:24px 0;background:#eff6ff;border-radius:12px">
          ${otp}
        </div>
        <p style="margin:20px 0 0;color:#6b7280;font-size:13px;text-align:center">
          This code expires in <strong>10 minutes</strong>. Do not share it with anyone.
        </p>
      </div>
    `,
  });
}
