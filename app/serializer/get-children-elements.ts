import type { CurrentElementEntity } from 'app/entities';

export function getChildrenElements(element: CurrentElementEntity.Element, elements: CurrentElementEntity.Elements) {
  if (element.type === 'wrapper') {
    return element.children.map(childId => elements[childId]);
  }
  return undefined;
}
