import { useEffect, useMemo, useRef, useState } from 'react';
import { LIVE_POLL_INTERVAL_MS, normalizeUpload } from './memorialUtils';

const readSupabaseRows = async ({ supabaseRestUrl, supabaseAnonKey }) => {
  if (!supabaseRestUrl || !supabaseAnonKey) {
    return [];
  }

  const response = await globalThis.fetch(supabaseRestUrl, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Supabase request failed: ${response.status}`);
  }

  return response.json();
};

const readFirebaseRows = async ({ firebaseRestUrl }) => {
  if (!firebaseRestUrl) {
    return [];
  }

  const response = await globalThis.fetch(firebaseRestUrl);

  if (!response.ok) {
    throw new Error(`Firebase request failed: ${response.status}`);
  }

  const data = await response.json();

  if (Array.isArray(data)) {
    return data;
  }

  return Object.entries(data || {}).map(([id, value]) => ({
    id,
    ...value,
  }));
};

export const useLiveTributes = ({
  enabled,
  provider,
  supabaseRestUrl,
  supabaseAnonKey,
  firebaseRestUrl,
  pollIntervalMs = LIVE_POLL_INTERVAL_MS,
  seedUploads = [],
}) => {
  const [uploads, setUploads] = useState(() =>
    seedUploads.map((upload, index) => normalizeUpload(upload, index))
  );
  const lastSignature = useRef('');

  useEffect(() => {
    if (!enabled || provider === 'none') {
      return undefined;
    }

    let cancelled = false;
    let timer = null;

    const poll = async () => {
      try {
        const rows =
          provider === 'firebase'
            ? await readFirebaseRows({ firebaseRestUrl })
            : await readSupabaseRows({ supabaseRestUrl, supabaseAnonKey });

        const normalized = rows.map((row, index) => normalizeUpload(row, index));
        const signature = normalized.map((row) => row.id).join('|');

        if (!cancelled && signature !== lastSignature.current) {
          lastSignature.current = signature;
          setUploads(normalized);
        }
      } catch {
        if (!cancelled) {
          setUploads((current) => current);
        }
      } finally {
        if (!cancelled) {
          timer = globalThis.setTimeout(poll, pollIntervalMs);
        }
      }
    };

    poll();

    return () => {
      cancelled = true;
      if (timer) {
        globalThis.clearTimeout(timer);
      }
    };
  }, [
    enabled,
    provider,
    supabaseRestUrl,
    supabaseAnonKey,
    firebaseRestUrl,
    pollIntervalMs,
  ]);

  return useMemo(() => uploads, [uploads]);
};
