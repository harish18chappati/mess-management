import { useState, useEffect } from 'react';
import {
  Info,
  Settings2,
  Lock,
  Plus,
  Minus,
  CheckCircle,
  CircleAlert,
  RefreshCw,
  Save,
  Radio,
} from 'lucide-react';
import type { MessData } from '@/data/messData';
import MessCard from './MessCard';
import { updateMessQueueStatus } from '@/services/messStatusService';

interface WaitingSectionProps {
  messes: MessData[];
  isLoading: boolean;
  isLive?: boolean;
  error: string | null;
  onRetry: () => void;
  onMessUpdated: () => void;
  selectedMessId: number | null;
  onSelectMess: (id: number) => void;
  onViewMenu: () => void;
}

export default function WaitingSection({
  messes,
  isLoading,
  isLive = false,
  error,
  onRetry,
  onMessUpdated,
  selectedMessId,
  onSelectMess,
  onViewMenu,
}: WaitingSectionProps) {
  // Staff Queue Management State (No Auth, Staff PIN Protected)
  const [editMessId, setEditMessId] = useState<number>(1);
  const [editStatus, setEditStatus] = useState<'OPEN' | 'CLOSED'>('OPEN');
  const [editQueueCount, setEditQueueCount] = useState<number>(8);
  const [editOpenCounters, setEditOpenCounters] = useState<number>(3);
  const [staffPin, setStaffPin] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Sync form inputs when selected mess changes or messes reload
  useEffect(() => {
    const current = messes.find((m) => m.id === editMessId);
    if (current) {
      setEditStatus(current.status);
      setEditQueueCount(current.queueCount);
      setEditOpenCounters(current.openCounters);
    }
  }, [editMessId, messes]);

  function handleSelectEditMess(id: number) {
    setEditMessId(id);
    setSaveSuccess(null);
    setSaveError(null);
    const target = messes.find((m) => m.id === id);
    if (target) {
      setEditStatus(target.status);
      setEditQueueCount(target.queueCount);
      setEditOpenCounters(target.openCounters);
    }
  }

  async function handleSaveStatus(e: React.FormEvent) {
    e.preventDefault();
    setSaveSuccess(null);
    setSaveError(null);

    if (!staffPin.trim()) {
      setSaveError('Please enter the Staff PIN to authorize this change.');
      return;
    }

    setIsSaving(true);
    try {
      await updateMessQueueStatus({
        messId: editMessId,
        status: editStatus,
        queueCount: editQueueCount,
        openCounters: editOpenCounters,
        staffPin: staffPin.trim(),
      });

      const messName = messes.find((m) => m.id === editMessId)?.name || `Mess ${editMessId}`;
      setSaveSuccess(`${messName} updated successfully! Queue: ${editQueueCount}, Status: ${editStatus}.`);
      onMessUpdated();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to update mess queue status.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section id="waiting" className="relative py-20 md:py-28 px-4 md:px-6 bg-cinema-alt">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 reveal-hidden">
          <span className="section-eyebrow">Live Queue Status</span>
          <h2 className="section-heading mt-3">Find Your Next Meal</h2>
          <p className="section-subtitle">Less waiting. More time for campus life.</p>
        </div>

        {/* Live data notice */}
        <div className="mb-8 reveal-hidden reveal-hidden-delay-1 flex items-center gap-3 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-cinema-amber">
            <Info className="w-3.5 h-3.5" />
            {isLoading
              ? 'Loading live mess status…'
              : isLive
                ? 'Live mess status from Supabase'
                : error
                  ? 'Demo data (Live status unavailable)'
                  : 'Demo data — not live'}
          </div>
          {isLive && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-[11px] font-medium text-green-400">
              <Radio className="w-3 h-3 animate-pulse" />
              Realtime Synced
            </span>
          )}
          {error && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="text-xs text-cinema-amber hover:underline cursor-pointer"
            >
              Retry live connection
            </button>
          )}
        </div>

        {/* Mess cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {messes.length === 0 ? (
            <div className="col-span-full py-12 text-center cinema-card p-8">
              <p className="text-cinema-secondary text-sm">
                No mess status records are available yet.
              </p>
            </div>
          ) : (
            messes.map((mess, i) => (
              <div
                key={mess.id}
                className={`reveal-hidden reveal-hidden-delay-${i + 1}`}
              >
                <MessCard
                  mess={mess}
                  isSelected={selectedMessId === mess.id}
                  onSelect={() => onSelectMess(mess.id)}
                  onViewMenu={onViewMenu}
                />
              </div>
            ))
          )}
        </div>

        {/* Counter info */}
        <div className="mt-10 cinema-card p-5 max-w-2xl mx-auto reveal-hidden">
          <p className="text-cinema-secondary text-xs md:text-sm text-center leading-relaxed">
            Each mess has four counters: one North Indian, two South Indian, and
            one Vegetarian. Students may use any counter. Wait time is estimated
            for the entire mess, not per counter.
          </p>
        </div>

        {/* Simple Management Controls (No Auth, Staff PIN Protected) */}
        <div className="mt-12 cinema-card p-6 md:p-8 border border-white/10 reveal-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-cinema-amber" />
                <h3 className="font-serif text-xl font-bold text-cinema-text">
                  Mess Queue Controls
                </h3>
                <span className="text-[10px] bg-cinema-amber/15 text-cinema-amber px-2 py-0.5 rounded font-mono font-semibold border border-cinema-amber/30">
                  Staff Update
                </span>
              </div>
              <p className="text-xs text-cinema-secondary mt-1">
                Select a mess to adjust live queue size, status, and open counters.
              </p>
            </div>

            {/* Mess Selector Pills */}
            <div className="flex items-center gap-1.5 bg-cinema-bg/70 p-1 rounded-xl border border-white/10">
              {messes.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSelectEditMess(m.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    editMessId === m.id
                      ? 'bg-cinema-amber text-cinema-bg shadow-amber-glow font-bold'
                      : 'text-cinema-secondary hover:text-cinema-text'
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSaveStatus} className="mt-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* 1. Status Toggle */}
              <div className="bg-cinema-bg/50 p-4 rounded-xl border border-white/10 space-y-2">
                <label className="block text-xs font-semibold text-cinema-text">
                  Mess Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditStatus('OPEN');
                      if (editOpenCounters === 0) setEditOpenCounters(3);
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                      editStatus === 'OPEN'
                        ? 'bg-green-500/20 border-green-500 text-green-400 shadow-sm'
                        : 'bg-cinema-bg/40 border-white/10 text-cinema-secondary hover:text-cinema-text'
                    }`}
                  >
                    ● OPEN
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditStatus('CLOSED');
                      setEditOpenCounters(0);
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                      editStatus === 'CLOSED'
                        ? 'bg-red-500/20 border-red-500 text-red-400 shadow-sm'
                        : 'bg-cinema-bg/40 border-white/10 text-cinema-secondary hover:text-cinema-text'
                    }`}
                  >
                    ● CLOSED
                  </button>
                </div>
              </div>

              {/* 2. Queue Count Stepper */}
              <div className="bg-cinema-bg/50 p-4 rounded-xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="queue-input" className="block text-xs font-semibold text-cinema-text">
                    Queue Count
                  </label>
                  <span className="text-[10px] text-cinema-secondary">Students in line</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={editQueueCount <= 0}
                    onClick={() => setEditQueueCount((prev) => Math.max(0, prev - 1))}
                    className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-cinema-text flex items-center justify-center hover:bg-white/10 disabled:opacity-30"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    id="queue-input"
                    type="number"
                    min={0}
                    max={500}
                    value={editQueueCount}
                    onChange={(e) => setEditQueueCount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="flex-1 bg-cinema-bg border border-white/15 rounded-lg py-1.5 text-center text-sm font-bold text-cinema-text focus:outline-none focus:border-cinema-amber"
                  />
                  <button
                    type="button"
                    onClick={() => setEditQueueCount((prev) => prev + 1)}
                    className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-cinema-text flex items-center justify-center hover:bg-white/10"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 3. Open Counters (0 to 4) */}
              <div className="bg-cinema-bg/50 p-4 rounded-xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-cinema-text">
                    Open Counters
                  </label>
                  <span className="text-[10px] text-cinema-secondary">Out of 4 total</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[0, 1, 2, 3, 4].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      disabled={editStatus === 'CLOSED' && cnt > 0}
                      onClick={() => setEditOpenCounters(cnt)}
                      className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                        editOpenCounters === cnt
                          ? 'bg-cinema-amber border-cinema-amber text-cinema-bg'
                          : 'bg-cinema-bg/40 border-white/10 text-cinema-secondary hover:text-cinema-text disabled:opacity-20'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Row: Staff PIN + Save Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 max-w-sm">
                <Lock className="w-4 h-4 text-cinema-secondary flex-shrink-0" />
                <input
                  type="password"
                  value={staffPin}
                  onChange={(e) => setStaffPin(e.target.value)}
                  placeholder="Staff PIN (Default: 1234)"
                  className="bg-cinema-bg/70 border border-white/15 rounded-lg px-3 py-2 text-xs text-cinema-text placeholder:text-cinema-secondary/50 focus:outline-none focus:border-cinema-amber w-full font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="btn-amber text-xs font-bold py-2.5 px-6 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Saving to Supabase…
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    Save Queue Update
                  </>
                )}
              </button>
            </div>

            {/* Feedback Banners */}
            {saveSuccess && (
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs flex items-center gap-2 animate-fade-in">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>{saveSuccess}</span>
              </div>
            )}
            {saveError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 animate-fade-in">
                <CircleAlert className="w-4 h-4 flex-shrink-0" />
                <span>{saveError}</span>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
