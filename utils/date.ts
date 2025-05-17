import { startOfWeek, endOfWeek, format, subWeeks } from 'date-fns';
import { WeekList } from '../types/types';

export function getWeekLabel(date: Date = new Date()) {
  const startOf = (d: Date) => startOfWeek(new Date(d.setHours(0, 0, 0, 0)), { weekStartsOn: 1 });

  const weekStart = startOf(date);
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 });

  const today = startOf(new Date());
  const lastWeek = startOf(subWeeks(today, 1));
  const nextWeek = startOf(subWeeks(today, -1));

  if (weekStart.getTime() === today.getTime()) {
    return 'This Week';
  } else if (weekStart.getTime() === lastWeek.getTime()) {
    return 'Last Week';
  } else if (weekStart.getTime() === nextWeek.getTime()) {
    return 'Next Week';
  }

  return `Week of ${format(weekStart, 'MMM d')}–${format(weekEnd, 'd')}`;
}


export function getPastWeeks(count: number): Date[] {
  return Array.from({ length: count }, (_, i) => subWeeks(new Date(), i));
}

export function getAvailableWeeks(weeklyLists: WeekList[]): Date[] {
  return weeklyLists.map(w => new Date(w.weekStart)).sort((a, b) => {
    return b.getTime() - a.getTime();
  });
}
