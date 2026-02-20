import { z } from 'zod';

export const userIdSchema = z.object({
  id: z.coerce
    .number()
    .int('User id must be an integer')
    .positive('User id must be a positive integer'),
});

export const updateUserSchema = z
  .object({
    name: z
      .string()
      .min(3, 'Name must be at least 3 characters long')
      .max(255)
      .trim()
      .optional(),
    email: z.string().email('Invalid email address').max(255).trim().toLowerCase().optional(),
    password: z.string().min(6).max(255).optional(),
    role: z.enum(['user', 'admin']).optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'At least one field is required to update',
  });
