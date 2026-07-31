const nodemailer = require('nodemailer');

const createTransporter = () => {
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

  // Fallback to Gmail if SMTP_GMAIL_USER and SMTP_GMAIL_PASS are provided
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
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; background-color: #121118; color: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid #2a2836;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #ff6b00; margin: 0; font-size: 24px;">SmartPitch AI</h2>
        <p style="color: #9a98a6; font-size: 14px; margin-top: 5px;">Password Reset Verification Code</p>
      </div>

      <div style="background-color: #1a1924; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 1px solid #363248;">
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #bbbaaa;">Your 6-digit OTP Code is:</p>
        <div style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #ff6b00; font-family: monospace;">${otp}</div>
        <p style="margin: 10px 0 0 0; font-size: 12px; color: #7a7886;">This code is valid for 10 minutes. Do not share it with anyone.</p>
      </div>

      <p style="font-size: 13px; color: #9a98a6; line-height: 1.5; text-align: center;">
        If you did not request a password reset, please ignore this email.
      </p>

      <div style="border-top: 1px solid #2a2836; margin-top: 25px; padding-top: 15px; text-align: center; font-size: 11px; color: #5a5866;">
        &copy; 2026 SmartPitch AI. All rights reserved.
      </div>
    </div>
  `;

  if (!transporter) {
    console.log('\n======================================================');
    console.log(`🔑 [DEV MODE OTP LOG] Password Reset OTP for ${toEmail}: ${otp}`);
    console.log('======================================================\n');
    return {
      sent: true,
      devMode: true,
      message: 'OTP generated successfully. (Dev mode: Check server logs or use the code on screen).'
    };
  }

  try {
    await transporter.sendMail({
      from: `"SmartPitch AI Support" <${process.env.SMTP_FROM || process.env.SMTP_USER || process.env.SMTP_GMAIL_USER}>`,
      to: toEmail,
      subject: `Your SmartPitch AI Password Reset OTP Code: ${otp}`,
      html: htmlContent
    });
    return { sent: true, devMode: false };
  } catch (err) {
    console.error('Error sending OTP email via nodemailer:', err);
    console.log(`🔑 [FALLBACK OTP LOG] Password Reset OTP for ${toEmail}: ${otp}`);
    return {
      sent: true,
      devMode: true,
      error: err.message,
      message: 'Email delivery encountered an issue; fallback OTP provided.'
    };
  }
};

module.exports = { sendOTPEmail };
