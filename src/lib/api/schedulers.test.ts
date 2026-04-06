import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiClientError } from './client';
import { getScheduler, getSchedulers } from './schedulers';

describe('schedulers api', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('requests the scheduler catalog and preserves ids exactly', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ schedulers: [{ id: 'gr::scheduler::SimpleSingle' }] }), {
        status: 200,
      }),
    );

    const result = await getSchedulers();

    expect(result).toEqual([{ id: 'gr::scheduler::SimpleSingle' }]);
    expect(fetchMock).toHaveBeenCalledWith(
      '/schedulers',
      expect.objectContaining({
        method: 'GET',
      }),
    );
  });

  it('requests an individual scheduler by exact id', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ scheduler: { id: 'gr::scheduler::SimpleMulti' } }), {
        status: 200,
      }),
    );

    const result = await getScheduler('gr::scheduler::SimpleMulti');

    expect(result).toEqual({ id: 'gr::scheduler::SimpleMulti' });
    expect(fetchMock).toHaveBeenCalledWith(
      '/schedulers/gr%3A%3Ascheduler%3A%3ASimpleMulti',
      expect.objectContaining({
        method: 'GET',
      }),
    );
  });

  it('rejects malformed scheduler payloads', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ schedulers: [{}] }), { status: 200 }));

    await expect(getSchedulers()).rejects.toBeInstanceOf(ApiClientError);
  });
});
