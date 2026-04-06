import { z } from 'zod';
import { ApiClientError, jsonRequest } from './client';
import {
  schedulerListResponseSchema,
  schedulerResponseSchema,
  type SchedulerDto,
  type SchedulerListResponseDto,
} from '../dto/schedulers';

export type SchedulerCatalogItem = {
  id: string;
};

function parseOrThrow<T>(schema: z.ZodSchema<T>, payload: unknown, context: string): T {
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    const details = parsed.error.issues
      ?.map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`)
      .join('; ');
    throw new ApiClientError(`Schedulers API schema mismatch (${context})`, 'PARSE', undefined, details);
  }
  return parsed.data;
}

function normalizeItems(response: SchedulerListResponseDto): SchedulerDto[] {
  if (Array.isArray(response)) {
    return response;
  }

  return response.schedulers;
}

function mapScheduler(dto: SchedulerDto): SchedulerCatalogItem {
  return {
    id: dto.id,
  };
}

export async function getSchedulers(): Promise<SchedulerCatalogItem[]> {
  const payload = await jsonRequest<unknown>({
    path: '/schedulers',
    method: 'GET',
  });

  const parsed = parseOrThrow(schedulerListResponseSchema, payload, 'list-schedulers');
  return normalizeItems(parsed).map(mapScheduler);
}

export async function getScheduler(schedulerId: string): Promise<SchedulerCatalogItem> {
  const payload = await jsonRequest<unknown>({
    path: `/schedulers/${encodeURIComponent(schedulerId)}`,
    method: 'GET',
  });

  const parsed = parseOrThrow(schedulerResponseSchema, payload, 'get-scheduler');
  const nested = (parsed as { scheduler?: SchedulerDto }).scheduler;
  return mapScheduler(nested ?? (parsed as SchedulerDto));
}
