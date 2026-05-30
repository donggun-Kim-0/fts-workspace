'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getMasterConfigFormOptions,
  type MasterConfigFormOptions,
} from '@/lib/api/master-config';

let cachedOptions: MasterConfigFormOptions | null = null;
let cacheExpiresAt = 0;
const CACHE_TTL_MS = 60_000;

async function loadFormOptions(force = false): Promise<MasterConfigFormOptions> {
  const now = Date.now();
  if (!force && cachedOptions && now < cacheExpiresAt) {
    return cachedOptions;
  }
  const data = await getMasterConfigFormOptions();
  cachedOptions = data;
  cacheExpiresAt = now + CACHE_TTL_MS;
  return data;
}

export function invalidateMasterConfigCache() {
  cachedOptions = null;
  cacheExpiresAt = 0;
}

export function useMasterConfigFormOptions(enabled = true) {
  const [options, setOptions] = useState<MasterConfigFormOptions | null>(cachedOptions);
  const [loading, setLoading] = useState(enabled && !cachedOptions);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const refetch = useCallback(async (force = true) => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const data = await loadFormOptions(force);
      if (mountedRef.current) setOptions(data);
    } catch (e) {
      if (mountedRef.current) {
        setError(e instanceof Error ? e.message : '공통 코드를 불러오지 못했습니다.');
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    mountedRef.current = true;
    if (!enabled) return;
    void refetch(!cachedOptions);
    return () => {
      mountedRef.current = false;
    };
  }, [enabled, refetch]);

  return { options, loading, error, refetch };
}
