import { z } from 'zod';

// Same pattern as auth.schema.ts from Week 3.
// One schema per "shape of input a route accepts."

export const createProjectSchema = z.object({
  name: z
    .string({ required_error: 'Project name is required' })
    .min(2, 'Project name must be at least 2 characters')
    .max(100, 'Project name must be under 100 characters')
    .trim(),

  description: z
    .string()
    .max(500, 'Description must be under 500 characters')
    .trim()
    .optional(),   // .optional() means this field can be left out entirely
});

export const inviteMemberSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim(),

  // z.enum restricts the value to EXACTLY these 3 strings.
  // Notice 'owner' is NOT in this list — you cannot invite someone
  // as owner. There is only ever one owner: whoever created the project.
  role: z.enum(['admin', 'member', 'viewer'], {
    required_error: 'Role is required',
  }),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;