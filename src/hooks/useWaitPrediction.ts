import { useEffect, useState } from 'react';
import { MESS_TIMINGS, type MessData } from '@/data/messData';

interface PredictionResponse {
  predicted_wait_minutes: number;
  status: 'demo_prediction';
}

const API_BASE_URL = 'http://127.0.0.1:8000';
const UNAVAILABLE_RETRY_DELAY_MS = 30_000;
let apiUnavailableUntil = 0;
let apiHealthCheck: Promise<boolean> | null = null;

function isPredictionResponse(value: unknown): value is PredictionResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'predicted_wait_minutes' in value &&
    typeof value.predicted_wait_minutes === 'number' &&
    Number.isFinite(value.predicted_wait_minutes) &&
    value.predicted_wait_minutes >= 0 &&
    'status' in value &&
    value.status === 'demo_prediction'
  );
}

function checkApiAvailability(): Promise<boolean> {
  if (Date.now() < apiUnavailableUntil) return Promise.resolve(false);
  if (apiHealthCheck) return apiHealthCheck;

  apiHealthCheck = fetch(`${API_BASE_URL}/`)
    .then((response) => response.ok)
    .catch(() => false)
    .then((available) => {
      apiUnavailableUntil = available
        ? 0
        : Date.now() + UNAVAILABLE_RETRY_DELAY_MS;
      return available;
    })
    .finally(() => {
      apiHealthCheck = null;
    });

  return apiHealthCheck;
}

function getPredictionContext(): { meal: string; day: string } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const currentMinutes = Number(values.hour) * 60 + Number(values.minute);
  const currentDay = values.weekday;

  const activeMealIndex = MESS_TIMINGS.findIndex((meal) => {
    const start = meal.startHour * 60 + meal.startMinute;
    const end = meal.endHour * 60 + meal.endMinute;
    return currentMinutes >= start && currentMinutes < end;
  });
  const nextMealIndex =
    activeMealIndex >= 0
      ? activeMealIndex
      : MESS_TIMINGS.findIndex(
          (meal) => currentMinutes < meal.startHour * 60 + meal.startMinute
        );
  const wrapsToNextDay = activeMealIndex < 0 && nextMealIndex < 0;
  const mealIndex = wrapsToNextDay ? 0 : nextMealIndex;
  const weekdays = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const dayIndex = weekdays.indexOf(currentDay);
  const predictionDay =
    dayIndex < 0
      ? currentDay
      : weekdays[(dayIndex + (wrapsToNextDay ? 1 : 0)) % weekdays.length];

  return {
    meal: MESS_TIMINGS[mealIndex].type,
    day: predictionDay,
  };
}

export function useWaitPrediction(mess: MessData) {
  const [predictedWait, setPredictedWait] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (mess.status !== 'OPEN' || mess.openCounters === 0) {
      setPredictedWait(null);
      setLoading(false);
      setError(false);
      return;
    }

    const controller = new AbortController();

    async function getPrediction() {
      setLoading(true);
      setError(false);
      setPredictedWait(null);

      try {
        if (!(await checkApiAvailability())) {
          setError(true);
          return;
        }

        const { meal, day } = getPredictionContext();
        const response = await fetch(`${API_BASE_URL}/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            queue_size: mess.queueCount,
            open_counters: mess.openCounters,
            meal,
            day,
          }),
        });

        if (!response.ok) {
          apiUnavailableUntil = Date.now() + UNAVAILABLE_RETRY_DELAY_MS;
          throw new Error('Prediction request failed.');
        }

        const result: unknown = await response.json();
        if (!isPredictionResponse(result)) {
          throw new Error('Prediction API returned an invalid response.');
        }

        setPredictedWait(result.predicted_wait_minutes);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void getPrediction();

    return () => controller.abort();
  }, [mess.status, mess.queueCount, mess.openCounters]);

  return { predictedWait, loading, error };
}
