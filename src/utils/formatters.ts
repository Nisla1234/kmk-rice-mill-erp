export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function prevDayISO(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function fmtDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function fmtNum(n: number): string {
  return Number(n || 0).toLocaleString('en-LK', { maximumFractionDigits: 0 });
}

export function fmtLKR(n: number): string {
  return 'Rs. ' + Number(n || 0).toLocaleString('en-LK', { maximumFractionDigits: 0 });
}

export function fmtCurrency(n: number): string {
  return fmtLKR(n);
}

export function fmtKg(n: number): string {
  return fmtNum(n) + ' kg';
}

export function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

export function upcomingSaturdayISO(): string {
  const d = new Date();
  const day = d.getDay(); // 0=Sun..6=Sat
  const diff = (6 - day + 7) % 7;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

export function isSaturday(dateStr: string): boolean {
  return new Date(dateStr + 'T00:00:00').getDay() === 6;
}
