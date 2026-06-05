export type D1Reading = {
  ts: number; // unix epoch ms
  heartRate: number;
  temperature: number;
};

const baseUrl = (import.meta.env.VITE_D1_API_URL as string | undefined)?.trim();

function getEndpoint(path: string): string {
  if (!baseUrl) throw new Error('VITE_D1_API_URL is not set');
  return new URL(path, baseUrl).toString();
}

export function isD1Configured(): boolean {
  return Boolean(baseUrl);
}

export async function saveReadingToD1(reading: {
  heartRate: number;
  temperature: number;
  ts: number;
  source?: string;
}): Promise<void> {
  if (!baseUrl) return;

  const res = await fetch(getEndpoint('/api/readings'), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(reading),
  });

  if (!res.ok) {
    // Avoid throwing in the UI loop; surface in console
    const text = await res.text().catch(() => '');
    throw new Error(`D1 save failed (${res.status}): ${text}`);
  }
}

export async function fetchReadingsFromD1(limit = 100): Promise<D1Reading[]> {
  if (!baseUrl) return [];

  const url = new URL(getEndpoint('/api/readings'));
  url.searchParams.set('limit', String(limit));

  const res = await fetch(url.toString(), { method: 'GET' });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`D1 fetch failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as { readings?: D1Reading[] };
  return Array.isArray(data.readings) ? data.readings : [];
}
