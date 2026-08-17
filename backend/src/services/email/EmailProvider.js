/**
 * Abstract Base Class for Email Providers.
 * Allows swapping between Gmail API, Console (dev), Resend, SendGrid, SES, etc.
 */
class EmailProvider {
  /**
   * Send a 6-digit OTP verification email.
   * @param {Object} params
   * @param {string} params.to - Recipient email
   * @param {string} params.otp - 6-digit verification code
   * @param {number} params.expiresInMinutes - Code expiration in minutes
   * @param {string} [params.purpose] - 'registration' | 'login' | 'verification'
   * @returns {Promise<{ success: boolean, messageId?: string }>}
   */
  async sendVerificationEmail(params) {
    throw new Error('sendVerificationEmail must be implemented by EmailProvider subclass');
  }
}

module.exports = EmailProvider;
