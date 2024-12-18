import type { CurrentElementEntity } from 'app/entities';

export function isSection(element: CurrentElementEntity.Element | CurrentElementEntity.Element[]): boolean {
  if (Array.isArray(element)) {
    return element.some(el => isSection(el));
  }
  return element.type === 'wrapper' && !element.parent;
}
