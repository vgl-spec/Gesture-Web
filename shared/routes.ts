import { z } from 'zod';
import { insertGestureSampleSchema, type GestureSample } from './schema';

export const api = {
  gestures: {
    list: {
      method: 'GET' as const,
      path: '/api/gestures',
      responses: {
        200: z.array(z.custom<GestureSample>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/gestures',
      input: insertGestureSampleSchema,
      responses: {
        201: z.custom<GestureSample>(),
        400: z.object({ message: z.string() }),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/gestures/:id',
      responses: {
        204: z.void(),
        404: z.object({ message: z.string() }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
