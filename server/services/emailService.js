let nodemailer = null;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  console.warn("⚠️ Nodemailer optional import fallback:", e.message);
}

const createTransporter = () => {
  if (!nodemailer) return null;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  if (process.env.SMTP_GMAIL_USER && process.env.SMTP_GMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_GMAIL_USER,
        pass: process.env.SMTP_GMAIL_PASS
      }
    });
  }

  return null;
};

const sendOTPEmail = async (toEmail, otp) => {
  const transporter = createTransporter();

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; background-color: #0d0d12; color: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid rgba(255, 107, 53, 0.3);">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #FF6B35; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">SmartPitch AI</h2>
        <p style="color: #9a98a6; font-size: 14px; margin-top: 6px;">Password Reset Verification Code</p>
      </div>

      <div style="background-color: #16151f; padding: 24px; border-radius: 12px; text-align: center; margin: 24px 0; border: 1px solid rgba(255, 255, 255, 0.08);">
        <p style="margin: 0 0 12px 0; font-size: 14px; color: #d0ceee;">Your 6-digit OTP Code is:</p>
        <div style="font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #FF6B35; font-family: monospace;">${otp}</div>
        <p style="margin: 14px 0 0 0; font-size: 12px; color: #8a889b;">This code is valid for 10 minutes. Do not share it with anyone.</p>
      </div>

      <p style="font-size: 13px; color: #9a98a6; line-height: 1.5; text-align: center;">
        If you did not request a password reset for ${toEmail}, please ignore this message.
      </p>

      <div style="border-top: 1px solid rgba(255,255,255,0.08); margin-top: 28px; padding-top: 16px; text-align: center; font-size: 11px; color: #6a687a;">
        &copy; 2026 SmartPitch AI. All rights reserved.
      </div>
    </div>
  `;

  if (!transporter) {
    console.log(`🔑 [OTP LOG] Password Reset OTP generated for ${toEmail}: ${otp}`);
    return {
      sent: true,
      devMode: true,
      message: `OTP generated for ${toEmail}. Configure SMTP_GMAIL_USER and SMTP_GMAIL_PASS in .env to dispatch live emails.`
    };
  }

  try {
    const fromUser = process.env.SMTP_FROM || process.env.SMTP_USER || process.env.SMTP_GMAIL_USER;
    await transporter.sendMail({
      from: `"SmartPitch AI Support" <${fromUser}>`,
      to: toEmail,
      subject: `Your SmartPitch AI Verification OTP Code: ${otp}`,
      html: htmlContent
    });
    return { sent: true, devMode: false };
  } catch (err) {
    console.error('Error sending OTP email:', err.message);
    console.log(`🔑 [FALLBACK OTP LOG] OTP for ${toEmail}: ${otp}`);
    return {
      sent: true,
      devMode: true,
      error: err.message,
      message: 'OTP generated. Live mail delivery encountered an issue.'
    };
  }
};

module.exports = { sendOTPEmail };
