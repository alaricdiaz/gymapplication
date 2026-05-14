import { differenceInCalendarDays, formatISO, startOfDay, startOfWeek, addDays } from 'date-fns';

export function computeStreak(isoDates: string[]): number {
  if (isoDates.length === 0) return 0;
  const uniqDays = new Set(
    isoDates.map((d) => formatISO(startOfDay(new Date(d)), { representation: 'date' })),
  );
  let streak = 0;
  let cursor = startOfDay(new Date());
  if (!uniqDays.has(formatISO(cursor, { representation: 'date' }))) {
    cursor = addDays(cursor, -1);
  }
  while (uniqDays.has(formatISO(cursor, { representation: 'date' }))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function computeWeekDays(isoDates: string[]): { label: string; active: boolean }[] {
  const today = startOfDay(new Date());
  const monday = startOfWeek(today, { weekStartsOn: 1 });
  const activeKeys = new Set(
    isoDates.map((d) => formatISO(startOfDay(new Date(d)), { representation: 'date' })),
  );
  return Array.from({ length: 7 }).map((_, idx) => {
    const day = addDays(monday, idx);
    const key = formatISO(day, { representation: 'date' });
    const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    return {
      label: labels[idx],
      active: activeKeys.has(key) && differenceInCalendarDays(today, day) >= 0,
    };
  });
}
