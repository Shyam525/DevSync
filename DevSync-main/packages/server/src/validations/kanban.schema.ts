import { z } from 'zod';

export const createCardBody = z.object({
  title: z.string().min(1),
  columnId: z.string().optional(),
});

export const moveCardBody = z.object({
  cardId: z.string().min(1),
  targetColumnId: z.string().min(1),
  position: z.number().min(0),
});
