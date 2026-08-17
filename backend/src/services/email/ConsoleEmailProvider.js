const EmailProvider = require('./EmailProvider');
const logger = require('../../utils/logger');
const config = require('../../config/env');

class ConsoleEmailProvider extends EmailProvider {
  constructor() {
    super();
    if (config.env === 'production') {
      logger.warn('[ConsoleEmailProvider] Warning: Console email provider is active in production environment.');
    }
  }

  async sendVerificationEmail({ to, otp, expiresInMinutes = 5, purpose = 'registration' }) {
    const timestamp = new Date().toISOString();
    
    // In development / testing, print a clear console banner for local DX
    if (config.env !== 'production') {
      console.log('\n' + '='.repeat(60));
      console.log('📧 [DAILYFORGE EMAIL DISPATCH - DEV CONSOLE PROVIDER]');
      console.log('='.repeat(60));
      console.log(`To:          ${to}`);
      console.log(`Purpose:     ${purpose}`);
      console.log(`OTP Code:    ${otp}`);
      console.log(`Expires In:  ${expiresInMinutes} minutes`);
      console.log(`Timestamp:   ${timestamp}`);
      console.log('='.repeat(60) + '\n');
    } else {
      logger.info(`[ConsoleEmailProvider] Mock email dispatched to ${to} (OTP masked)`);
    }

    return {
      success: true,
      messageId: `console-msg-${Date.now()}`,
    };
  }
}

module.exports = ConsoleEmailProvider;
