import { z } from 'zod';

export const paginationQuery = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const mongoIdParam = z.object({
  id: z.string().length(24),
});

export const dateRangeQuery = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
