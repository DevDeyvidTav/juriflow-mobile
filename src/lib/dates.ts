function validDay(year: number, month: number, day: number): boolean {
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function toCaptureDate(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const year = Number(iso[1]);
    const month = Number(iso[2]);
    const day = Number(iso[3]);
    if (!validDay(year, month, day)) throw new Error('Data da captação inválida.');
    return `${iso[1]}-${iso[2]}-${iso[3]}`;
  }
  const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) throw new Error('Data da captação inválida. Use DD/MM/AAAA.');
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (!validDay(year, month, day)) throw new Error('Data da captação inválida.');
  return `${match[3]}-${match[2]}-${match[1]}`;
}

function dateParts(iso: string): Date | null {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(iso: string): string {
  const date = dateParts(iso);
  if (!date) return iso;
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function formatTime(iso: string): string {
  const date = dateParts(iso);
  if (!date) return '';
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatWhen(iso: string): string {
  const date = formatDate(iso);
  const time = formatTime(iso);
  return time ? `${date} ${time}` : date;
}

export function toIsoDateTime(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/);
  if (!match) throw new Error('Data/hora inválida. Use DD/MM/AAAA HH:mm');
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  if (!validDay(year, month, day) || hour > 23 || minute > 59) {
    throw new Error('Data/hora inválida.');
  }
  const date = new Date(year, month - 1, day, hour, minute, 0, 0);
  return date.toISOString();
}
