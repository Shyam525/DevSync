import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(2, 'Project name must be at least 2 characters')
    .max(100, 'Project name must be under 100 characters')
    .trim(),

  description: z
    .string()
    .max(500, 'Description must be under 500 characters')
    .trim()
    .optional(),
});

export const inviteMemberSchema = z.object({
  email: z
    .string()
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim(),

  role: z.enum(['admin', 'member', 'viewer']),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
