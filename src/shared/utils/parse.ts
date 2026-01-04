// src/shared/utils/parse.ts
export type DateFormatType = 'datetime' | 'date' | 'time';

export function formatDate(
  value: string | Date | null | undefined,
  format: DateFormatType = 'datetime'
): string | null {
  if (!value) return null;

  const date = new Date(value);

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');

  switch (format) {
    case 'datetime':
      return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
    case 'date':
      return `${yyyy}-${mm}-${dd}`;
    case 'time':
      return `${hh}:${min}:${ss}`;
    default:
      return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
  }
}
