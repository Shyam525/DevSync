import { z } from 'zod';

export const createCardSchema = z.object({
  title: z
    .string({ required_error: 'Card title is required' })
    .min(1)
    .max(200)
    .trim(),
  description: z.string().max(2000).trim().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

export const updateCardSchema = z.object({
  title: z.string().min(1).max(200).trim().optional(),
  description: z.string().max(2000).trim().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

// Used by BOTH the REST /move route (Step 3) and validated again
// implicitly by the socket handler (Step 7) — same shape either way.
export const moveCardSchema = z.object({
  cardId: z.string({ required_error: 'cardId is required' }),
  fromColumnId: z.string({ required_error: 'fromColumnId is required' }),
  toColumnId: z.string({ required_error: 'toColumnId is required' }),
  newOrder: z.number({ required_error: 'newOrder is required' }).int().min(0),
});

export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
export type MoveCardInput = z.infer<typeof moveCardSchema>;