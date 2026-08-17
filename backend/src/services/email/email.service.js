const config = require('../../config/env');
const logger = require('../../utils/logger');
const GmailEmailProvider = require('./GmailEmailProvider');
const ConsoleEmailProvider = require('./ConsoleEmailProvider');

class EmailService {
  constructor() {
    this.provider = this.resolveProvider();
  }

  resolveProvider() {
    const providerName = (config.email.provider || '').toLowerCase();

    if (providerName === 'gmail') {
      if (
        config.email.googleClientId &&
        config.email.googleClientSecret &&
        config.email.googleRefreshToken
      ) {
        logger.info('[EmailService] Initialized with Gmail API provider');
        return new GmailEmailProvider();
      } else {
        logger.warn(
          '[EmailService] Gmail provider requested but OAuth2 credentials are incomplete. Falling back to Console provider.'
        );
        return new ConsoleEmailProvider();
      }
    }

    logger.info('[EmailService] Initialized with Console email provider');
    return new ConsoleEmailProvider();
  }

  /**
   * Send an OTP verification email to the user.
   * @param {Object} params
   * @param {string} params.to - Recipient email
   * @param {string} params.otp - 6-digit OTP
   * @param {number} [params.expiresInMinutes=5]
   * @param {string} [params.purpose='registration']
   * @returns {Promise<{ success: boolean, messageId?: string }>}
   */
  async sendOtpEmail({ to, otp, expiresInMinutes = 5, purpose = 'registration' }) {
    try {
      return await this.provider.sendVerificationEmail({
        to,
        otp,
        expiresInMinutes,
        purpose,
      });
    } catch (error) {
      logger.error(`[EmailService] Failed to send OTP email to ${to}:`, error.message);
      throw error;
    }
  }
}

const emailService = new EmailService();

module.exports = emailService;
