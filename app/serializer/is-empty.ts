export function isEmpty<T>(value: T) {
  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === 'object') {
    return Object.keys(value as any).length === 0;
  }

  return false;
}
