import { z } from 'zod';

export const popupSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string(),
  status: z.enum(['active', 'inactive']),
  trigger: z.enum(['on_page_load', 'on_scroll', 'on_click']),
  duration: z.number().min(1).max(60),
  position: z.enum(['center', 'top', 'bottom', 'left', 'right']),
  animation: z.enum(['fade', 'slide', 'bounce']),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  buttonColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  buttonTextColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  cookieDuration: z.number().min(1).max(720),
  isDismissable: z.boolean(),
  showCloseButton: z.boolean(),
  zIndex: z.number().min(1000).max(9999),
});

export type Popup = z.infer<typeof popupSchema>;

export const metricsSchema = z.object({
  impressions: z.number().min(0),
  clicks: z.number().min(0),
  conversionRate: z.number().min(0).max(100),
  lastUpdated: z.date(),
});

export type Metrics = z.infer<typeof metricsSchema>;

export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sort: z.enum(['created_at', 'updated_at', 'title']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export type Pagination = z.infer<typeof paginationSchema>;

export const searchSchema = z.object({
  q: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export type SearchParams = z.infer<typeof searchSchema>;
