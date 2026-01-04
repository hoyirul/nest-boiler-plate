export function generateNextCode(
  prefix: string,
  total?: number,
  length = 3
): string {
  if (!total) {
    return `${prefix}${'0'.repeat(length)}`;
  }

  const numberPart = total.toString().padStart(length, '0');
  const nextNumber = parseInt(numberPart, 10) + 1;

  return `${prefix}${String(nextNumber).padStart(length, '0')}`;
}
