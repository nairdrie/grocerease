import { startOfWeek, endOfWeek, format, subWeeks } from 'date-fns';

export function getWeekLabel(date: Date = new Date()) {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
  return `Week of ${format(weekStart, 'MMM d')}–${format(weekEnd, 'd')}`;
}

export function getPastWeeks(count: number): Date[] {
  return Array.from({ length: count }, (_, i) => subWeeks(new Date(), i));
}
