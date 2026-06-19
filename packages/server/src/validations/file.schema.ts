import { z } from 'zod';

export const uploadFileParams = z.object({
  projectId: z.string().min(1),
});
