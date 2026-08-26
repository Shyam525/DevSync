import { z } from 'zod';

export const createProjectBody = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const inviteMemberBody = z.object({
  githubUsername: z.string().min(1),
  role: z.enum(['owner', 'admin', 'member', 'viewer']),
});
