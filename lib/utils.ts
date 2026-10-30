export const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

export function formatBulanIndo(ym: string): string {
  if (!ym || ym.length <= 4) return ym || '';
  const parts = ym.split('-');
  if (parts.length >= 2) {
    const idx = parseInt(parts[1], 10) - 1;
    return `${MONTH_NAMES[idx] || parts[1]} ${parts[0]}`;
  }
  return ym;
}

export function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}
