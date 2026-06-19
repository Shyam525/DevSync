import { z } from 'zod';

export const sendMessageBody = z.object({
  projectId: z.string().min(1),
  content: z.string().min(1),
  attachments: z.array(z.object({
    fileId: z.string().min(1),
    name: z.string().min(1),
  })).optional(),
});
