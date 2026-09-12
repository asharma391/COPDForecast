/** Resolve required elements from the fixed application template. */
export function element<T extends HTMLElement = HTMLElement>(
  selector: string,
  root: ParentNode = document,
): T {
  const match = root.querySelector<T>(selector);
  if (!match) throw new Error(`Missing application element: ${selector}`);
  return match;
}
export function byId<T extends HTMLElement = HTMLElement>(id: string): T {
  return element<T>(`#${id}`);
}
