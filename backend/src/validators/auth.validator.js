const { z } = require('zod');

const registerSchema = z.object({
  body: z
    .object({
      name: z.string().min(2, 'Name must be at least 2 characters').max(100),
      email: z.string().email('Invalid email address'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const sendOtpSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .min(3, 'Email is required')
      .max(255, 'Email is too long')
      .email('Please enter a valid email address'),
    purpose: z
      .enum(['registration', 'login', 'verification', 'reset_password'])
      .optional()
      .default('registration'),
  }),
});

const verifyOtpSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .email('Please enter a valid email address'),
    otp: z
      .string()
      .trim()
      .regex(/^\d{6}$/, 'Verification code must be exactly 6 digits'),
    purpose: z
      .enum(['registration', 'login', 'verification', 'reset_password'])
      .optional()
      .default('registration'),
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100)
      .optional(),
  }),
});

const resendOtpSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .email('Please enter a valid email address'),
    purpose: z
      .enum(['registration', 'login', 'verification', 'reset_password'])
      .optional()
      .default('registration'),
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  sendOtpSchema,
  verifyOtpSchema,
  resendOtpSchema,
};
