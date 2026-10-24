import { CAMPUS_IMAGE, DEMO_MESSES, MESS_IMAGES, type MessData } from '@/data/messData';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

interface MessStatusRow {
  id: number;
  name: string;
  status: 'OPEN' | 'CLOSED';
  queue_count: number;
  open_counters: number;
  total_counters: number;
  updated_at: string;
  wait_minutes?: number | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseMessStatusRow(value: unknown): MessStatusRow {
  if (
    !isRecord(value) ||
    typeof value.id !== 'number' ||
    !Number.isSafeInteger(value.id) ||
    value.id <= 0 ||
    typeof value.name !== 'string' ||
    value.name.trim() === '' ||
    (value.status !== 'OPEN' && value.status !== 'CLOSED') ||
    typeof value.queue_count !== 'number' ||
    !Number.isSafeInteger(value.queue_count) ||
    value.queue_count < 0 ||
    typeof value.open_counters !== 'number' ||
    !Number.isSafeInteger(value.open_counters) ||
    value.open_counters < 0 ||
    typeof value.total_counters !== 'number' ||
    !Number.isSafeInteger(value.total_counters) ||
    value.total_counters < value.open_counters ||
    typeof value.updated_at !== 'string'
  ) {
    throw new Error('Supabase returned a mess_status record with an unexpected shape.');
  }

  return {
    id: value.id,
    name: value.name,
    status: value.status,
    queue_count: value.queue_count,
    open_counters: value.open_counters,
    total_counters: value.total_counters,
    updated_at: value.updated_at,
    wait_minutes: typeof value.wait_minutes === 'number' ? value.wait_minutes : null,
  };
}

function getAgeInMinutes(updatedAt: string): number | null {
  const updatedAtMs = Date.parse(updatedAt);
  if (!Number.isFinite(updatedAtMs)) return null;
  return Math.max(0, Math.floor((Date.now() - updatedAtMs) / 60_000));
}

function formatLastUpdated(ageInMinutes: number | null): string {
  if (ageInMinutes === null) return 'Unavailable';
  if (ageInMinutes < 1) return 'Just now';
  if (ageInMinutes < 60) return `${ageInMinutes} min ago`;
  return `${Math.floor(ageInMinutes / 60)} hr ago`;
}

function toMessData(row: MessStatusRow): MessData {
  const ageInMinutes = getAgeInMinutes(row.updated_at);

  let waitMinutes: number | null = null;
  if (row.status === 'OPEN') {
    if (typeof row.wait_minutes === 'number') {
      waitMinutes = row.wait_minutes;
    } else if (row.open_counters > 0) {
      // Estimate ~1.5 - 2 minutes per queue person per open counter
      waitMinutes = Math.max(2, Math.round((row.queue_count / row.open_counters) * 1.5));
    }
  }

  return {
    id: row.id,
    name: row.name,
    status: row.status,
    waitMinutes,
    queueCount: row.queue_count,
    openCounters: row.open_counters,
    totalCounters: row.total_counters,
    lastUpdated: formatLastUpdated(ageInMinutes),
    dataFresh:
      ageInMinutes === null
        ? 'Unavailable'
        : ageInMinutes <= 5
          ? 'Fresh'
          : 'Stale',
    image: MESS_IMAGES[row.id] ?? CAMPUS_IMAGE,
  };
}

export async function fetchMessStatuses(): Promise<{ data: MessData[]; isLive: boolean }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { data: DEMO_MESSES, isLive: false };
  }

  try {
    const { data, error } = await supabase
      .from('mess_status')
      .select('id,name,status,queue_count,open_counters,total_counters,updated_at')
      .order('id');

    if (error || !data || data.length === 0) {
      console.warn('Supabase mess_status not available or empty, using demo messes:', error?.message);
      return { data: DEMO_MESSES, isLive: false };
    }

    const liveData = (data as unknown[]).map(parseMessStatusRow).map(toMessData);
    return { data: liveData, isLive: true };
  } catch (err) {
    console.warn('Failed to load mess status from Supabase, falling back to demo messes:', err);
    return { data: DEMO_MESSES, isLive: false };
  }
}

export async function updateMessQueueStatus(params: {
  messId: number;
  status: 'OPEN' | 'CLOSED';
  queueCount: number;
  openCounters: number;
  staffPin: string;
}): Promise<MessData> {
  const { messId, status, queueCount, openCounters, staffPin } = params;

  if (!staffPin || staffPin.trim() === '') {
    throw new Error('Please enter the Staff PIN to authorize this update.');
  }

  if (queueCount < 0 || queueCount > 500) {
    throw new Error('Queue count must be between 0 and 500.');
  }

  if (openCounters < 0 || openCounters > 4) {
    throw new Error('Open counters must be between 0 and 4.');
  }

  const finalOpenCounters = status === 'CLOSED' ? 0 : openCounters;

  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.rpc('update_mess_queue_status', {
      p_mess_id: messId,
      p_status: status,
      p_queue_count: queueCount,
      p_open_counters: finalOpenCounters,
      p_staff_pin: staffPin.trim(),
    });

    if (error) {
      if (error.message.includes('function update_mess_queue_status') || error.code === 'PGRST202') {
        throw new Error(
          'Database function update_mess_queue_status not found in Supabase. Please run the migration script in Supabase SQL Editor.'
        );
      }
      throw new Error(error.message || 'Failed to update mess queue status in Supabase.');
    }

    return toMessData(parseMessStatusRow(data));
  }

  // Local demo fallback if Supabase is offline
  if (staffPin.trim() !== '1234') {
    throw new Error('Invalid Staff PIN (Default demo PIN is 1234).');
  }

  const existing = DEMO_MESSES.find((m) => m.id === messId);
  if (!existing) throw new Error(`Mess #${messId} not found.`);

  existing.status = status;
  existing.queueCount = queueCount;
  existing.openCounters = finalOpenCounters;
  existing.lastUpdated = 'Just now';
  existing.dataFresh = 'Fresh';
  return existing;
}
