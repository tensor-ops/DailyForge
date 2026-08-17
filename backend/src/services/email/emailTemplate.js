/**
 * Generate standard HTML and Plain Text templates for DailyForge OTP verification emails.
 * Uses bulletproof table layout compatible with Gmail, Apple Mail, Outlook, etc.
 */

function generateOtpEmailContent({ to, otp, expiresInMinutes = 5, purpose = 'registration' }) {
  const subject = 'Your DailyForge verification code';
  
  const purposeText = {
    registration: 'Welcome to DailyForge! Verify your email address to complete your registration.',
    login: 'Use the verification code below to sign in to your DailyForge account.',
    verification: 'Use the verification code below to verify your email address.',
    reset_password: 'Use the verification code below to reset your DailyForge password.',
  }[purpose] || 'Use the verification code below to complete authentication.';

  const plainText = `DailyForge

Verify your email

${purposeText}

Your verification code is:
${otp}

This code expires in ${expiresInMinutes} minutes.

If you didn't request this code, you can safely ignore this email.

— DailyForge Consistency Operating System
`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DailyForge Verification Code</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0F172A;
      -webkit-font-smoothing: antialiased;
    }
    .email-container {
      max-width: 520px;
      margin: 40px auto;
      background-color: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
    }
    .header {
      padding: 32px 36px 20px 36px;
      background: linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%);
      border-bottom: 1px solid #F1F5F9;
    }
    .logo-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .logo-text {
      font-size: 20px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #0F172A;
    }
    .logo-text span {
      color: #F97316;
    }
    .content {
      padding: 32px 36px;
    }
    .title {
      font-size: 22px;
      font-weight: 800;
      color: #0F172A;
      margin: 0 0 8px 0;
      letter-spacing: -0.3px;
    }
    .description {
      font-size: 14px;
      line-height: 1.6;
      color: #475569;
      margin: 0 0 24px 0;
    }
    .otp-box {
      background-color: #F1F5F9;
      border: 1px solid #CBD5E1;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      margin-bottom: 24px;
    }
    .otp-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #64748B;
      margin-bottom: 8px;
    }
    .otp-code {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
      font-size: 36px;
      font-weight: 900;
      letter-spacing: 8px;
      color: #0F172A;
      margin: 0;
    }
    .expiry-note {
      font-size: 13px;
      color: #64748B;
      line-height: 1.5;
      margin: 0 0 16px 0;
    }
    .security-note {
      font-size: 12px;
      color: #94A3B8;
      line-height: 1.5;
      padding-top: 20px;
      border-top: 1px solid #F1F5F9;
      margin: 0;
    }
    .footer {
      padding: 20px 36px;
      background-color: #F8FAFC;
      border-top: 1px solid #F1F5F9;
      text-align: center;
      font-size: 12px;
      color: #94A3B8;
    }
  </style>
</head>
<body>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding: 20px;">
        <div class="email-container">
          <div class="header">
            <div class="logo-text">DAILY<span>FORGE</span></div>
          </div>
          <div class="content">
            <h1 class="title">Verify your email</h1>
            <p class="description">${purposeText}</p>
            
            <div class="otp-box">
              <div class="otp-label">Verification Code</div>
              <div class="otp-code">${otp}</div>
            </div>

            <p class="expiry-note">
              ⏱️ This code will expire in <strong>${expiresInMinutes} minutes</strong>.
            </p>

            <p class="security-note">
              If you did not request this verification code, no action is needed. Your DailyForge account remains secure.
            </p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} DailyForge. Habit & Consistency Operating System.
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return {
    subject,
    plainText,
    html,
  };
}

module.exports = {
  generateOtpEmailContent,
};
