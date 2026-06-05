export interface Env {
  DB: D1Database;
  ALLOWED_ORIGIN?: string;
}

type ReadingInsert = {
  heartRate: number;
  temperature: number;
  ts?: number; // unix ms
  source?: string;
};

function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(data), { ...init, headers });
}

function getCorsHeaders(request: Request, env: Env): Record<string, string> {
  const requestOrigin = request.headers.get('Origin') ?? '';
  const allowed = (env.ALLOWED_ORIGIN ?? '').trim();

  const origin = allowed.length > 0 ? allowed : requestOrigin;

  return {
    'access-control-allow-origin': origin.length > 0 ? origin : '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '86400',
    'vary': 'Origin',
  };
}

function withCors(response: Response, cors: Record<string, string>): Response {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(cors)) headers.set(k, v);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const cors = getCorsHeaders(request, env);

    if (request.method === 'OPTIONS') {
      return withCors(new Response(null, { status: 204 }), cors);
    }

    const url = new URL(request.url);

    if (url.pathname === '/health') {
      return withCors(json({ ok: true }), cors);
    }

    if (url.pathname === '/api/readings' && request.method === 'POST') {
      let body: ReadingInsert;
      try {
        body = await request.json();
      } catch {
        return withCors(json({ error: 'Invalid JSON' }, { status: 400 }), cors);
      }

      const heartRate = body.heartRate;
      const temperature = body.temperature;
      const ts = isFiniteNumber(body.ts) ? Math.trunc(body.ts) : Date.now();
      const source = (body.source ?? 'web').slice(0, 32);

      if (!isFiniteNumber(heartRate) || !isFiniteNumber(temperature)) {
        return withCors(json({ error: 'heartRate and temperature must be numbers' }, { status: 400 }), cors);
      }

      const hr = Math.trunc(heartRate);
      if (hr < 0 || hr > 400) {
        return withCors(json({ error: 'heartRate out of range' }, { status: 400 }), cors);
      }
      if (temperature < -50 || temperature > 100) {
        return withCors(json({ error: 'temperature out of range' }, { status: 400 }), cors);
      }

      await env.DB.prepare(
        'INSERT INTO sensor_readings (ts, heart_rate, temperature, source) VALUES (?1, ?2, ?3, ?4)'
      )
        .bind(ts, hr, temperature, source)
        .run();

      return withCors(json({ ok: true }), cors);
    }

    if (url.pathname === '/api/readings' && request.method === 'GET') {
      const limitRaw = url.searchParams.get('limit') ?? '100';
      const limit = Math.max(1, Math.min(500, Number.parseInt(limitRaw, 10) || 100));

      const result = await env.DB.prepare(
        'SELECT ts, heart_rate as heartRate, temperature FROM sensor_readings ORDER BY ts DESC LIMIT ?1'
      )
        .bind(limit)
        .all<{ ts: number; heartRate: number; temperature: number }>();

      return withCors(json({ readings: result.results }), cors);
    }

    return withCors(json({ error: 'Not found' }, { status: 404 }), cors);
  },
};
