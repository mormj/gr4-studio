import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSession, getSession } from './sessionsApi';

describe('sessions api scheduler passthrough', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('includes scheduler_id when creating a session', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          session: {
            id: 'session-1',
            name: 'demo',
            state: 'stopped',
            scheduler_id: 'gr::scheduler::SimpleSingle',
            created_at: '2026-03-20T00:00:00.000Z',
            updated_at: '2026-03-20T00:00:00.000Z',
            last_error: null,
          },
        }),
        { status: 200 },
      ),
    );

    const result = await createSession({
      name: 'demo',
      grc: 'inline grc',
      scheduler_id: 'gr::scheduler::SimpleSingle',
    });

    expect(result.schedulerId).toBe('gr::scheduler::SimpleSingle');
    expect(fetchMock).toHaveBeenCalledWith(
      '/sessions',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          name: 'demo',
          grc: 'inline grc',
          scheduler_id: 'gr::scheduler::SimpleSingle',
        }),
      }),
    );
  });

  it('preserves scheduler_id on session responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 'session-1',
          name: 'demo',
          state: 'running',
          scheduler_id: 'gr::scheduler::SimpleMulti',
          created_at: '2026-03-20T00:00:00.000Z',
          updated_at: '2026-03-20T00:00:00.000Z',
          last_error: null,
        }),
        { status: 200 },
      ),
    );

    const result = await getSession('session-1');
    expect(result.schedulerId).toBe('gr::scheduler::SimpleMulti');
  });
});
