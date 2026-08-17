const axios = require('axios');
const EmailProvider = require('./EmailProvider');
const { generateOtpEmailContent } = require('./emailTemplate');
const logger = require('../../utils/logger');
const config = require('../../config/env');
const { AIServiceError } = require('../../utils/errors');

class GmailEmailProvider extends EmailProvider {
  constructor() {
    super();
    this.clientId = config.email.googleClientId;
    this.clientSecret = config.email.googleClientSecret;
    this.refreshToken = config.email.googleRefreshToken;
    this.senderEmail = config.email.senderEmail;
    this.senderName = config.email.senderName || 'DailyForge';

    this.cachedAccessToken = null;
    this.tokenExpiresAt = 0;
  }

  /**
   * Acquire or refresh the Google OAuth2 access token using the stored refresh token.
   * @returns {Promise<string>} Valid Google access token
   */
  async getAccessToken() {
    const now = Date.now();
    // Use cached token if valid for at least 60 more seconds
    if (this.cachedAccessToken && this.tokenExpiresAt > now + 60000) {
      return this.cachedAccessToken;
    }

    if (!this.clientId || !this.clientSecret || !this.refreshToken) {
      throw new Error(
        'Gmail OAuth2 credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN) are missing.'
      );
    }

    try {
      const response = await axios.post(
        'https://oauth2.googleapis.com/token',
        new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token',
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 10000,
        }
      );

      const { access_token, expires_in } = response.data;
      this.cachedAccessToken = access_token;
      this.tokenExpiresAt = now + (expires_in || 3600) * 1000;

      return this.cachedAccessToken;
    } catch (err) {
      logger.error('[GmailEmailProvider] Failed to obtain OAuth2 access token from Google:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      throw new Error('Google OAuth2 authentication failed. Please check Gmail configuration.');
    }
  }

  /**
   * Build a standard RFC 2822 multipart/alternative MIME message string.
   * @param {Object} params
   * @returns {string} Base64URL-encoded raw message
   */
  buildRawMimeMessage({ to, subject, plainText, html }) {
    const boundary = `DailyForgeBoundary_${Date.now().toString(16)}`;
    const fromHeader = `"${this.senderName}" <${this.senderEmail}>`;

    const mimeMessage = [
      `From: ${fromHeader}`,
      `To: ${to}`,
      `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: 7bit',
      '',
      plainText,
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: 7bit',
      '',
      html,
      '',
      `--${boundary}--`,
    ].join('\r\n');

    // Gmail API requires standard base64url encoding
    return Buffer.from(mimeMessage)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  /**
   * Send a verification email via the Gmail REST API (users.messages.send).
   * @param {Object} params
   * @param {string} params.to - Recipient email
   * @param {string} params.otp - 6-digit OTP
   * @param {number} params.expiresInMinutes
   * @param {string} params.purpose
   * @returns {Promise<{ success: boolean, messageId?: string }>}
   */
  async sendVerificationEmail({ to, otp, expiresInMinutes = 5, purpose = 'registration' }) {
    const { subject, plainText, html } = generateOtpEmailContent({
      to,
      otp,
      expiresInMinutes,
      purpose,
    });

    const accessToken = await this.getAccessToken();
    const raw = this.buildRawMimeMessage({ to, subject, plainText, html });

    try {
      const response = await axios.post(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
        { raw },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      const messageId = response.data?.id;
      logger.info(`[GmailEmailProvider] Successfully sent verification email to ${to}. MessageId: ${messageId}`);

      return {
        success: true,
        messageId,
      };
    } catch (err) {
      logger.error('[GmailEmailProvider] Failed to send email via Gmail API:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });

      throw new Error("We couldn't send the verification email. Please try again shortly.");
    }
  }
}

module.exports = GmailEmailProvider;
